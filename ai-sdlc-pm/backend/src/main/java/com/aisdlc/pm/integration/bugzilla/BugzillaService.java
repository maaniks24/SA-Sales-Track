package com.aisdlc.pm.integration.bugzilla;

import com.aisdlc.pm.audit.AuditService;
import com.aisdlc.pm.common.ApiException;
import com.aisdlc.pm.common.SystemEventService;
import com.aisdlc.pm.gate.GateApprovedEvent;
import com.aisdlc.pm.integration.IntegrationEventService;
import com.aisdlc.pm.project.Project;
import com.aisdlc.pm.project.ProjectService;
import com.aisdlc.pm.workitem.WorkItem;
import com.aisdlc.pm.workitem.WorkItemRepository;
import com.aisdlc.pm.workitem.WorkItemService;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/** Bugzilla is the issue tracker: SR defects link to bugs, new bugs import as SR work items, and G9 resolves them. */
@Service
public class BugzillaService {
    public record ImportResult(int found, int imported, int alreadyLinked, List<String> created) { }
    public record ConnectionResult(boolean ok, String version, String message) { }

    private static final Logger log = LoggerFactory.getLogger(BugzillaService.class);
    private final BugzillaClient client;
    private final ProjectService projects;
    private final WorkItemRepository items;
    private final WorkItemService workItems;
    private final IntegrationEventService events;
    private final SystemEventService system;
    private final AuditService audit;

    public BugzillaService(BugzillaClient client, ProjectService projects, WorkItemRepository items, WorkItemService workItems,
                           IntegrationEventService events, SystemEventService system, AuditService audit) {
        this.client = client; this.projects = projects; this.items = items; this.workItems = workItems; this.events = events; this.system = system; this.audit = audit;
    }

    public ConnectionResult test(String projectId) {
        Project p = projects.get(projectId);
        try {
            String v = client.version(p.integrations.bugzilla);
            events.record(p.id, "BUGZILLA", "test", "PROCESSED", "Connected to Bugzilla " + v, null);
            return new ConnectionResult(true, v, "Connected to Bugzilla " + v);
        } catch (BugzillaClient.BugzillaException e) {
            events.record(p.id, "BUGZILLA", "test", "FAILED", e.getMessage(), null);
            return new ConnectionResult(false, null, e.getMessage());
        }
    }

    public WorkItem link(String key, long bugId) {
        WorkItem w = workItems.get(key);
        Project p = projects.get(w.projectId);
        if (w.bugs.stream().anyMatch(b -> b.id == bugId)) throw ApiException.conflict("Bug " + bugId + " is already linked to " + w.key + ".");
        BugzillaClient.Bug bug = guarded(p, "link", () -> client.get(p.integrations.bugzilla, bugId));
        w.bugs.add(ref(p, bug));
        w.updatedAt = Instant.now();
        WorkItem saved = items.save(w);
        audit.record("BUG_LINKED", "WORK_ITEM", w.key, p.id, "Linked Bugzilla bug " + bugId + " (" + bug.summary() + ")", Map.of("bugId", bugId));
        events.record(p.id, "BUGZILLA", "link", "PROCESSED", "Bug " + bugId + " → " + w.key, null);
        return saved;
    }

    public WorkItem unlink(String key, long bugId) {
        WorkItem w = workItems.get(key);
        if (!w.bugs.removeIf(b -> b.id == bugId)) throw ApiException.notFound("Linked bug", String.valueOf(bugId));
        w.updatedAt = Instant.now();
        WorkItem saved = items.save(w);
        audit.record("BUG_UNLINKED", "WORK_ITEM", w.key, w.projectId, "Unlinked Bugzilla bug " + bugId, Map.of("bugId", bugId));
        return saved;
    }

    /** Raises a bug in Bugzilla for an SR defect that was logged here first. */
    public WorkItem createBug(String key) {
        WorkItem w = workItems.get(key);
        Project p = projects.get(w.projectId);
        if (!"SR_DEFECT".equals(w.workTypeKey())) throw ApiException.badRequest("Only SR defects are raised in Bugzilla.");
        if (!w.bugs.isEmpty()) throw ApiException.conflict(w.key + " already has a Bugzilla bug.");
        String desc = (w.description == null ? "" : w.description + "\n\n") + "Tracked in AI SDLC as " + w.key + " / " + w.processId + ".";
        long id = guarded(p, "create", () -> client.create(p.integrations.bugzilla, "[" + w.processId + "] " + w.title, desc, BugzillaClient.toBugzillaSeverity(w.severity)));
        BugzillaClient.Bug bug = guarded(p, "create", () -> client.get(p.integrations.bugzilla, id));
        w.bugs.add(ref(p, bug));
        w.updatedAt = Instant.now();
        WorkItem saved = items.save(w);
        audit.record("BUG_CREATED", "WORK_ITEM", w.key, p.id, "Raised Bugzilla bug " + id + " for " + w.key, Map.of("bugId", id));
        events.record(p.id, "BUGZILLA", "create", "PROCESSED", "Bug " + id + " raised for " + w.key, null);
        return saved;
    }

    /** Imports open bugs of the configured product/component that are not yet linked, as SR defect work items in the backlog. */
    public ImportResult importOpen(String projectId) {
        Project p = projects.get(projectId);
        List<BugzillaClient.Bug> open = guarded(p, "import", () -> client.searchOpen(p.integrations.bugzilla));
        Set<Long> linked = items.findByProjectId(p.id).stream().flatMap(w -> w.bugs.stream()).map(b -> b.id).collect(Collectors.toSet());
        List<String> created = new ArrayList<>();
        for (BugzillaClient.Bug b : open) {
            if (linked.contains(b.id())) continue;
            String module = p.modules.stream().filter(m -> b.component() != null && b.component().toUpperCase().contains(m)).findFirst().orElse(null);
            WorkItem w = workItems.create(p.id, new WorkItemService.CreateWorkItem(WorkItem.Type.SR, WorkItem.SrKind.DEFECT, b.summary(),
                "Imported from Bugzilla bug " + b.id() + " (" + b.product() + " / " + b.component() + ").", module, List.of(), null,
                BugzillaClient.fromBugzillaSeverity(b.severity()), null, null, null, null, List.of("bugzilla")));
            w.bugs.add(ref(p, b));
            items.save(w);
            created.add(w.key);
        }
        String s = "Imported " + created.size() + " of " + open.size() + " open bug(s)" + (created.isEmpty() ? "" : ": " + String.join(", ", created));
        events.record(p.id, "BUGZILLA", "import", "PROCESSED", s, null);
        audit.record("BUGZILLA_IMPORT", "PROJECT", p.key, p.id, s, null);
        return new ImportResult(open.size(), created.size(), open.size() - created.size(), created);
    }

    /** Refreshes status of every linked bug on one work item. */
    public WorkItem refresh(String key) {
        WorkItem w = workItems.get(key);
        Project p = projects.get(w.projectId);
        refresh(p, w);
        return items.save(w);
    }

    @Scheduled(cron = "${app.bugzilla.sync-cron:0 */15 * * * *}")
    public void scheduledSync() {
        for (Project p : projects.list()) {
            if (!p.integrations.bugzilla.enabled) continue;
            int n = 0, failed = 0;
            for (WorkItem w : items.findByProjectId(p.id)) {
                if (w.bugs.isEmpty()) continue;
                failed += refresh(p, w);
                items.save(w);
                n += w.bugs.size();
            }
            if (n > 0) events.record(p.id, "BUGZILLA", "sync", failed == 0 ? "PROCESSED" : "FAILED", "Synced " + n + " linked bug(s)" + (failed > 0 ? ", " + failed + " failed" : ""), null);
        }
    }

    /** G9 approved = released and verified: resolve linked bugs when the project asks for it. */
    @EventListener
    public void onGateApproved(GateApprovedEvent e) {
        if (!"S9".equals(e.stageId())) return;
        Project p = projects.get(e.projectId());
        if (!p.integrations.bugzilla.enabled || !p.integrations.bugzilla.resolveOnClose) return;
        WorkItem w = workItems.get(e.workItemKey());
        for (WorkItem.BugRef b : w.bugs) {
            if ("RESOLVED".equals(b.status) || "VERIFIED".equals(b.status) || "CLOSED".equals(b.status)) continue;
            try {
                client.resolve(p.integrations.bugzilla, b.id, "Released and verified through AI SDLC gate G9 for " + w.key + " (" + w.processId + ").");
                b.status = "RESOLVED"; b.resolution = "FIXED"; b.syncedAt = Instant.now(); b.syncError = null;
                events.record(p.id, "BUGZILLA", "resolve", "PROCESSED", "Bug " + b.id + " resolved FIXED after G9 on " + w.key, null);
                audit.recordAs("bugzilla", "BUG_RESOLVED", "WORK_ITEM", w.key, p.id, "Resolved Bugzilla bug " + b.id + " after G9", Map.of("bugId", b.id));
            } catch (BugzillaClient.BugzillaException ex) {
                b.syncError = ex.getMessage();
                fail(p, "resolve", ex);
            }
        }
        items.save(w);
    }

    private int refresh(Project p, WorkItem w) {
        int failed = 0;
        for (WorkItem.BugRef b : w.bugs) {
            try {
                BugzillaClient.Bug bug = client.get(p.integrations.bugzilla, b.id);
                b.summary = bug.summary(); b.status = bug.status(); b.resolution = bug.resolution(); b.severity = bug.severity();
                b.syncedAt = Instant.now(); b.syncError = null;
            } catch (BugzillaClient.BugzillaException ex) {
                b.syncError = ex.getMessage();
                failed++;
                log.warn("Bugzilla sync failed for bug {} on {}: {}", b.id, w.key, ex.getMessage());
            }
        }
        return failed;
    }

    private WorkItem.BugRef ref(Project p, BugzillaClient.Bug bug) {
        WorkItem.BugRef r = new WorkItem.BugRef();
        r.id = bug.id(); r.summary = bug.summary(); r.status = bug.status(); r.resolution = bug.resolution(); r.severity = bug.severity();
        r.url = BugzillaClient.bugUrl(p.integrations.bugzilla, bug.id()); r.syncedAt = Instant.now();
        return r;
    }

    private interface Op<T> { T run(); }

    private <T> T guarded(Project p, String type, Op<T> op) {
        try {
            return op.run();
        } catch (BugzillaClient.BugzillaException e) {
            fail(p, type, e);
            throw new ApiException(org.springframework.http.HttpStatus.BAD_GATEWAY, "BUGZILLA_ERROR", e.getMessage());
        }
    }

    private void fail(Project p, String type, Exception e) {
        events.record(p.id, "BUGZILLA", type, "FAILED", e.getMessage(), null);
        system.record("WARN", "bugzilla", e.getMessage(), e.getCause(), null);
    }
}
