package com.aisdlc.pm.gate;

import com.aisdlc.pm.audit.AuditService;
import com.aisdlc.pm.common.ApiException;
import com.aisdlc.pm.document.DocumentRecord;
import com.aisdlc.pm.document.DocumentService;
import com.aisdlc.pm.gate.GateEvaluation.Condition;
import com.aisdlc.pm.process.ProcessDefinition.StageDef;
import com.aisdlc.pm.process.ProcessService;
import com.aisdlc.pm.user.Role;
import com.aisdlc.pm.user.User;
import com.aisdlc.pm.user.UserService;
import com.aisdlc.pm.waiver.Waiver;
import com.aisdlc.pm.waiver.WaiverService;
import com.aisdlc.pm.workitem.WorkItem;
import com.aisdlc.pm.workitem.WorkItem.BuildRef;
import com.aisdlc.pm.workitem.WorkItem.GateDecision;
import com.aisdlc.pm.workitem.WorkItem.StageState;
import com.aisdlc.pm.workitem.WorkItem.StageState.Status;
import com.aisdlc.pm.workitem.WorkItemRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

/** Applies the gate rules of the process definition to a work item stage. */
@Service
public class GateService {
    public static final Set<String> DECISIONS = Set.of("APPROVED", "APPROVED_WITH_CONDITIONS", "REJECTED");

    private final ProcessService process;
    private final DocumentService documents;
    private final WaiverService waivers;
    private final UserService users;
    private final WorkItemRepository items;
    private final AuditService audit;
    private final ApplicationEventPublisher events;

    public GateService(ProcessService process, DocumentService documents, WaiverService waivers, UserService users,
                       WorkItemRepository items, AuditService audit, ApplicationEventPublisher events) {
        this.process = process; this.documents = documents; this.waivers = waivers; this.users = users;
        this.items = items; this.audit = audit; this.events = events;
    }

    public GateEvaluation evaluate(WorkItem item, String stageId, User me) {
        StageDef def = process.stage(stageId);
        StageState st = state(item, stageId);
        List<Condition> raw = new ArrayList<>();

        List<String> missingPrereq = def.prerequisites().stream().filter(p -> !state(item, p).satisfied()).toList();
        raw.add(cond("PREREQUISITES", "Earlier gates approved", missingPrereq.isEmpty(),
            missingPrereq.isEmpty() ? "All prerequisite gates are approved or not applicable" : "Waiting for " + gates(missingPrereq)));

        boolean active = st.status == Status.IN_PROGRESS || st.status == Status.IN_REVIEW || st.status == Status.APPROVED;
        raw.add(cond("STAGE_ACTIVE", "Stage started", active, active ? "Stage is " + st.status.name().toLowerCase().replace('_', ' ') : "Start the stage first"));

        long done = st.checklist.stream().filter(c -> c.checked).count();
        raw.add(cond("CHECKLIST", "Review checklist complete", done == st.checklist.size(), done + " of " + st.checklist.size() + " items checked"));

        List<String> required = process.requiredDocs(item.workTypeKey(), stageId);
        List<DocumentRecord> docs = documents.forStage(item.id, stageId);
        List<String> missingDocs = required.stream()
            .filter(t -> docs.stream().noneMatch(d -> t.equals(d.templateId) && d.baselined && d.direction == DocumentRecord.Direction.OUTPUT)).toList();
        raw.add(cond("DOCUMENTS", "Required documents baselined", missingDocs.isEmpty(),
            required.isEmpty() ? "No documents required for this stage" : missingDocs.isEmpty() ? "Baselined: " + String.join(", ", required) : "Not yet baselined: " + String.join(", ", missingDocs)));

        if ("AI_G".equals(st.aiUsage)) {
            boolean declared = docs.stream().anyMatch(d -> "T11".equals(d.templateId) && !d.versions.isEmpty());
            int open = st.unresolvedAssumptions == null ? 0 : st.unresolvedAssumptions;
            raw.add(cond("AI_DECLARATION", "AI usage declared (T11)", declared && open == 0,
                !declared ? "AI-generated output needs a T11 declaration" : open > 0 ? open + " AI assumptions still unresolved" : "T11 attached, all assumptions resolved"));
        } else {
            raw.add(cond("AI_DECLARATION", "AI usage declared (T11)", true, "AI_A".equals(st.aiUsage) ? "AI assisted only; no declaration required" : "No AI-generated output declared"));
        }

        List<String> ci = def.requiredCiChecks() == null ? List.of() : def.requiredCiChecks();
        if (!ci.isEmpty()) {
            Map<String, String> results = latestChecks(item, ci);
            List<String> bad = ci.stream().filter(c -> !"PASS".equals(results.get(c))).toList();
            raw.add(cond("CI_CHECKS", "Automated checks pass (L1)", bad.isEmpty(),
                ci.stream().map(c -> c + ": " + results.getOrDefault(c, "not reported")).reduce((a, b) -> a + " · " + b).orElse("")));
        }

        if (def.gitEvidence() != null) {
            boolean ok = "PR_MERGED".equals(def.gitEvidence())
                ? item.pullRequests.stream().anyMatch(p -> "MERGED".equals(p.state))
                : item.pullRequests.stream().anyMatch(p -> "OPEN".equals(p.state) || "MERGED".equals(p.state));
            raw.add(cond("GIT_EVIDENCE", "PR_MERGED".equals(def.gitEvidence()) ? "Pull request merged" : "Pull request raised", ok,
                item.pullRequests.isEmpty() ? "No pull request linked yet (branch or title must carry " + item.key + ")" : item.pullRequests.size() + " pull request(s) linked"));
        }

        List<Waiver> activeWaivers = waivers.active(item.key, stageId);
        List<Condition> conditions = raw.stream().map(c -> {
            if (c.met() || !WaiverService.WAIVABLE.contains(c.code())) return c;
            Optional<Waiver> w = activeWaivers.stream().filter(x -> x.conditions.contains(c.code())).findFirst();
            return w.map(x -> new Condition(c.code(), c.label(), false, true, c.detail() + " (waived until " + x.expiry + ")", x.key)).orElse(c);
        }).toList();

        boolean allOk = conditions.stream().allMatch(Condition::ok);
        boolean ready = st.status == Status.IN_PROGRESS && allOk;
        List<String> blockers = approvalBlockers(item, def, st, me, allOk);
        return new GateEvaluation(stageId, def.gate(), st.status.name(), ready, blockers.isEmpty(), def.accountableRole(), conditions, blockers);
    }

    private List<String> approvalBlockers(WorkItem item, StageDef def, StageState st, User me, boolean allOk) {
        List<String> b = new ArrayList<>();
        if (st.status != Status.IN_REVIEW) b.add("The stage has not been submitted for review.");
        if (!allOk) b.add("Some gate conditions are not met.");
        if (me != null) {
            Role accountable = Role.valueOf(def.accountableRole());
            if (!me.has(accountable)) b.add("Only the " + label(accountable) + " (accountable for " + def.gate() + ") can decide this gate.");
            if (st.aiOperator != null && st.aiOperator.equals(me.username)) b.add("You ran the AI prompt for this stage, so you cannot sign its gate (separation of duties).");
        }
        return b;
    }

    public WorkItem submit(WorkItem item, String stageId) {
        StageState st = state(item, stageId);
        if (st.status != Status.IN_PROGRESS) throw ApiException.conflict("Only a stage in progress can be submitted for review.");
        GateEvaluation ev = evaluate(item, stageId, null);
        List<Condition> unmet = ev.conditions().stream().filter(c -> !c.ok()).toList();
        if (!unmet.isEmpty()) {
            audit.record("GATE_SUBMIT_BLOCKED", "WORK_ITEM", item.key, item.projectId, item.key + " " + ev.gate() + " blocked: " + codes(unmet), Map.of("stage", stageId));
            throw ApiException.gateBlocked(ev.gate() + " is not ready for review.", unmet);
        }
        st.status = Status.IN_REVIEW;
        st.submittedAt = Instant.now();
        GateDecision d = decision("SUBMITTED", null, null);
        st.lastDecision = d; st.history.add(d);
        WorkItem saved = save(item);
        audit.record("GATE_SUBMITTED", "WORK_ITEM", item.key, item.projectId, item.key + " " + ev.gate() + " submitted for review", Map.of("stage", stageId));
        return saved;
    }

    public WorkItem decide(WorkItem item, String stageId, String decision, String comment, String reviewer) {
        if (decision == null || !DECISIONS.contains(decision)) throw ApiException.badRequest("Decision must be one of " + DECISIONS + ".");
        User me = users.current();
        StageState st = state(item, stageId);
        StageDef def = process.stage(stageId);
        GateEvaluation ev = evaluate(item, stageId, me);
        String rev = reviewer == null || reviewer.isBlank() ? me.username : reviewer.trim();
        if (st.aiOperator != null && st.aiOperator.equals(rev)) {
            throw ApiException.forbidden("The L3 reviewer cannot be the person who ran the AI prompt (" + rev + ").");
        }
        if ("REJECTED".equals(decision)) {
            if (st.status != Status.IN_REVIEW) throw ApiException.conflict("Only a stage in review can be rejected.");
            if (!me.has(Role.valueOf(def.accountableRole()))) throw ApiException.forbidden(ev.approvalBlockers().stream().filter(x -> x.startsWith("Only")).findFirst().orElse("You cannot decide this gate."));
            if (comment == null || comment.isBlank()) throw ApiException.badRequest("Record why the gate is rejected so the stage owner can fix it.");
            st.status = Status.IN_PROGRESS;
            item.reworkCount++;
            GateDecision d = decision("REJECTED", comment, rev);
            d.by = me.username; d.byName = me.fullName;
            st.lastDecision = d; st.history.add(d);
            WorkItem saved = save(item);
            audit.record("GATE_REJECTED", "WORK_ITEM", item.key, item.projectId, item.key + " " + def.gate() + " rejected: " + comment, Map.of("stage", stageId, "reviewer", rev));
            return saved;
        }
        if (!ev.canApprove()) throw ApiException.gateBlocked(def.gate() + " cannot be approved yet.", ev.approvalBlockers());
        if ("APPROVED_WITH_CONDITIONS".equals(decision) && (comment == null || comment.isBlank())) throw ApiException.badRequest("List the conditions attached to the approval.");
        st.status = Status.APPROVED;
        st.approvedAt = Instant.now();
        GateDecision d = decision(decision, comment, rev);
        d.by = me.username; d.byName = me.fullName;
        ev.conditions().stream().filter(Condition::waived).forEach(c -> { d.waivedConditions.add(c.code()); d.waiverKeys.add(c.waiverKey()); });
        st.lastDecision = d; st.history.add(d);
        startReadyStages(item);
        if ("S9".equals(stageId)) item.closedAt = Instant.now();
        WorkItem saved = save(item);
        audit.record("GATE_APPROVED", "WORK_ITEM", item.key, item.projectId, item.key + " " + def.gate() + " " + decision.toLowerCase().replace('_', ' ') + " by " + me.username,
            Map.of("stage", stageId, "reviewer", rev, "waived", d.waivedConditions));
        events.publishEvent(new GateApprovedEvent(item.projectId, item.key, stageId));
        return saved;
    }

    /** Starts every applicable stage whose prerequisites are now satisfied (S6 test design runs in parallel from G2). */
    public void startReadyStages(WorkItem item) {
        for (StageDef s : process.stages()) {
            StageState st = state(item, s.id());
            if (st.status == Status.NOT_STARTED && s.prerequisites().stream().allMatch(p -> state(item, p).satisfied())
                && !"S0".equals(s.id()) && item.column != WorkItem.Column.BACKLOG) {
                st.status = Status.IN_PROGRESS;
                st.startedAt = Instant.now();
            }
        }
    }

    public Map<String, String> latestChecks(WorkItem item, List<String> wanted) {
        Map<String, String> out = new LinkedHashMap<>();
        List<BuildRef> sorted = item.builds.stream().sorted(Comparator.comparing((BuildRef b) -> b.at == null ? Instant.EPOCH : b.at).reversed()).toList();
        for (String c : wanted) {
            for (BuildRef b : sorted) {
                if ("BUILD".equals(c)) { out.put(c, "SUCCESS".equals(b.status) ? "PASS" : "FAIL"); break; }
                if (b.checks != null && b.checks.containsKey(c)) { out.put(c, b.checks.get(c)); break; }
            }
        }
        return out;
    }

    private StageState state(WorkItem item, String stageId) {
        StageState st = item.stage(stageId);
        if (st == null) throw ApiException.notFound("Stage", stageId);
        return st;
    }

    private WorkItem save(WorkItem item) { item.updatedAt = Instant.now(); return items.save(item); }
    private static Condition cond(String code, String label, boolean met, String detail) { return new Condition(code, label, met, false, detail, null); }
    private static String gates(List<String> stages) { return String.join(", ", stages.stream().map(s -> s.replace('S', 'G')).toList()); }
    private static String codes(List<Condition> c) { return String.join(", ", c.stream().map(Condition::code).toList()); }
    private static String label(Role r) { String s = r.name().replace('_', ' ').toLowerCase(); return Character.toUpperCase(s.charAt(0)) + s.substring(1); }
    private static GateDecision decision(String kind, String comment, String reviewer) {
        GateDecision d = new GateDecision();
        d.decision = kind; d.comment = comment; d.reviewer = reviewer; d.at = Instant.now(); d.by = AuditService.currentActor();
        return d;
    }
}
