package com.aisdlc.pm.sprint;

import com.aisdlc.pm.audit.AuditService;
import com.aisdlc.pm.common.ApiException;
import com.aisdlc.pm.sprint.Sprint.BurnPoint;
import com.aisdlc.pm.workitem.WorkItem;
import com.aisdlc.pm.workitem.WorkItemRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class SprintService {
    public record Burndown(Sprint sprint, int committed, int remaining, int completed, int items, int itemsDone, List<BurnPoint> actual) { }

    private final SprintRepository repo;
    private final WorkItemRepository items;
    private final AuditService audit;

    public SprintService(SprintRepository repo, WorkItemRepository items, AuditService audit) { this.repo = repo; this.items = items; this.audit = audit; }

    public List<Sprint> list(String projectId) { return repo.findByProjectIdOrderByStartDesc(projectId); }
    public Sprint get(String id) { return repo.findById(id).orElseThrow(() -> ApiException.notFound("Sprint", id)); }

    public Sprint create(String projectId, Sprint in) {
        if (in.name == null || in.name.isBlank()) throw ApiException.badRequest("Name the sprint.");
        if (in.start == null || in.end == null || !in.end.isAfter(in.start)) throw ApiException.badRequest("The sprint needs a start date before its end date.");
        Sprint s = new Sprint();
        s.projectId = projectId; s.name = in.name.trim(); s.goal = in.goal; s.start = in.start; s.end = in.end; s.capacity = in.capacity; s.createdAt = Instant.now();
        Sprint saved = repo.save(s);
        audit.record("SPRINT_CREATED", "SPRINT", saved.id, projectId, "Created " + saved.name, Map.of("start", s.start.toString(), "end", s.end.toString()));
        return saved;
    }

    public Sprint start(String id) {
        Sprint s = get(id);
        if (s.status != Sprint.Status.PLANNED) throw ApiException.conflict("Only a planned sprint can start.");
        if (repo.findByProjectIdOrderByStartDesc(s.projectId).stream().anyMatch(x -> x.status == Sprint.Status.ACTIVE)) throw ApiException.conflict("Close the active sprint before starting another.");
        s.status = Sprint.Status.ACTIVE;
        s.burndown = new ArrayList<>(List.of(snapshot(s)));
        Sprint saved = repo.save(s);
        audit.record("SPRINT_STARTED", "SPRINT", id, s.projectId, s.name + " started", null);
        return saved;
    }

    public Sprint close(String id) {
        Sprint s = get(id);
        if (s.status != Sprint.Status.ACTIVE) throw ApiException.conflict("Only the active sprint can be closed.");
        s.burndown.add(snapshot(s));
        s.status = Sprint.Status.CLOSED; s.closedAt = Instant.now();
        List<WorkItem> open = items.findBySprintId(id).stream().filter(w -> w.column != WorkItem.Column.DONE).toList();
        open.forEach(w -> { w.sprintId = null; items.save(w); });
        Sprint saved = repo.save(s);
        audit.record("SPRINT_CLOSED", "SPRINT", id, s.projectId, s.name + " closed; " + open.size() + " unfinished item(s) returned to the backlog", null);
        return saved;
    }

    public Burndown burndown(String id) {
        Sprint s = get(id);
        List<WorkItem> in = items.findBySprintId(id);
        int committed = in.stream().mapToInt(w -> w.storyPoints == null ? 0 : w.storyPoints).sum();
        int done = in.stream().filter(w -> w.column == WorkItem.Column.DONE).mapToInt(w -> w.storyPoints == null ? 0 : w.storyPoints).sum();
        List<BurnPoint> actual = new ArrayList<>(s.burndown);
        if (s.status == Sprint.Status.ACTIVE && actual.stream().noneMatch(p -> p.date.equals(LocalDate.now()))) actual.add(new BurnPoint(LocalDate.now(), committed - done, done));
        return new Burndown(s, committed, committed - done, done, in.size(), (int) in.stream().filter(w -> w.column == WorkItem.Column.DONE).count(), actual);
    }

    private BurnPoint snapshot(Sprint s) {
        List<WorkItem> in = items.findBySprintId(s.id);
        int committed = in.stream().mapToInt(w -> w.storyPoints == null ? 0 : w.storyPoints).sum();
        int done = in.stream().filter(w -> w.column == WorkItem.Column.DONE).mapToInt(w -> w.storyPoints == null ? 0 : w.storyPoints).sum();
        return new BurnPoint(LocalDate.now(), committed - done, done);
    }

    @Scheduled(cron = "0 55 23 * * *")
    public void dailySnapshot() {
        for (Sprint s : repo.findByStatus(Sprint.Status.ACTIVE)) {
            s.burndown.removeIf(p -> p.date.equals(LocalDate.now()));
            s.burndown.add(snapshot(s));
            repo.save(s);
        }
    }
}
