package com.aisdlc.pm.sprint;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SprintController {
    private final SprintService sprints;
    public SprintController(SprintService sprints) { this.sprints = sprints; }

    @GetMapping("/projects/{projectId}/sprints") public List<Sprint> list(@PathVariable String projectId) { return sprints.list(projectId); }
    @PostMapping("/projects/{projectId}/sprints") public Sprint create(@PathVariable String projectId, @RequestBody Sprint s) { return sprints.create(projectId, s); }
    @PostMapping("/sprints/{id}/start") public Sprint start(@PathVariable String id) { return sprints.start(id); }
    @PostMapping("/sprints/{id}/close") public Sprint close(@PathVariable String id) { return sprints.close(id); }
    @GetMapping("/sprints/{id}/burndown") public SprintService.Burndown burndown(@PathVariable String id) { return sprints.burndown(id); }
}
