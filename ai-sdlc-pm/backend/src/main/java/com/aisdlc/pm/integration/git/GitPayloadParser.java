package com.aisdlc.pm.integration.git;

import static com.aisdlc.pm.integration.Json.at;
import static com.aisdlc.pm.integration.Json.str;

import com.aisdlc.pm.common.ApiException;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/** Reads GitHub, GitLab and Bitbucket Cloud webhook payloads into a GitEvent. Unsupported events return null. */
@Component
public class GitPayloadParser {
    private final JsonMapper json;
    public GitPayloadParser(JsonMapper json) { this.json = json; }

    public GitEvent parse(String provider, String eventHeader, String body) {
        JsonNode root;
        try { root = json.readTree(body); } catch (RuntimeException e) { throw ApiException.badRequest("The webhook body is not valid JSON."); }
        return switch (provider) {
            case "GITHUB" -> github(eventHeader, root);
            case "GITLAB" -> gitlab(eventHeader, root);
            case "BITBUCKET" -> bitbucket(eventHeader, root);
            default -> throw ApiException.badRequest("Unknown Git provider " + provider);
        };
    }

    private GitEvent github(String event, JsonNode r) {
        if ("push".equals(event)) {
            List<GitEvent.Commit> cs = new ArrayList<>();
            JsonNode arr = at(r, "commits");
            if (arr != null) for (JsonNode c : arr.values()) cs.add(new GitEvent.Commit(str(c, "id"), str(c, "message"), str(c, "author", "name"), str(c, "url"), time(str(c, "timestamp"))));
            return new GitEvent("GITHUB", "push", branch(str(r, "ref")), cs, null);
        }
        if ("pull_request".equals(event)) {
            JsonNode pr = at(r, "pull_request");
            String state = "true".equals(str(pr, "merged")) ? "MERGED" : "closed".equals(str(pr, "state")) ? "CLOSED" : "OPEN";
            return new GitEvent("GITHUB", "pull_request", str(pr, "head", "ref"), List.of(),
                new GitEvent.PullRequest(str(pr, "number"), str(pr, "title"), str(pr, "html_url"), state, str(pr, "head", "ref"), str(pr, "base", "ref"), str(pr, "user", "login")));
        }
        return null;
    }

    private GitEvent gitlab(String event, JsonNode r) {
        if ("Push Hook".equals(event)) {
            List<GitEvent.Commit> cs = new ArrayList<>();
            JsonNode arr = at(r, "commits");
            if (arr != null) for (JsonNode c : arr.values()) cs.add(new GitEvent.Commit(str(c, "id"), str(c, "message"), str(c, "author", "name"), str(c, "url"), time(str(c, "timestamp"))));
            return new GitEvent("GITLAB", "push", branch(str(r, "ref")), cs, null);
        }
        if ("Merge Request Hook".equals(event)) {
            JsonNode mr = at(r, "object_attributes");
            String s = str(mr, "state");
            String state = "merged".equals(s) ? "MERGED" : "closed".equals(s) ? "CLOSED" : "OPEN";
            return new GitEvent("GITLAB", "pull_request", str(mr, "source_branch"), List.of(),
                new GitEvent.PullRequest(str(mr, "iid"), str(mr, "title"), str(mr, "url"), state, str(mr, "source_branch"), str(mr, "target_branch"), str(r, "user", "username")));
        }
        return null;
    }

    private GitEvent bitbucket(String event, JsonNode r) {
        if ("repo:push".equals(event)) {
            List<GitEvent.Commit> cs = new ArrayList<>();
            String branch = null;
            JsonNode changes = at(r, "push", "changes");
            if (changes != null) for (JsonNode ch : changes.values()) {
                if (branch == null) branch = str(ch, "new", "name");
                JsonNode arr = at(ch, "commits");
                if (arr != null) for (JsonNode c : arr.values()) cs.add(new GitEvent.Commit(str(c, "hash"), str(c, "message"), str(c, "author", "raw"), str(c, "links", "html", "href"), time(str(c, "date"))));
            }
            return new GitEvent("BITBUCKET", "push", branch, cs, null);
        }
        if (event != null && event.startsWith("pullrequest:")) {
            JsonNode pr = at(r, "pullrequest");
            String s = str(pr, "state");
            String state = "MERGED".equals(s) ? "MERGED" : "DECLINED".equals(s) || "SUPERSEDED".equals(s) ? "CLOSED" : "OPEN";
            return new GitEvent("BITBUCKET", "pull_request", str(pr, "source", "branch", "name"), List.of(),
                new GitEvent.PullRequest(str(pr, "id"), str(pr, "title"), str(pr, "links", "html", "href"), state, str(pr, "source", "branch", "name"),
                    str(pr, "destination", "branch", "name"), str(pr, "author", "display_name")));
        }
        return null;
    }

    static String branch(String ref) { return ref == null ? null : ref.replaceFirst("^refs/heads/", ""); }

    static Instant time(String s) {
        if (s == null) return Instant.now();
        try { return OffsetDateTime.parse(s).toInstant(); } catch (RuntimeException e) { return Instant.now(); }
    }
}
