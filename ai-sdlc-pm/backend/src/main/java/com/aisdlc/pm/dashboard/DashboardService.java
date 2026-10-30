package com.aisdlc.pm.dashboard;

import com.aisdlc.pm.audit.AuditEvent;
import com.aisdlc.pm.audit.AuditService;
import com.aisdlc.pm.integration.git.CommitRecord;
import com.aisdlc.pm.integration.git.CommitRecordRepository;
import com.aisdlc.pm.process.ProcessDefinition.StageDef;
import com.aisdlc.pm.process.ProcessService;
import com.aisdlc.pm.project.Project;
import com.aisdlc.pm.project.ProjectService;
import com.aisdlc.pm.sprint.Sprint;
import com.aisdlc.pm.sprint.SprintService;
import com.aisdlc.pm.trace.TraceService;
import com.aisdlc.pm.waiver.Waiver;
import com.aisdlc.pm.waiver.WaiverService;
import com.aisdlc.pm.workitem.BoardService;
import com.aisdlc.pm.workitem.WorkItem;
import com.aisdlc.pm.workitem.WorkItem.StageState;
import com.aisdlc.pm.workitem.WorkItemRepository;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

/** One read model for the dashboard page: everything is computed from work items, so it is always consistent with the board. */
@Service
public class DashboardService {
    public record Kpi(String key, String label, String value, String hint, String tone) { }
    public record StageFlow(String stageId, String gate, String name, int inProgress, int inReview, int approved, double avgDays) { }
    public record GateStat(String gate, int approved, int rejected, int withConditions) { }
    public record Dashboard(String projectId, String projectKey, String projectName, Instant generatedAt, List<Kpi> kpis,
                            Map<String, Long> byType, Map<String, Long> byColumn, Map<String, Integer> wipLimits, List<StageFlow> stageFlow,
                            List<GateStat> gates, Map<String, Long> rtmCoverage, Map<String, Long> defectsByMissedGate, Map<String, Long> aiUsage,
                            List<BoardService.Approval> pendingApprovals, List<Waiver> waiversAttention, SprintService.Burndown activeSprint,
                            List<BuildRow> recentBuilds, List<AuditEvent> recentActivity) { }
    public record BuildRow(String workItem, String job, long number, String status, Instant at, String url) { }

    private final ProjectService projects;
    private final WorkItemRepository items;
    private final ProcessService process;
    private final BoardService board;
    private final TraceService trace;
    private final WaiverService waivers;
    private final SprintService sprints;
    private final CommitRecordRepository commits;
    private final AuditService audit;

    public DashboardService(ProjectService projects, WorkItemRepository items, ProcessService process, BoardService board, TraceService trace,
                            WaiverService waivers, SprintService sprints, CommitRecordRepository commits, AuditService audit) {
        this.projects = projects; this.items = items; this.process = process; this.board = board; this.trace = trace;
        this.waivers = waivers; this.sprints = sprints; this.commits = commits; this.audit = audit;
    }

    public Dashboard build(String projectId) {
        Project p = projects.get(projectId);
        List<WorkItem> all = items.findByProjectId(p.id);
        List<WorkItem> open = all.stream().filter(w -> w.column != WorkItem.Column.DONE).toList();
        Map<String, Long> byType = count(all, WorkItem::workTypeKey);
        Map<String, Long> openByType = count(open, WorkItem::workTypeKey);
        Map<String, Long> byColumn = new LinkedHashMap<>();
        for (WorkItem.Column c : WorkItem.Column.values()) byColumn.put(c.name(), all.stream().filter(w -> w.column == c).count());

        List<StageFlow> flow = new ArrayList<>();
        Map<String, int[]> gateCounts = new LinkedHashMap<>();
        for (StageDef d : process.stages()) {
            List<StageState> st = all.stream().map(w -> w.stage(d.id())).filter(Objects::nonNull).toList();
            double avg = st.stream().filter(s -> s.startedAt != null && s.approvedAt != null)
                .mapToDouble(s -> Duration.between(s.startedAt, s.approvedAt).toMinutes() / 1440.0).average().orElse(0);
            flow.add(new StageFlow(d.id(), d.gate(), d.name(), (int) st.stream().filter(s -> s.status == StageState.Status.IN_PROGRESS).count(),
                (int) st.stream().filter(s -> s.status == StageState.Status.IN_REVIEW).count(),
                (int) st.stream().filter(s -> s.status == StageState.Status.APPROVED).count(), Math.round(avg * 10) / 10.0));
            int[] g = new int[3];
            st.forEach(s -> s.history.forEach(h -> {
                if ("APPROVED".equals(h.decision)) g[0]++;
                else if ("REJECTED".equals(h.decision)) g[1]++;
                else if ("APPROVED_WITH_CONDITIONS".equals(h.decision)) { g[0]++; g[2]++; }
            }));
            gateCounts.put(d.gate(), g);
        }
        List<GateStat> gates = gateCounts.entrySet().stream().map(e -> new GateStat(e.getKey(), e.getValue()[0], e.getValue()[1], e.getValue()[2])).toList();

        Map<String, Long> coverage = new LinkedHashMap<>(trace.coverageCounts(p.id));
        long okReq = coverage.getOrDefault("OK", 0L), gapReq = coverage.getOrDefault("GAP", 0L);
        List<CommitRecord> cs = commits.findByProjectId(p.id);
        long validCommits = cs.stream().filter(c -> c.validId).count();
        List<WorkItem.BuildRef> builds = all.stream().flatMap(w -> w.builds.stream()).filter(b -> b.at != null && b.at.isAfter(Instant.now().minus(Duration.ofDays(30)))).toList();
        long green = builds.stream().filter(b -> "SUCCESS".equals(b.status)).count();
        List<StageState> decided = all.stream().flatMap(w -> w.stages.values().stream()).filter(s -> !"NONE".equals(s.aiUsage) || s.status == StageState.Status.APPROVED).toList();
        Map<String, Long> ai = count(decided, s -> s.aiUsage == null ? "NONE" : s.aiUsage);
        List<Waiver> ws = waivers.list(p.id);
        LocalDate today = LocalDate.now();
        List<Waiver> attention = ws.stream().filter(w -> w.status == Waiver.Status.REQUESTED || w.status == Waiver.Status.EXPIRED
            || (w.status == Waiver.Status.APPROVED && w.expiry != null && !w.expiry.isAfter(today.plusDays(7)))).toList();
        long activeWaivers = ws.stream().filter(w -> w.activeOn(today)).count();
        List<BoardService.Approval> pending = board.approvals(p.id, false);
        int rework = all.stream().mapToInt(w -> w.reworkCount).sum();
        long rejected = gates.stream().mapToLong(GateStat::rejected).sum();
        long approvedTotal = gates.stream().mapToLong(GateStat::approved).sum();
        Map<String, Long> missed = count(all.stream().filter(w -> "SR_DEFECT".equals(w.workTypeKey()) && w.missedGate != null).toList(), w -> w.missedGate);
        double cycle = all.stream().filter(w -> w.closedAt != null && w.createdAt != null).mapToDouble(w -> Duration.between(w.createdAt, w.closedAt).toHours() / 24.0).average().orElse(0);
        long overWip = p.wipLimits.entrySet().stream().filter(e -> byColumn.getOrDefault(e.getKey(), 0L) > e.getValue()).count();

        List<Kpi> kpis = List.of(
            new Kpi("open", "Open work items", String.valueOf(open.size()), openByType.getOrDefault("NF", 0L) + " NF · " + openByType.getOrDefault("CR", 0L) + " CR · "
                + (openByType.getOrDefault("SR_DEFECT", 0L) + openByType.getOrDefault("SR_SERVICE", 0L)) + " SR", overWip > 0 ? "warn" : "neutral"),
            new Kpi("approvals", "Awaiting gate decision", String.valueOf(pending.size()), "Stages submitted and waiting for the accountable role", pending.isEmpty() ? "good" : "warn"),
            new Kpi("rtm", "Traceability complete", pct(okReq, okReq + gapReq), okReq + " of " + (okReq + gapReq) + " live requirements have code, tests and a pass", okReq + gapReq > 0 && gapReq == 0 ? "good" : "warn"),
            new Kpi("idDiscipline", "Commits with a valid ID", pct(validCommits, cs.size()), cs.size() + " commits in this project", cs.isEmpty() || validCommits == cs.size() ? "good" : validCommits * 100 / cs.size() >= 95 ? "warn" : "bad"),
            new Kpi("builds", "Build pass rate (30 days)", pct(green, builds.size()), builds.size() + " builds reported by CI", builds.isEmpty() || green * 100 / builds.size() >= 90 ? "good" : "warn"),
            new Kpi("firstPass", "Gate first-pass rate", pct(approvedTotal, approvedTotal + rejected), rejected + " rejection(s), " + rework + " board rework move(s)", rejected == 0 ? "good" : "warn"),
            new Kpi("waivers", "Active waivers", String.valueOf(activeWaivers), attention.size() + " need attention (requested, expiring in 7 days or expired)", attention.isEmpty() ? "good" : "warn"),
            new Kpi("cycle", "Average cycle time", cycle == 0 ? "–" : String.format("%.1f d", cycle), "Created to Done, closed items", "neutral"));

        Sprint active = sprints.list(p.id).stream().filter(s -> s.status == Sprint.Status.ACTIVE).findFirst().orElse(null);
        List<BuildRow> recentBuilds = all.stream().flatMap(w -> w.builds.stream().map(b -> new BuildRow(w.key, b.job, b.number, b.status, b.at, b.url)))
            .filter(b -> b.at() != null).sorted((a, b) -> b.at().compareTo(a.at())).limit(8).toList();
        return new Dashboard(p.id, p.key, p.name, Instant.now(), kpis, byType, byColumn, p.wipLimits, flow, gates, coverage, missed, ai, pending,
            attention, active == null ? null : sprints.burndown(active.id), recentBuilds, audit.recent(p.id));
    }

    private static <T> Map<String, Long> count(List<T> list, Function<T, String> key) {
        return list.stream().collect(Collectors.groupingBy(key, LinkedHashMap::new, Collectors.counting()));
    }

    private static String pct(long a, long b) { return b == 0 ? "–" : Math.round(a * 100.0 / b) + "%"; }
}
