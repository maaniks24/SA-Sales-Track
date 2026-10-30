package com.aisdlc.pm.waiver;

import com.aisdlc.pm.audit.AuditService;
import com.aisdlc.pm.common.ApiException;
import com.aisdlc.pm.common.SequenceService;
import com.aisdlc.pm.user.Role;
import com.aisdlc.pm.user.User;
import com.aisdlc.pm.user.UserService;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class WaiverService {
    /** Conditions that may be waived. Stage status, role and separation of duties can never be waived. */
    public static final Set<String> WAIVABLE = Set.of("PREREQUISITES", "CHECKLIST", "DOCUMENTS", "AI_DECLARATION", "CI_CHECKS", "GIT_EVIDENCE");
    public static final int MAX_DAYS = 90;

    private final WaiverRepository repo;
    private final SequenceService seq;
    private final UserService users;
    private final AuditService audit;

    public WaiverService(WaiverRepository repo, SequenceService seq, UserService users, AuditService audit) {
        this.repo = repo; this.seq = seq; this.users = users; this.audit = audit;
    }

    public List<Waiver> list(String projectId) { return repo.findByProjectIdOrderByRequestedAtDesc(projectId).stream().map(this::refresh).toList(); }
    public Waiver get(String id) { return refresh(repo.findById(id).orElseThrow(() -> ApiException.notFound("Waiver", id))); }

    public List<Waiver> active(String workItemKey, String stageId) {
        LocalDate today = LocalDate.now();
        return repo.findByWorkItemKeyAndStageId(workItemKey, stageId).stream().filter(w -> w.activeOn(today)).toList();
    }

    public Waiver request(Waiver in, String projectId) {
        if (in.reason == null || in.reason.trim().length() < 15) throw ApiException.badRequest("Explain the reason in at least a sentence. Schedule pressure alone is not a reason.");
        if (in.conditions == null || in.conditions.isEmpty()) throw ApiException.badRequest("Choose which gate conditions the waiver covers.");
        for (String c : in.conditions) if (c == null || !WAIVABLE.contains(c)) throw ApiException.badRequest(c + " cannot be waived.");
        LocalDate today = LocalDate.now();
        if (in.expiry == null || in.expiry.isBefore(today) || in.expiry.isAfter(today.plusDays(MAX_DAYS))) {
            throw ApiException.badRequest("The expiry must be between today and " + today.plusDays(MAX_DAYS) + " (90 days at most).");
        }
        if (in.risk == null || !Set.of("LOW", "MEDIUM", "HIGH").contains(in.risk)) throw ApiException.badRequest("Set the risk to LOW, MEDIUM or HIGH.");
        Waiver w = new Waiver();
        w.key = String.format("WVR-%03d", seq.next("waiver"));
        w.projectId = projectId; w.workItemKey = in.workItemKey; w.stageId = in.stageId; w.conditions = in.conditions;
        w.reason = in.reason.trim(); w.risk = in.risk; w.compensatingControls = in.compensatingControls; w.owner = in.owner == null ? AuditService.currentActor() : in.owner;
        w.expiry = in.expiry; w.requestedBy = AuditService.currentActor(); w.requestedAt = Instant.now();
        Waiver saved = repo.save(w);
        audit.record("WAIVER_REQUESTED", "WAIVER", saved.key, projectId, saved.key + " for " + w.workItemKey + " " + w.stageId + " (" + String.join(", ", w.conditions) + ")",
            Map.of("expiry", w.expiry.toString(), "risk", w.risk, "workItem", String.valueOf(w.workItemKey)));
        return saved;
    }

    public Waiver decide(String id, boolean approve, String comment) {
        Waiver w = get(id);
        User me = users.current();
        if (!(me.has(Role.COUNCIL) || me.has(Role.ARCHITECT))) throw ApiException.forbidden("Only the AI Governance Council or the Architect decides waivers.");
        if (me.username.equals(w.requestedBy)) throw ApiException.forbidden("You cannot decide a waiver you requested.");
        if (w.status != Waiver.Status.REQUESTED) throw ApiException.conflict("This waiver is already " + w.status.name().toLowerCase() + ".");
        if (!approve && (comment == null || comment.isBlank())) throw ApiException.badRequest("Give a reason when rejecting a waiver.");
        w.status = approve ? Waiver.Status.APPROVED : Waiver.Status.REJECTED;
        w.decidedBy = me.username; w.decidedAt = Instant.now(); w.decisionComment = comment;
        Waiver saved = repo.save(w);
        audit.record(approve ? "WAIVER_APPROVED" : "WAIVER_REJECTED", "WAIVER", w.key, w.projectId, w.key + (approve ? " approved" : " rejected"), Map.of("comment", String.valueOf(comment)));
        return saved;
    }

    public Waiver close(String id, String outcome) {
        Waiver w = get(id);
        if (w.status != Waiver.Status.APPROVED && w.status != Waiver.Status.EXPIRED) throw ApiException.conflict("Only approved or expired waivers can be closed.");
        w.status = Waiver.Status.CLOSED; w.closedAt = Instant.now(); w.decisionComment = outcome == null ? w.decisionComment : outcome;
        Waiver saved = repo.save(w);
        audit.record("WAIVER_CLOSED", "WAIVER", w.key, w.projectId, w.key + " closed", Map.of("outcome", String.valueOf(outcome)));
        return saved;
    }

    private Waiver refresh(Waiver w) {
        if (w.status == Waiver.Status.APPROVED && w.expiry != null && w.expiry.isBefore(LocalDate.now())) {
            w.status = Waiver.Status.EXPIRED;
            repo.save(w);
            audit.recordAs("system", "WAIVER_EXPIRED", "WAIVER", w.key, w.projectId, w.key + " expired on " + w.expiry, null);
        }
        return w;
    }

    @Scheduled(cron = "0 5 0 * * *")
    public void expireDaily() { repo.findByStatus(Waiver.Status.APPROVED).forEach(this::refresh); }
}
