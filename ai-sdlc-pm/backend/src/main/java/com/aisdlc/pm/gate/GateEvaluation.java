package com.aisdlc.pm.gate;

import java.util.List;

/** Result of checking a stage against its gate rules. Each condition says whether it is met, waived, and why. */
public record GateEvaluation(String stageId, String gate, String status, boolean readyForReview, boolean canApprove,
                             String accountableRole, List<Condition> conditions, List<String> approvalBlockers) {
    public record Condition(String code, String label, boolean met, boolean waived, String detail, String waiverKey) {
        public boolean ok() { return met || waived; }
    }
}
