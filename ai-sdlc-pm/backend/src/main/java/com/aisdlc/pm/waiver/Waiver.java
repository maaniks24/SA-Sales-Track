package com.aisdlc.pm.waiver;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** T15 Waiver and Deviation Request: permission to bypass named gate conditions for a limited time. */
@Document("waivers")
public class Waiver {
    public enum Status { REQUESTED, APPROVED, REJECTED, CLOSED, EXPIRED }

    @Id public String id;
    @Indexed(unique = true) public String key;     // WVR-004
    @Indexed public String projectId;
    public String workItemKey;
    public String stageId;
    public List<String> conditions = new ArrayList<>();   // gate condition codes it covers, e.g. CI_CHECKS
    public String reason;
    public String risk;                                   // LOW, MEDIUM, HIGH
    public String compensatingControls;
    public String owner;
    public LocalDate expiry;
    public Status status = Status.REQUESTED;
    public String requestedBy;
    public Instant requestedAt;
    public String decidedBy;
    public Instant decidedAt;
    public String decisionComment;
    public Instant closedAt;

    public boolean activeOn(LocalDate day) { return status == Status.APPROVED && expiry != null && !expiry.isBefore(day); }
}
