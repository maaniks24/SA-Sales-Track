package com.aisdlc.pm.trace;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

/** One row of the requirement traceability matrix (X01 RTM sheet). */
@Document("requirements")
@CompoundIndex(name = "project_req", def = "{'projectId': 1, 'reqId': 1}", unique = true)
public class Requirement {
    @Id public String id;
    public String projectId;
    public String reqId;               // DEP-REQ-214
    public String revision;            // r2
    public String title;
    public String module;
    public String surface;
    public String priority;            // MUST, SHOULD, COULD, WONT
    public String status = "DRAFT";    // DRAFT, APPROVED, IN_PROGRESS, DONE, RETIRED, UNREGISTERED
    public String sfvdRef;
    public List<String> apiOperations = new ArrayList<>();
    public List<String> commits = new ArrayList<>();
    public List<String> pullRequests = new ArrayList<>();
    public List<String> testCases = new ArrayList<>();
    public String lastTestResult = "NOT_RUN";   // PASS, FAIL, BLOCKED, NOT_RUN
    public List<String> defects = new ArrayList<>();
    public String release;
    public Instant updatedAt;
    @Transient public List<String> workItemKeys = new ArrayList<>();

    /** OK when the requirement has code (commit or PR), at least one test case and a passing latest result. */
    public String getCoverage() {
        if ("RETIRED".equals(status)) return "RETIRED";
        boolean code = !commits.isEmpty() || !pullRequests.isEmpty();
        return code && !testCases.isEmpty() && "PASS".equals(lastTestResult) ? "OK" : "GAP";
    }
}
