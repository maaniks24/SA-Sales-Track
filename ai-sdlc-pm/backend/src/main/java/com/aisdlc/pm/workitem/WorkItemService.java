package com.aisdlc.pm.workitem;

import com.aisdlc.pm.audit.AuditService;
import com.aisdlc.pm.common.ApiException;
import com.aisdlc.pm.common.SequenceService;
import com.aisdlc.pm.gate.GateService;
import com.aisdlc.pm.process.ProcessDefinition.StageDef;
import com.aisdlc.pm.process.ProcessService;
import com.aisdlc.pm.project.Project;
import com.aisdlc.pm.project.ProjectService;
import com.aisdlc.pm.user.Role;
import com.aisdlc.pm.user.User;
import com.aisdlc.pm.user.UserService;
import com.aisdlc.pm.workitem.WorkItem.CheckItem;
import com.aisdlc.pm.workitem.WorkItem.StageState;
import com.aisdlc.pm.workitem.WorkItem.StageState.Status;
import java.time.Instant;
import java.time.Year;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

@Service
public class WorkItemService {
    public record CreateWorkItem(WorkItem.Type type, WorkItem.SrKind srKind, String title, String description, String module, List<String> surfaces,
                                 String priority, String severity, String crClass, String assigneeId, Integer storyPoints, String sprintId, List<String> labels) { }
    public record UpdateWorkItem(String title, String description, String module, List<String> surfaces, String priority, String severity, String crClass,
                                 String assigneeId, Integer storyPoints, String sprintId, List<String> labels, String missedGate) { }

    private static final Set<String> PRIORITIES = Set.of("HIGHEST", "HIGH", "MEDIUM", "LOW");
    private static final Set<String> SEVERITIES = Set.of("P1", "P2", "P3", "P4");

    private final WorkItemRepository repo;
    private final ProjectService projects;
    private final ProcessService process;
    private final SequenceService seq;
    private final UserService users;
    private final GateService gates;
    private final AuditService audit;
    private final MongoTemplate mongo;

    public WorkItemService(WorkItemRepository repo, ProjectService projects, ProcessService process, SequenceService seq, UserService users,
                           GateService gates, AuditService audit, MongoTemplate mongo) {
        this.repo = repo; this.projects = projects; this.process = process; this.seq = seq; this.users = users;
        this.gates = gates; this.audit = audit; this.mongo = mongo;
    }

    public WorkItem get(String key) { return repo.findByKey(key.toUpperCase()).orElseThrow(() -> ApiException.notFound("Work item", key)); }

    public List<WorkItem> list(String projectId, String type, String column, String assignee, String sprintId, String q) {
        List<Criteria> c = new ArrayList<>(List.of(Criteria.where("projectId").is(projectId)));
        if (type != null && !type.isBlank()) c.add(Criteria.where("type").is(type));
        if (column != null && !column.isBlank()) c.add(Criteria.where("column").is(column));
        if (assignee != null && !assignee.isBlank()) c.add(Criteria.where("assigneeId").is(assignee));
        if (sprintId != null && !sprintId.isBlank()) c.add(Criteria.where("sprintId").is("none".equals(sprintId) ? null : sprintId));
        List<WorkItem> out = mongo.find(new Query(new Criteria().andOperator(c.toArray(new Criteria[0]))), WorkItem.class);
        if (q != null && !q.isBlank()) {
            String s = q.toLowerCase();
            out = out.stream().filter(w -> (w.key + " " + w.title + " " + w.processId + " " + String.join(" ", w.requirementIds)).toLowerCase().contains(s)).toList();
        }
        return out.stream().sorted(Comparator.comparing((WorkItem w) -> w.column).thenComparingDouble(w -> w.rank)).toList();
    }

    public WorkItem create(String projectId, CreateWorkItem r) {
        Project p = projects.get(projectId);
        if (r.type() == null) throw ApiException.badRequest("Choose a work type: NF, CR or SR.");
        if (r.title() == null || r.title().isBlank()) throw ApiException.badRequest("Give the work item a title.");
        if (r.type() == WorkItem.Type.SR && r.srKind() == null) throw ApiException.badRequest("For an SR, say whether it is a DEFECT or a SERVICE request.");
        if (r.type() == WorkItem.Type.SR && r.srKind() == WorkItem.SrKind.DEFECT && (r.severity() == null || !SEVERITIES.contains(r.severity()))) throw ApiException.badRequest("Defects need a severity from P1 to P4.");
        WorkItem w = new WorkItem();
        w.projectId = p.id;
        w.key = p.key + "-" + seq.next("wi-" + p.key);
        w.type = r.type(); w.srKind = r.type() == WorkItem.Type.SR ? r.srKind() : null;
        w.crClass = r.type() == WorkItem.Type.CR ? (r.crClass() == null ? "MINOR" : r.crClass()) : null;
        w.title = r.title().trim(); w.description = r.description(); w.module = r.module();
        if (r.surfaces() != null) w.surfaces = r.surfaces();
        w.priority = r.priority() != null && PRIORITIES.contains(r.priority()) ? r.priority() : "MEDIUM";
        w.severity = r.type() == WorkItem.Type.SR ? r.severity() : null;
        w.assigneeId = r.assigneeId(); w.storyPoints = r.storyPoints(); w.sprintId = r.sprintId();
        if (r.labels() != null) w.labels = r.labels();
        w.reporterId = AuditService.currentActor();
        w.processId = processId(w);
        w.stages = initialStages(w);
        w.rank = System.currentTimeMillis();
        w.createdAt = w.updatedAt = Instant.now();
        WorkItem saved = repo.save(w);
        audit.record("WORKITEM_CREATED", "WORK_ITEM", saved.key, p.id, "Created " + saved.workTypeKey() + " " + saved.key + ": " + saved.title,
            Map.of("processId", String.valueOf(saved.processId)));
        return saved;
    }

    private String processId(WorkItem w) {
        int year = Year.now().getValue();
        return switch (w.workTypeKey()) {
            case "CR" -> String.format("CR-%d-%03d", year, seq.next("cr-" + year));
            case "SR_SERVICE" -> String.format("SR-%d-%05d", year, seq.next("sr-" + year));
            case "SR_DEFECT" -> String.format("BUG-%s-%03d", w.module == null ? "GEN" : w.module, seq.next("bug-" + (w.module == null ? "GEN" : w.module)));
            default -> null;
        };
    }

    Map<String, StageState> initialStages(WorkItem w) {
        Map<String, StageState> out = new LinkedHashMap<>();
        for (StageDef s : process.stages()) {
            StageState st = new StageState();
            st.stageId = s.id();
            st.applicability = process.applicability(w.workTypeKey(), s.id());
            if ("CR".equals(w.workTypeKey()) && "S3".equals(s.id())) st.applicability = "MAJOR".equals(w.crClass) ? "FULL" : "SKIP";
            if ("SKIP".equals(st.applicability)) { st.status = Status.SKIPPED; st.skipReason = "Not applicable to " + w.workTypeKey() + " by default (process 3.5)"; }
            List<String> items = process.checklist(w.workTypeKey(), s.id());
            for (int i = 0; i < items.size(); i++) { CheckItem c = new CheckItem(); c.index = i; c.text = items.get(i); st.checklist.add(c); }
            out.put(s.id(), st);
        }
        return out;
    }

    public WorkItem update(String key, UpdateWorkItem r) {
        WorkItem w = get(key);
        Map<String, Object> changes = new LinkedHashMap<>();
        if (r.title() != null && !r.title().equals(w.title)) { changes.put("title", r.title()); w.title = r.title(); }
        if (r.description() != null) { w.description = r.description(); changes.put("description", "updated"); }
        if (r.module() != null) { w.module = r.module(); changes.put("module", r.module()); }
        if (r.surfaces() != null) w.surfaces = r.surfaces();
        if (r.priority() != null && PRIORITIES.contains(r.priority())) { changes.put("priority", r.priority()); w.priority = r.priority(); }
        if (r.severity() != null && SEVERITIES.contains(r.severity())) { changes.put("severity", r.severity()); w.severity = r.severity(); }
        if (r.assigneeId() != null) { changes.put("assignee", r.assigneeId()); w.assigneeId = r.assigneeId().isBlank() ? null : r.assigneeId(); }
        if (r.storyPoints() != null) { changes.put("storyPoints", r.storyPoints()); w.storyPoints = r.storyPoints(); }
        if (r.sprintId() != null) { changes.put("sprint", r.sprintId()); w.sprintId = r.sprintId().isBlank() ? null : r.sprintId(); }
        if (r.labels() != null) w.labels = r.labels();
        if (r.missedGate() != null) { changes.put("missedGate", r.missedGate()); w.missedGate = r.missedGate().isBlank() ? null : r.missedGate(); }
        if (r.crClass() != null && w.type == WorkItem.Type.CR && !r.crClass().equals(w.crClass)) {
            StageState s3 = w.stage("S3");
            if (s3.status == Status.APPROVED) throw ApiException.conflict("Design (S3) is already approved; the CR class can no longer change.");
            w.crClass = r.crClass();
            s3.applicability = "MAJOR".equals(w.crClass) ? "FULL" : "SKIP";
            s3.status = "MAJOR".equals(w.crClass) ? Status.NOT_STARTED : Status.SKIPPED;
            s3.skipReason = "MAJOR".equals(w.crClass) ? null : "Minor CR: design notes recorded in T04 section 6";
            gates.startReadyStages(w);
            changes.put("crClass", w.crClass);
        }
        w.updatedAt = Instant.now();
        WorkItem saved = repo.save(w);
        if (!changes.isEmpty()) audit.record("WORKITEM_UPDATED", "WORK_ITEM", w.key, w.projectId, "Updated " + String.join(", ", changes.keySet()), changes);
        return saved;
    }

    public WorkItem startStage(String key, String stageId) {
        WorkItem w = get(key);
        StageState st = stage(w, stageId);
        if (st.status != Status.NOT_STARTED) throw ApiException.conflict(stageId + " is already " + st.status.name().toLowerCase().replace('_', ' ') + ".");
        List<String> missing = process.stage(stageId).prerequisites().stream().filter(p -> !w.stage(p).satisfied()).toList();
        if (!missing.isEmpty()) throw ApiException.gateBlocked(stageId + " cannot start before " + String.join(", ", missing.stream().map(s -> s.replace('S', 'G')).toList()) + ".", missing);
        st.status = Status.IN_PROGRESS; st.startedAt = Instant.now();
        if (st.ownerId == null) st.ownerId = AuditService.currentActor();
        w.updatedAt = Instant.now();
        WorkItem saved = repo.save(w);
        audit.record("STAGE_STARTED", "WORK_ITEM", w.key, w.projectId, w.key + " " + stageId + " started", Map.of("stage", stageId));
        return saved;
    }

    /** Conditional stages can be switched on or off with a recorded reason (process 3.5). */
    public WorkItem setApplicable(String key, String stageId, boolean applicable, String reason) {
        User me = users.current();
        if (!(me.has(Role.ARCHITECT) || me.has(Role.TECH_LEAD))) throw ApiException.forbidden("Only the Architect or a Tech Lead decides whether a stage applies.");
        if (reason == null || reason.trim().length() < 10) throw ApiException.badRequest("Record why the stage does or does not apply.");
        WorkItem w = get(key);
        StageState st = stage(w, stageId);
        if (st.status == Status.APPROVED || st.status == Status.IN_REVIEW) throw ApiException.conflict(stageId + " is " + st.status.name().toLowerCase().replace('_', ' ') + " and can no longer be skipped.");
        if ("FULL".equals(st.applicability) && !applicable) throw ApiException.conflict(stageId + " is mandatory for a " + w.workTypeKey() + " work item.");
        if (applicable) {
            st.status = Status.NOT_STARTED; st.skipReason = null;
            if ("SKIP".equals(st.applicability)) st.applicability = "CONDITIONAL";
            gates.startReadyStages(w);
        } else {
            st.status = Status.SKIPPED; st.skipReason = reason.trim();
        }
        w.updatedAt = Instant.now();
        WorkItem saved = repo.save(w);
        audit.record(applicable ? "STAGE_ACTIVATED" : "STAGE_SKIPPED", "WORK_ITEM", w.key, w.projectId, w.key + " " + stageId + (applicable ? " made applicable" : " marked not applicable") + ": " + reason.trim(), Map.of("stage", stageId));
        return saved;
    }

    public WorkItem check(String key, String stageId, int index, boolean checked, String evidence) {
        WorkItem w = get(key);
        StageState st = stage(w, stageId);
        if (st.status != Status.IN_PROGRESS) throw ApiException.conflict("Checklist items can change only while " + stageId + " is in progress.");
        CheckItem c = st.checklist.stream().filter(x -> x.index == index).findFirst().orElseThrow(() -> ApiException.notFound("Checklist item", String.valueOf(index)));
        c.checked = checked; c.evidence = evidence;
        c.checkedBy = checked ? AuditService.currentActor() : null; c.checkedAt = checked ? Instant.now() : null;
        w.updatedAt = Instant.now();
        WorkItem saved = repo.save(w);
        audit.record("CHECKLIST_UPDATED", "WORK_ITEM", w.key, w.projectId, w.key + " " + stageId + " #" + (index + 1) + (checked ? " checked" : " unchecked") + ": " + c.text,
            evidence == null ? Map.of("stage", stageId) : Map.of("stage", stageId, "evidence", evidence));
        return saved;
    }

    public WorkItem setAiUsage(String key, String stageId, String aiUsage, String aiOperator, Integer unresolved) {
        if (aiUsage == null || !Set.of("NONE", "AI_A", "AI_G").contains(aiUsage)) throw ApiException.badRequest("AI usage must be NONE, AI_A or AI_G.");
        WorkItem w = get(key);
        StageState st = stage(w, stageId);
        if (st.status == Status.APPROVED) throw ApiException.conflict(stageId + " is approved; its AI declaration is final.");
        if (!"NONE".equals(aiUsage) && (aiOperator == null || aiOperator.isBlank())) throw ApiException.badRequest("Name the person who ran the AI prompt.");
        if ("S1".equals(stageId) && "SR_DEFECT".equals(w.workTypeKey()) && !"NONE".equals(aiUsage)) {
            throw ApiException.forbidden("Root cause analysis is always manual (AI-X). AI may only summarise logs outside the RCA.");
        }
        if ("S4".equals(stageId) && "SR_DEFECT".equals(w.workTypeKey()) && ("P1".equals(w.severity) || "P2".equals(w.severity)) && "AI_G".equals(aiUsage)) {
            throw ApiException.forbidden("Fixes for P1 and P2 defects must be written manually (AI-X).");
        }
        st.aiUsage = aiUsage;
        st.aiOperator = "NONE".equals(aiUsage) ? null : aiOperator.trim();
        st.unresolvedAssumptions = unresolved == null ? 0 : Math.max(0, unresolved);
        w.updatedAt = Instant.now();
        WorkItem saved = repo.save(w);
        audit.record("AI_USAGE_DECLARED", "WORK_ITEM", w.key, w.projectId, w.key + " " + stageId + " AI usage " + aiUsage + (st.aiOperator == null ? "" : " by " + st.aiOperator),
            Map.of("stage", stageId, "unresolvedAssumptions", st.unresolvedAssumptions));
        return saved;
    }

    public WorkItem linkRequirement(String key, String reqId, boolean link) {
        WorkItem w = get(key);
        String id = reqId.trim().toUpperCase();
        if (link && !w.requirementIds.contains(id)) w.requirementIds.add(id);
        if (!link) w.requirementIds.remove(id);
        w.updatedAt = Instant.now();
        WorkItem saved = repo.save(w);
        audit.record(link ? "REQUIREMENT_LINKED" : "REQUIREMENT_UNLINKED", "WORK_ITEM", w.key, w.projectId, (link ? "Linked " : "Unlinked ") + id, null);
        return saved;
    }

    private StageState stage(WorkItem w, String stageId) {
        StageState st = w.stage(stageId);
        if (st == null) throw ApiException.notFound("Stage", stageId);
        return st;
    }
}
