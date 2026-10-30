package com.aisdlc.pm.integration.git;

import com.aisdlc.pm.audit.AuditService;
import com.aisdlc.pm.common.ApiException;
import com.aisdlc.pm.common.Ids;
import com.aisdlc.pm.integration.IntegrationEventService;
import com.aisdlc.pm.project.Project;
import com.aisdlc.pm.project.ProjectService;
import com.aisdlc.pm.trace.TraceService;
import com.aisdlc.pm.workitem.WorkItem;
import com.aisdlc.pm.workitem.WorkItemRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;

@Service
public class GitWebhookService {
    public record Result(String status, String summary, List<String> linkedWorkItems, int commits, int commitsWithoutId) { }

    private final ProjectService projects;
    private final GitPayloadParser parser;
    private final WorkItemRepository items;
    private final CommitRecordRepository commits;
    private final TraceService trace;
    private final IntegrationEventService events;
    private final AuditService audit;

    public GitWebhookService(ProjectService projects, GitPayloadParser parser, WorkItemRepository items, CommitRecordRepository commits,
                             TraceService trace, IntegrationEventService events, AuditService audit) {
        this.projects = projects; this.parser = parser; this.items = items; this.commits = commits; this.trace = trace; this.events = events; this.audit = audit;
    }

    public Result handle(String projectKey, Map<String, String> headers, String body) {
        Project p = projects.byKey(projectKey);
        String provider = provider(headers);
        verify(p, provider, headers, body);
        String eventName = switch (provider) {
            case "GITHUB" -> headers.get("x-github-event");
            case "GITLAB" -> headers.get("x-gitlab-event");
            default -> headers.get("x-event-key");
        };
        GitEvent ev = parser.parse(provider, eventName, body);
        if (ev == null) {
            events.record(p.id, "GIT", String.valueOf(eventName), "IGNORED", provider + " event '" + eventName + "' is not used", null);
            return new Result("IGNORED", "Event type not used", List.of(), 0, 0);
        }
        List<WorkItem> all = items.findByProjectId(p.id);
        Map<String, WorkItem> byKey = all.stream().collect(Collectors.toMap(w -> w.key, w -> w));
        Set<String> linked = new LinkedHashSet<>();
        int noId = 0;
        for (GitEvent.Commit c : ev.commits()) {
            String text = c.message() + " " + (ev.branch() == null ? "" : ev.branch());
            Set<String> keys = Ids.find(Ids.WORK_ITEM, text).stream().filter(byKey::containsKey).collect(Collectors.toCollection(LinkedHashSet::new));
            Set<String> reqs = Ids.find(Ids.REQ, c.message());
            boolean valid = Ids.hasProcessId(c.message(), byKey.keySet());
            if (!valid) noId++;
            CommitRecord rec = new CommitRecord();
            rec.id = p.id + ":" + c.sha(); rec.projectId = p.id; rec.sha = c.sha(); rec.message = c.message(); rec.author = c.author(); rec.branch = ev.branch();
            rec.url = c.url(); rec.at = c.at(); rec.validId = valid; rec.workItemKeys.addAll(keys); rec.requirementIds.addAll(reqs);
            commits.save(rec);
            for (String k : keys) {
                WorkItem w = byKey.get(k);
                if (w.commits.stream().noneMatch(x -> c.sha().equals(x.sha))) {
                    WorkItem.CommitRef ref = new WorkItem.CommitRef();
                    ref.sha = c.sha(); ref.message = c.message(); ref.author = c.author(); ref.branch = ev.branch(); ref.url = c.url(); ref.at = c.at(); ref.validId = valid;
                    w.commits.add(ref);
                    w.updatedAt = Instant.now();
                    items.save(w);
                }
                linked.add(k);
            }
            for (String r : reqs) trace.linkCode(p.id, r, c.sha(), null, "commit " + abbrev(c.sha()));
        }
        if (ev.pullRequest() != null) {
            GitEvent.PullRequest pr = ev.pullRequest();
            String text = pr.title() + " " + pr.sourceBranch();
            for (String k : Ids.find(Ids.WORK_ITEM, text)) {
                WorkItem w = byKey.get(k);
                if (w == null) continue;
                WorkItem.PullRequestRef ref = w.pullRequests.stream().filter(x -> pr.number().equals(x.number)).findFirst().orElseGet(() -> {
                    WorkItem.PullRequestRef n = new WorkItem.PullRequestRef(); n.number = pr.number(); w.pullRequests.add(n); return n;
                });
                ref.provider = provider; ref.title = pr.title(); ref.url = pr.url(); ref.state = pr.state(); ref.sourceBranch = pr.sourceBranch();
                ref.targetBranch = pr.targetBranch(); ref.author = pr.author(); ref.updatedAt = Instant.now();
                w.updatedAt = Instant.now();
                items.save(w);
                linked.add(k);
            }
            for (String r : Ids.find(Ids.REQ, pr.title())) trace.linkCode(p.id, r, null, pr.url() == null ? "PR " + pr.number() : pr.url(), "pull request " + pr.number());
        }
        String summary = ev.pullRequest() != null
            ? "Pull request " + ev.pullRequest().number() + " " + ev.pullRequest().state().toLowerCase() + (linked.isEmpty() ? ", no work item key in title or branch" : " → " + String.join(", ", linked))
            : ev.commits().size() + " commit(s) on " + ev.branch() + (linked.isEmpty() ? "" : " → " + String.join(", ", linked)) + (noId > 0 ? "; " + noId + " without a valid ID" : "");
        events.record(p.id, "GIT", ev.kind(), linked.isEmpty() && ev.pullRequest() != null ? "IGNORED" : "PROCESSED", provider + ": " + summary, null);
        if (!linked.isEmpty()) audit.recordAs("git:" + provider.toLowerCase(), ev.kind().equals("push") ? "GIT_PUSH" : "GIT_PULL_REQUEST", "PROJECT", p.key, p.id, summary, null);
        return new Result("PROCESSED", summary, List.copyOf(linked), ev.commits().size(), noId);
    }

    static String provider(Map<String, String> h) {
        if (h.containsKey("x-github-event")) return "GITHUB";
        if (h.containsKey("x-gitlab-event")) return "GITLAB";
        if (h.containsKey("x-event-key")) return "BITBUCKET";
        throw ApiException.badRequest("Unrecognised webhook: expected GitHub, GitLab or Bitbucket event headers.");
    }

    private void verify(Project p, String provider, Map<String, String> h, String body) {
        String secret = p.integrations.git.webhookSecret;
        if (secret == null || secret.isBlank()) {
            events.record(p.id, "GIT", "verify", "REJECTED", "Webhook received but no secret is configured for " + p.key, null);
            throw ApiException.unauthorized("Configure a webhook secret for this project before sending webhooks.");
        }
        boolean ok = switch (provider) {
            case "GITLAB" -> constantEquals(secret, h.get("x-gitlab-token"));
            case "GITHUB" -> constantEquals("sha256=" + hmac(secret, body), h.get("x-hub-signature-256"));
            default -> constantEquals("sha256=" + hmac(secret, body), h.getOrDefault("x-hub-signature", h.get("x-hub-signature-256")));
        };
        if (!ok) {
            events.record(p.id, "GIT", "verify", "REJECTED", provider + " webhook signature did not match", null);
            throw ApiException.unauthorized("The webhook signature or token is not valid.");
        }
    }

    public static String hmac(String secret, String body) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(body.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    static boolean constantEquals(String a, String b) {
        return a != null && b != null && MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }

    static String abbrev(String sha) { return sha == null ? "" : sha.substring(0, Math.min(8, sha.length())); }
}
