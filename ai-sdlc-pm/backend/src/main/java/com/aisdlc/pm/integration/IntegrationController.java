package com.aisdlc.pm.integration;

import com.aisdlc.pm.config.AppProperties;
import com.aisdlc.pm.integration.git.CommitRecord;
import com.aisdlc.pm.integration.git.CommitRecordRepository;
import com.aisdlc.pm.project.Project;
import com.aisdlc.pm.project.ProjectService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class IntegrationController {
    public record Endpoints(String gitWebhook, String ciWebhook, String gateCheck, boolean gitSecretSet, boolean ciTokenSet, boolean bugzillaKeySet) { }

    private final IntegrationEventService events;
    private final CommitRecordRepository commits;
    private final ProjectService projects;
    private final AppProperties props;

    public IntegrationController(IntegrationEventService events, CommitRecordRepository commits, ProjectService projects, AppProperties props) {
        this.events = events; this.commits = commits; this.projects = projects; this.props = props;
    }

    @GetMapping("/api/projects/{pid}/integration-events")
    public List<IntegrationEvent> events(@PathVariable String pid, @RequestParam(required = false) String source) { return events.recent(pid, source); }

    @GetMapping("/api/projects/{pid}/commits")
    public List<CommitRecord> commits(@PathVariable String pid) { return commits.findTop50ByProjectIdOrderByAtDesc(pid); }

    /** URLs to paste into GitHub/GitLab/Bitbucket and the Jenkinsfile. */
    @GetMapping("/api/projects/{pid}/integration-endpoints")
    public Endpoints endpoints(@PathVariable String pid) {
        Project p = projects.get(pid);
        String base = props.publicUrl() == null ? "" : props.publicUrl().replaceAll("/$", "");
        return new Endpoints(base + "/api/integrations/git/webhook/" + p.key, base + "/api/integrations/ci/webhook/" + p.key,
            base + "/api/integrations/ci/gate-check?project=" + p.key + "&workItem={KEY}&gate={G}",
            p.integrations.git.webhookSecretSet(), p.integrations.ci.tokenSet(), p.integrations.bugzilla.apiKeySet());
    }
}
