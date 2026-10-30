package com.aisdlc.pm.workitem;

import com.aisdlc.pm.audit.AuditService;
import com.aisdlc.pm.common.ApiException;
import com.aisdlc.pm.gate.GateService;
import com.aisdlc.pm.process.ProcessDefinition.StageDef;
import com.aisdlc.pm.process.ProcessService;
import com.aisdlc.pm.project.Project;
import com.aisdlc.pm.project.ProjectService;
import com.aisdlc.pm.user.Role;
import com.aisdlc.pm.user.User;
import com.aisdlc.pm.user.UserService;
import com.aisdlc.pm.workitem.WorkItem.Column;
import com.aisdlc.pm.workitem.WorkItem.StageState;
import com.aisdlc.pm.workitem.WorkItem.StageState.Status;
import java.time.Instant;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.stereotype.Service;

/** Kanban board: columns follow the SDLC phases, and moving a card forward requires the gates of every earlier stage. */
@Service
public class BoardService {
    public record Card(String key, String title, String type, String srKind, String processId, String priority, String severity, String assigneeId,
                       Integer storyPoints, String column, String activeStage, boolean inReview, boolean readyToMove, int gatesDone, int gatesTotal,
                       List<String> labels, int bugs, int reworkCount, String sprintId, double rank) { }
    public record ColumnView(String column, int wipLimit, int count, boolean overLimit, List<Card> cards) { }
    public record Approval(String key, String title, String type, String stageId, String gate, String stageName, Instant submittedAt, String submittedBy, String accountableRole) { }

    private final WorkItemRepository repo;
    private final ProjectService projects;
    private final ProcessService process;
    private final GateService gates;
    private final UserService users;
    private final AuditService audit;

    public BoardService(WorkItemRepository repo, ProjectService projects, ProcessService process, GateService gates, UserService users, AuditService audit) {
        this.repo = repo; this.projects = projects; this.process = process; this.gates = gates; this.users = users; this.audit = audit;
    }

    public List<ColumnView> board(String projectId, String sprintId) {
        Project p = projects.get(projectId);
        List<WorkItem> all = repo.findByProjectId(projectId).stream()
            .filter(w -> sprintId == null || sprintId.isBlank() || Objects.equals(sprintId, w.sprintId)).toList();
        return Arrays.stream(Column.values()).map(c -> {
            List<Card> cards = all.stream().filter(w -> w.column == c).sorted(Comparator.comparingDouble(w -> w.rank)).map(this::card).toList();
            int limit = p.wipLimits == null ? 0 : p.wipLimits.getOrDefault(c.name(), 0);
            return new ColumnView(c.name(), limit, cards.size(), limit > 0 && cards.size() > limit, cards);
        }).toList();
    }

    public Card card(WorkItem w) {
        List<StageState> applicable = w.stages.values().stream().filter(s -> s.status != Status.SKIPPED).toList();
        String active = w.stages.values().stream().filter(s -> s.status == Status.IN_REVIEW || s.status == Status.IN_PROGRESS).map(s -> s.stageId).findFirst().orElse(null);
        boolean inReview = w.stages.values().stream().anyMatch(s -> s.status == Status.IN_REVIEW);
        Column next = w.column.ordinal() < Column.DONE.ordinal() ? Column.values()[w.column.ordinal() + 1] : null;
        boolean ready = next != null && missingFor(w, next).isEmpty();
        int done = (int) applicable.stream().filter(s -> s.status == Status.APPROVED).count();
        return new Card(w.key, w.title, w.type.name(), w.srKind == null ? null : w.srKind.name(), w.processId, w.priority, w.severity, w.assigneeId,
            w.storyPoints, w.column.name(), active, inReview, ready, done, applicable.size(), w.labels, w.bugs.size(), w.reworkCount, w.sprintId, w.rank);
    }

    /** Stages that must be approved (or not applicable) before a card may enter the target column. */
    public List<String> missingFor(WorkItem w, Column target) {
        return process.stages().stream()
            .filter(s -> Column.valueOf(s.boardColumn()).ordinal() < target.ordinal())
            .map(StageDef::id).filter(id -> !w.stage(id).satisfied()).toList();
    }

    public WorkItem move(String key, Column target, Double rank, String reason) {
        WorkItem w = repo.findByKey(key.toUpperCase()).orElseThrow(() -> ApiException.notFound("Work item", key));
        Project p = projects.get(w.projectId);
        Column from = w.column;
        if (target != from) {
            if (target.ordinal() > from.ordinal()) {
                List<String> missing = missingFor(w, target);
                if (!missing.isEmpty()) {
                    List<String> gatesMissing = missing.stream().map(s -> s.replace('S', 'G')).toList();
                    audit.record("BOARD_MOVE_BLOCKED", "WORK_ITEM", w.key, w.projectId, w.key + " cannot enter " + target + ": " + String.join(", ", gatesMissing) + " not approved",
                        Map.of("from", from.name(), "to", target.name()));
                    throw ApiException.gateBlocked(w.key + " cannot move to " + label(target) + " until " + String.join(", ", gatesMissing) + (gatesMissing.size() > 1 ? " are" : " is") + " approved.", gatesMissing);
                }
                int limit = p.wipLimits == null ? 0 : p.wipLimits.getOrDefault(target.name(), 0);
                if (limit > 0 && target != Column.DONE && repo.countByProjectIdAndColumn(w.projectId, target) >= limit) {
                    throw new ApiException(org.springframework.http.HttpStatus.CONFLICT, "WIP_LIMIT", label(target) + " is at its work-in-progress limit of " + limit + ". Finish something there first.");
                }
            } else {
                if (reason == null || reason.trim().length() < 5) throw ApiException.badRequest("Moving a card back is rework: record the reason.");
                User me = users.current();
                if (!(me.has(Role.TECH_LEAD) || me.has(Role.ARCHITECT) || me.has(Role.DELIVERY_MANAGER) || me.has(Role.QA_LEAD) || me.has(Role.PRODUCT_OWNER))) {
                    throw ApiException.forbidden("Only a lead, the Product Owner or the Delivery Manager can move work back.");
                }
                w.reworkCount++;
            }
            w.column = target;
            if (target == Column.INTAKE && w.stage("S0").status == Status.NOT_STARTED) {
                w.stage("S0").status = Status.IN_PROGRESS;
                w.stage("S0").startedAt = Instant.now();
            }
            gates.startReadyStages(w);
        }
        w.rank = rank != null ? rank : System.currentTimeMillis();
        w.updatedAt = Instant.now();
        WorkItem saved = repo.save(w);
        if (target != from) {
            audit.record(target.ordinal() > from.ordinal() ? "BOARD_MOVED" : "BOARD_MOVED_BACK", "WORK_ITEM", w.key, w.projectId,
                w.key + " moved from " + label(from) + " to " + label(target) + (reason == null ? "" : ": " + reason), Map.of("from", from.name(), "to", target.name()));
        }
        return saved;
    }

    public List<Approval> approvals(String projectId, boolean mineOnly) {
        User me = users.current();
        return repo.findByProjectId(projectId).stream().flatMap(w -> w.stages.values().stream().filter(s -> s.status == Status.IN_REVIEW).map(s -> {
            StageDef d = process.stage(s.stageId);
            return new Approval(w.key, w.title, w.type.name(), s.stageId, d.gate(), d.name(), s.submittedAt, s.lastDecision == null ? null : s.lastDecision.by, d.accountableRole());
        })).filter(a -> !mineOnly || me.has(Role.valueOf(a.accountableRole()))).sorted(Comparator.comparing(a -> a.submittedAt == null ? Instant.EPOCH : a.submittedAt)).toList();
    }

    static String label(Column c) { String s = c.name().toLowerCase(); return Character.toUpperCase(s.charAt(0)) + s.substring(1); }
}
