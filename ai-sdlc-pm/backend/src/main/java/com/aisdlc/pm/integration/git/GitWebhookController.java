package com.aisdlc.pm.integration.git;

import java.util.Map;
import java.util.TreeMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

/** Receives GitHub, GitLab and Bitbucket webhooks. Authenticated by the project's webhook secret, not by a user token. */
@RestController
public class GitWebhookController {
    private final GitWebhookService service;
    public GitWebhookController(GitWebhookService service) { this.service = service; }

    @PostMapping("/api/integrations/git/webhook/{projectKey}")
    public GitWebhookService.Result receive(@PathVariable String projectKey, @RequestHeader Map<String, String> headers, @RequestBody String body) {
        Map<String, String> h = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        headers.forEach((k, v) -> h.put(k.toLowerCase(), v));
        return service.handle(projectKey, h, body);
    }
}
