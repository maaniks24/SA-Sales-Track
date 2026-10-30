package com.aisdlc.pm.workitem;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("work_items")
@CompoundIndex(name = "project_column", def = "{'projectId': 1, 'column': 1, 'rank': 1}")
public class WorkItem {
    public enum Type { NF, CR, SR }
    public enum SrKind { DEFECT, SERVICE }
    public enum Column { BACKLOG, INTAKE, DEFINE, BUILD, TEST, RELEASE, DONE }

    @Id public String id;
    @Indexed public String projectId;
    @Indexed(unique = true) public String key;            // FAS-12
    public String processId;                              // CR-2026-031, SR-2026-00412, BUG-DEP-118
    public Type type;
    public SrKind srKind;
    public String crClass;                                // MINOR, MAJOR (CR only)
    public String title;
    public String description;
    public String module;
    public List<String> surfaces = new ArrayList<>();
    public String priority = "MEDIUM";                    // HIGHEST, HIGH, MEDIUM, LOW
    public String severity;                               // P1-P4 (SR)
    public Column column = Column.BACKLOG;
    public double rank;
    public String assigneeId;
    public String reporterId;
    public String sprintId;
    public Integer storyPoints;
    public List<String> labels = new ArrayList<>();
    public List<String> requirementIds = new ArrayList<>();
    public Map<String, StageState> stages = new LinkedHashMap<>();
    public List<CommitRef> commits = new ArrayList<>();
    public List<PullRequestRef> pullRequests = new ArrayList<>();
    public List<BuildRef> builds = new ArrayList<>();
    public List<BugRef> bugs = new ArrayList<>();
    public String missedGate;                             // defects: gate that should have caught it (from the RCA)
    public int reworkCount;
    public Instant createdAt;
    public Instant updatedAt;
    public Instant closedAt;
    @Version public Long version;

    /** Process work-type key used by the process definition: NF, CR, SR_DEFECT, SR_SERVICE. */
    public String workTypeKey() {
        if (type == Type.SR) return srKind == SrKind.SERVICE ? "SR_SERVICE" : "SR_DEFECT";
        return type.name();
    }

    public StageState stage(String id) { return stages.get(id); }

    public static class StageState {
        public enum Status { NOT_STARTED, IN_PROGRESS, IN_REVIEW, APPROVED, SKIPPED }
        public String stageId;
        public Status status = Status.NOT_STARTED;
        public String applicability;                      // FULL, DELTA, LIGHT, CONDITIONAL, SKIP
        public List<CheckItem> checklist = new ArrayList<>();
        public String ownerId;
        public String aiUsage = "NONE";                   // NONE, AI_A, AI_G
        public String aiOperator;                        // username of the person who ran the AI prompt
        public Integer unresolvedAssumptions = 0;
        public String skipReason;
        public GateDecision lastDecision;
        public List<GateDecision> history = new ArrayList<>();
        public Instant startedAt;
        public Instant submittedAt;
        public Instant approvedAt;

        public boolean satisfied() { return status == Status.APPROVED || status == Status.SKIPPED; }
    }

    public static class CheckItem {
        public int index;
        public String text;
        public boolean checked;
        public String checkedBy;
        public Instant checkedAt;
        public String evidence;
    }

    public static class GateDecision {
        public String decision;                           // SUBMITTED, APPROVED, APPROVED_WITH_CONDITIONS, REJECTED
        public String by;
        public String byName;
        public String reviewer;                           // L3 independent reviewer
        public String comment;
        public List<String> waivedConditions = new ArrayList<>();
        public List<String> waiverKeys = new ArrayList<>();
        public Instant at;
    }

    public static class CommitRef {
        public String sha;
        public String message;
        public String author;
        public String branch;
        public String url;
        public Instant at;
        public boolean validId;
    }

    public static class PullRequestRef {
        public String provider;
        public String number;
        public String title;
        public String url;
        public String state;                              // OPEN, MERGED, CLOSED
        public String sourceBranch;
        public String targetBranch;
        public String author;
        public Instant updatedAt;
    }

    public static class BuildRef {
        public String job;
        public long number;
        public String status;                             // SUCCESS, FAILURE, UNSTABLE, ABORTED
        public String url;
        public String branch;
        public String commit;
        public Map<String, String> checks = new LinkedHashMap<>(); // PMD -> PASS
        public Map<String, Integer> parity;
        public Instant at;
    }

    public static class BugRef {
        public long id;
        public String summary;
        public String status;
        public String resolution;
        public String severity;
        public String url;
        public Instant syncedAt;
        public String syncError;
    }
}
