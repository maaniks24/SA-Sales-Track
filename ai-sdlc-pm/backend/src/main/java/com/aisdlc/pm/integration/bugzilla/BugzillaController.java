package com.aisdlc.pm.integration.bugzilla;

import com.aisdlc.pm.workitem.WorkItem;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BugzillaController {
    private final BugzillaService bugzilla;
    public BugzillaController(BugzillaService bugzilla) { this.bugzilla = bugzilla; }

    @PostMapping("/api/work-items/{key}/bugs")
    public WorkItem link(@PathVariable String key, @RequestBody Map<String, Long> body) { return bugzilla.link(key, body.getOrDefault("bugId", 0L)); }

    @DeleteMapping("/api/work-items/{key}/bugs/{bugId}")
    public WorkItem unlink(@PathVariable String key, @PathVariable long bugId) { return bugzilla.unlink(key, bugId); }

    @PostMapping("/api/work-items/{key}/bugs/create")
    public WorkItem create(@PathVariable String key) { return bugzilla.createBug(key); }

    @PostMapping("/api/work-items/{key}/bugs/refresh")
    public WorkItem refresh(@PathVariable String key) { return bugzilla.refresh(key); }

    @PostMapping("/api/projects/{pid}/bugzilla/import")
    @PreAuthorize("hasAnyRole('ADMIN','BUSINESS_ANALYST','QA_LEAD','TECH_LEAD','DELIVERY_MANAGER')")
    public BugzillaService.ImportResult importOpen(@PathVariable String pid) { return bugzilla.importOpen(pid); }

    @PostMapping("/api/projects/{pid}/bugzilla/test")
    public BugzillaService.ConnectionResult test(@PathVariable String pid) { return bugzilla.test(pid); }
}
