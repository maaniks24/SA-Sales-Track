package com.aisdlc.pm.project;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectService projects;
    public ProjectController(ProjectService projects) { this.projects = projects; }

    @GetMapping public List<Project> list() { return projects.list(); }
    @GetMapping("/{id}") public Project get(@PathVariable String id) { return projects.get(id); }

    @PostMapping @PreAuthorize("hasAnyRole('ADMIN','ARCHITECT','DELIVERY_MANAGER')")
    public Project create(@RequestBody Project p) { return projects.create(p); }

    @PutMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','ARCHITECT','DELIVERY_MANAGER')")
    public Project update(@PathVariable String id, @RequestBody Project p) { return projects.update(id, p); }

    @PutMapping("/{id}/integrations") @PreAuthorize("hasAnyRole('ADMIN','ARCHITECT','DEVOPS')")
    public Project integrations(@PathVariable String id, @RequestBody Project.Integrations i) { return projects.updateIntegrations(id, i); }
}
