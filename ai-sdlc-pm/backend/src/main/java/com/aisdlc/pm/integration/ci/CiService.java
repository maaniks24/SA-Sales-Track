package com.aisdlc.pm.integration.ci;

import com.aisdlc.pm.audit.AuditService;
import com.aisdlc.pm.common.ApiException;
import com.aisdlc.pm.common.Ids;
import com.aisdlc.pm.integration.IntegrationEventService;
import com.aisdlc.pm.project.Project;
import com.aisdlc.pm.project.ProjectService;
import com.aisdlc.pm.trace.TraceService;
import com.aisdlc.pm.workitem.WorkItem;
import com.aisdlc.pm.workitem.WorkItemRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class CiService {
    public record Result(String status, String workItem, String summary) { }
    public record GateCheck(boolean allowed, String project, String workItem, String gate, String stageStatus, String message) { }

    private static final Set<String> STATUSES = Set.of("SUCCESS", "FAILURE", "UNSTABLE", "ABORTED");
    private final ProjectService projects;
    private final WorkItemRepository items;
    private final TraceService trace;
    private final IntegrationEventService events;
    private final AuditService audit;

    public CiService(ProjectService projects, WorkItemRepository items, TraceService trace, IntegrationEventService events, AuditService audit) {
        this.projects = projects; this.items = items; this.trace = trace; this.events = events; this.audit = audit;
    }

    public Result receive(String projectKey, String token, CiPayload b) {
        Project p = authorise(projectKey, token, "build");
        if (b.job() == null || b.buildNumber() == null || b.status() == null || !STATUSES.contains(b.status().toUpperCase())) {
            throw ApiException.badRequest("job, buildNumber and status (SUCCESS, FAILURE, UNSTABLE, ABORTED) are required.");
        }
        Optional<WorkItem> target = find(p, b);
        if (b.testResults() != null) for (CiPayload.TestResult t : b.testResults()) {
            if (t.reqId() != null) trace.recordTest(p.id, t.reqId().toUpperCase(), t.testCase(), t.result(), b.release());
        }
        if (target.isEmpty()) {
            String s = b.job() + " #" + b.buildNumber() + " " + b.status() + ": no work item key in workItem, branch or a linked commit";
            events.record(p.id, "CI", "build", "IGNORED", s, null);
            return new Result("IGNORED", null, s);
        }
        WorkItem w = target.get();
        WorkItem.BuildRef ref = new WorkItem.BuildRef();
        ref.job = b.job(); ref.number = b.buildNumber(); ref.status = b.status().toUpperCase(); ref.url = b.url(); ref.branch = b.branch(); ref.commit = b.commit();
        ref.at = Instant.now(); ref.parity = b.parity();
        Map<String, String> checks = new LinkedHashMap<>();
        if (b.checks() != null) b.checks().forEach((k, v) -> checks.put(k.toUpperCase(), v == null ? "FAIL" : v.toUpperCase()));
        if (b.parity() != null && !checks.containsKey("PARITY")) {
            int approved = b.parity().getOrDefault("approved", 0);
            int sum = b.parity().getOrDefault("manual", 0) + b.parity().getOrDefault("automated", 0) + b.parity().getOrDefault("deferred", 0);
            checks.put("PARITY", approved > 0 && approved == sum ? "PASS" : "FAIL");
        }
        ref.checks = checks;
        w.builds.add(ref);
        if (w.builds.size() > 50) w.builds = new java.util.ArrayList<>(w.builds.subList(w.builds.size() - 50, w.builds.size()));
        w.updatedAt = Instant.now();
        items.save(w);
        String s = b.job() + " #" + b.buildNumber() + " " + ref.status + " → " + w.key + (checks.isEmpty() ? "" : " (" + checks.entrySet().stream().map(e -> e.getKey() + " " + e.getValue()).reduce((x, y) -> x + ", " + y).orElse("") + ")");
        events.record(p.id, "CI", "build", "PROCESSED", s, null);
        audit.recordAs("ci:" + b.job(), "CI_BUILD", "WORK_ITEM", w.key, p.id, s, null);
        return new Result("PROCESSED", w.key, s);
    }

    /** Lets a pipeline stop promotion when the gate for a work item is not approved. */
    public GateCheck gateCheck(String projectKey, String token, String workItemKey, String gate) {
        Project p = authorise(projectKey, token, "gate-check");
        if (gate == null || !gate.matches("G[0-9]")) throw ApiException.badRequest("gate must be G0 to G9.");
        WorkItem w = items.findByKey(workItemKey.toUpperCase()).filter(x -> x.projectId.equals(p.id)).orElseThrow(() -> ApiException.notFound("Work item", workItemKey));
        WorkItem.StageState st = w.stage("S" + gate.substring(1));
        boolean ok = st.satisfied();
        String msg = ok ? gate + " is " + st.status.name().toLowerCase() + " for " + w.key : gate + " is not approved for " + w.key + " (stage is " + st.status.name().toLowerCase().replace('_', ' ') + ")";
        events.record(p.id, "CI", "gate-check", ok ? "PROCESSED" : "REJECTED", msg, null);
        audit.recordAs("ci", ok ? "CI_GATE_PASSED" : "CI_GATE_BLOCKED", "WORK_ITEM", w.key, p.id, msg, null);
        return new GateCheck(ok, p.key, w.key, gate, st.status.name(), msg);
    }

    private Optional<WorkItem> find(Project p, CiPayload b) {
        List<WorkItem> all = items.findByProjectId(p.id);
        if (b.workItem() != null) return all.stream().filter(w -> w.key.equalsIgnoreCase(b.workItem())).findFirst();
        if (b.branch() != null) {
            for (String k : Ids.find(Ids.WORK_ITEM, b.branch())) { Optional<WorkItem> m = all.stream().filter(w -> w.key.equals(k)).findFirst(); if (m.isPresent()) return m; }
        }
        if (b.commit() != null) return all.stream().filter(w -> w.commits.stream().anyMatch(c -> b.commit().equals(c.sha))).findFirst();
        return Optional.empty();
    }

    private Project authorise(String projectKey, String token, String type) {
        Project p = projects.byKey(projectKey);
        String expected = p.integrations.ci.token;
        if (expected == null || expected.isBlank() || token == null || !MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), token.getBytes(StandardCharsets.UTF_8))) {
            events.record(p.id, "CI", type, "REJECTED", "Request with a missing or wrong X-CI-Token", null);
            throw ApiException.unauthorized("The X-CI-Token header is missing or wrong for project " + p.key + ".");
        }
        return p;
    }
}
