package com.aisdlc.pm.trace;

import com.aisdlc.pm.audit.AuditService;
import com.aisdlc.pm.common.ApiException;
import com.aisdlc.pm.common.Ids;
import com.aisdlc.pm.workitem.WorkItem;
import com.aisdlc.pm.workitem.WorkItemRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class TraceService {
    private static final Set<String> RESULTS = Set.of("PASS", "FAIL", "BLOCKED", "NOT_RUN");
    private final RequirementRepository repo;
    private final WorkItemRepository items;
    private final AuditService audit;

    public TraceService(RequirementRepository repo, WorkItemRepository items, AuditService audit) { this.repo = repo; this.items = items; this.audit = audit; }

    public List<Requirement> matrix(String projectId) {
        List<WorkItem> all = items.findByProjectId(projectId);
        List<Requirement> reqs = repo.findByProjectIdOrderByReqIdAsc(projectId);
        reqs.forEach(r -> r.workItemKeys = all.stream().filter(w -> w.requirementIds.contains(r.reqId)).map(w -> w.key).toList());
        return reqs;
    }

    public Requirement save(String projectId, Requirement in) {
        if (in.reqId == null || Ids.find(Ids.REQ, in.reqId.toUpperCase()).isEmpty()) throw ApiException.badRequest("Requirement IDs look like DEP-REQ-214 (process 8.2).");
        String reqId = in.reqId.toUpperCase();
        Requirement r = repo.findByProjectIdAndReqId(projectId, reqId).orElseGet(Requirement::new);
        boolean created = r.id == null;
        r.projectId = projectId; r.reqId = reqId;
        if (in.title != null) r.title = in.title;
        if (in.revision != null) r.revision = in.revision;
        if (in.module != null) r.module = in.module;
        if (in.surface != null) r.surface = in.surface;
        if (in.priority != null) r.priority = in.priority;
        if (in.status != null) r.status = in.status;
        if (in.sfvdRef != null) r.sfvdRef = in.sfvdRef;
        if (in.apiOperations != null && !in.apiOperations.isEmpty()) r.apiOperations = in.apiOperations;
        if (in.testCases != null && !in.testCases.isEmpty()) r.testCases = in.testCases;
        if (in.lastTestResult != null && RESULTS.contains(in.lastTestResult)) r.lastTestResult = in.lastTestResult;
        if (in.release != null) r.release = in.release;
        r.updatedAt = Instant.now();
        Requirement saved = repo.save(r);
        audit.record(created ? "REQUIREMENT_CREATED" : "REQUIREMENT_UPDATED", "REQUIREMENT", reqId, projectId, (created ? "Added " : "Updated ") + reqId + (r.title == null ? "" : ": " + r.title), null);
        return saved;
    }

    private Requirement ensure(String projectId, String reqId, String source) {
        return repo.findByProjectIdAndReqId(projectId, reqId).orElseGet(() -> {
            Requirement r = new Requirement();
            r.projectId = projectId; r.reqId = reqId; r.status = "UNREGISTERED";
            r.title = "Referenced by " + source + " but not registered in T01";
            return r;
        });
    }

    public void linkCode(String projectId, String reqId, String commitSha, String pullRequest, String source) {
        Requirement r = ensure(projectId, reqId, source);
        if (commitSha != null && !r.commits.contains(commitSha)) r.commits.add(commitSha);
        if (pullRequest != null && !r.pullRequests.contains(pullRequest)) r.pullRequests.add(pullRequest);
        r.updatedAt = Instant.now();
        repo.save(r);
    }

    public void recordTest(String projectId, String reqId, String testCase, String result, String release) {
        Requirement r = ensure(projectId, reqId, "a CI test result");
        if (testCase != null && !r.testCases.contains(testCase)) r.testCases.add(testCase);
        if (result != null && RESULTS.contains(result.toUpperCase())) r.lastTestResult = result.toUpperCase();
        if (release != null) r.release = release;
        r.updatedAt = Instant.now();
        repo.save(r);
    }

    public void recordDefect(String projectId, String reqId, String defect) {
        Requirement r = ensure(projectId, reqId, "a defect");
        if (!r.defects.contains(defect)) r.defects.add(defect);
        r.updatedAt = Instant.now();
        repo.save(r);
    }

    public String csv(String projectId) {
        StringBuilder sb = new StringBuilder("REQ-ID,Revision,Title,Module,Status,SFVD,API operations,Work items,Commits,Pull requests,Test cases,Last result,Defects,Release,Coverage\n");
        for (Requirement r : matrix(projectId)) {
            sb.append(String.join(",", c(r.reqId), c(r.revision), c(r.title), c(r.module), c(r.status), c(r.sfvdRef), c(String.join(" ", r.apiOperations)),
                c(String.join(" ", r.workItemKeys)), String.valueOf(r.commits.size()), c(String.join(" ", r.pullRequests)), c(String.join(" ", r.testCases)),
                c(r.lastTestResult), c(String.join(" ", r.defects)), c(r.release), r.getCoverage())).append('\n');
        }
        return sb.toString();
    }

    private static String c(String s) {
        if (s == null) return "";
        String v = s.replace("\"", "\"\"");
        return v.contains(",") || v.contains("\"") ? "\"" + v + "\"" : v;
    }

    public Map<String, Long> coverageCounts(String projectId) {
        List<Requirement> all = repo.findByProjectIdOrderByReqIdAsc(projectId);
        return Map.of("OK", all.stream().filter(r -> "OK".equals(r.getCoverage())).count(), "GAP", all.stream().filter(r -> "GAP".equals(r.getCoverage())).count(),
            "RETIRED", all.stream().filter(r -> "RETIRED".equals(r.getCoverage())).count());
    }
}
