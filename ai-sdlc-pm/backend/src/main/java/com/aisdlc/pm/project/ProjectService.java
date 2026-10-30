package com.aisdlc.pm.project;

import com.aisdlc.pm.audit.AuditService;
import com.aisdlc.pm.common.ApiException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class ProjectService {
    private final ProjectRepository repo;
    private final AuditService audit;

    public ProjectService(ProjectRepository repo, AuditService audit) { this.repo = repo; this.audit = audit; }

    public List<Project> list() { return repo.findAll(Sort.by("name")); }
    public Project get(String id) { return repo.findById(id).orElseThrow(() -> ApiException.notFound("Project", id)); }
    public Project byKey(String key) { return repo.findByKey(key.toUpperCase()).orElseThrow(() -> ApiException.notFound("Project", key)); }

    public Project create(Project p) {
        if (p.key == null || !p.key.toUpperCase().matches("[A-Z][A-Z0-9]{1,9}")) throw ApiException.badRequest("Project keys are 2 to 10 letters or digits, starting with a letter.");
        p.key = p.key.toUpperCase();
        if (repo.existsByKey(p.key)) throw ApiException.conflict("Project key " + p.key + " is already used.");
        if (p.name == null || p.name.isBlank()) throw ApiException.badRequest("A project needs a name.");
        p.id = null; p.createdAt = Instant.now();
        if (p.integrations == null) p.integrations = new Project.Integrations();
        Project saved = repo.save(p);
        audit.record("PROJECT_CREATED", "PROJECT", saved.id, saved.id, "Created project " + saved.key, null);
        return saved;
    }

    public Project update(String id, Project in) {
        Project p = get(id);
        if (in.name != null) p.name = in.name;
        if (in.description != null) p.description = in.description;
        if (in.modules != null) p.modules = in.modules;
        if (in.surfaces != null) p.surfaces = in.surfaces;
        if (in.wipLimits != null) p.wipLimits = in.wipLimits;
        if (in.contextPackVersion != null) p.contextPackVersion = in.contextPackVersion;
        if (in.currentRelease != null) p.currentRelease = in.currentRelease;
        Project saved = repo.save(p);
        audit.record("PROJECT_UPDATED", "PROJECT", id, id, "Updated project settings", Map.of("wipLimits", p.wipLimits, "contextPack", p.contextPackVersion));
        return saved;
    }

    /** Merge integration settings; a blank secret in the request keeps the stored one. */
    public Project updateIntegrations(String id, Project.Integrations in) {
        Project p = get(id);
        Project.Integrations cur = p.integrations;
        if (in.git != null) {
            String keep = cur.git.webhookSecret;
            cur.git = in.git;
            if (cur.git.webhookSecret == null || cur.git.webhookSecret.isBlank()) cur.git.webhookSecret = keep;
        }
        if (in.ci != null) {
            String keep = cur.ci.token;
            cur.ci = in.ci;
            if (cur.ci.token == null || cur.ci.token.isBlank()) cur.ci.token = keep;
        }
        if (in.bugzilla != null) {
            String keep = cur.bugzilla.apiKey;
            cur.bugzilla = in.bugzilla;
            if (cur.bugzilla.apiKey == null || cur.bugzilla.apiKey.isBlank()) cur.bugzilla.apiKey = keep;
        }
        Project saved = repo.save(p);
        audit.record("INTEGRATIONS_UPDATED", "PROJECT", id, id, "Updated integration settings",
            Map.of("git", String.valueOf(cur.git.provider), "ci", String.valueOf(cur.ci.url), "bugzilla", cur.bugzilla.enabled));
        return saved;
    }
}
