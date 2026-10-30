package com.aisdlc.pm.integration.bugzilla;

import com.aisdlc.pm.project.Project;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import tools.jackson.databind.JsonNode;

/** Thin wrapper over the Bugzilla 5 REST API (/rest/bug). Authenticates with the project's API key. */
@Component
public class BugzillaClient {
    public record Bug(long id, String summary, String status, String resolution, String severity, String priority, String component, String product) { }

    public static class BugzillaException extends RuntimeException {
        public BugzillaException(String message, Throwable cause) { super(message, cause); }
    }

    private final RestClient.Builder builder;   // timeouts come from spring.http.clients.* in application.yml

    public BugzillaClient(RestClient.Builder builder) { this.builder = builder; }

    public String version(Project.BugzillaSettings s) {
        JsonNode r = call(s, "check the connection", c -> c.get().uri("/rest/version").retrieve().body(JsonNode.class));
        return r == null ? null : r.path("version").asString();
    }

    public Bug get(Project.BugzillaSettings s, long id) {
        JsonNode r = call(s, "read bug " + id, c -> c.get().uri("/rest/bug/{id}", id).retrieve().body(JsonNode.class));
        JsonNode bugs = r == null ? null : r.path("bugs");
        if (bugs == null || !bugs.isArray() || bugs.isEmpty()) throw new BugzillaException("Bug " + id + " was not found in Bugzilla", null);
        return bug(bugs.get(0));
    }

    public List<Bug> searchOpen(Project.BugzillaSettings s) {
        JsonNode r = call(s, "search open bugs", c -> c.get().uri(u -> {
            u.path("/rest/bug").queryParam("product", s.product).queryParam("resolution", "---");
            if (s.component != null && !s.component.isBlank()) u.queryParam("component", s.component);
            return u.queryParam("include_fields", "id,summary,status,resolution,severity,priority,component,product").build();
        }).retrieve().body(JsonNode.class));
        List<Bug> out = new ArrayList<>();
        if (r != null && r.path("bugs").isArray()) for (JsonNode b : r.path("bugs").values()) out.add(bug(b));
        return out;
    }

    public long create(Project.BugzillaSettings s, String summary, String description, String severity) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("product", s.product); body.put("component", s.component); body.put("version", s.version == null ? "unspecified" : s.version);
        body.put("summary", summary); body.put("description", description == null ? summary : description); body.put("severity", severity);
        body.put("op_sys", "All"); body.put("platform", "All");
        JsonNode r = call(s, "create a bug", c -> c.post().uri("/rest/bug").contentType(MediaType.APPLICATION_JSON).body(body).retrieve().body(JsonNode.class));
        if (r == null || r.path("id").asLong() == 0) throw new BugzillaException("Bugzilla did not return an id for the new bug", null);
        return r.path("id").asLong();
    }

    public void resolve(Project.BugzillaSettings s, long id, String comment) {
        Map<String, Object> body = Map.of("status", "RESOLVED", "resolution", "FIXED", "comment", Map.of("body", comment));
        call(s, "resolve bug " + id, c -> c.put().uri("/rest/bug/{id}", id).contentType(MediaType.APPLICATION_JSON).body(body).retrieve().body(JsonNode.class));
    }

    public void comment(Project.BugzillaSettings s, long id, String text) {
        call(s, "comment on bug " + id, c -> c.post().uri("/rest/bug/{id}/comment", id).contentType(MediaType.APPLICATION_JSON).body(Map.of("comment", text)).retrieve().body(JsonNode.class));
    }

    public static String bugUrl(Project.BugzillaSettings s, long id) { return trim(s.baseUrl) + "/show_bug.cgi?id=" + id; }

    /** Process severity (P1-P4) to Bugzilla severity, and back. */
    public static String toBugzillaSeverity(String p) {
        return switch (p == null ? "" : p) { case "P1" -> "critical"; case "P2" -> "major"; case "P4" -> "minor"; default -> "normal"; };
    }

    public static String fromBugzillaSeverity(String s) {
        return switch (s == null ? "" : s.toLowerCase()) { case "blocker", "critical" -> "P1"; case "major" -> "P2"; case "minor", "trivial" -> "P4"; default -> "P3"; };
    }

    private interface Call { JsonNode run(RestClient c); }

    private JsonNode call(Project.BugzillaSettings s, String what, Call fn) {
        if (s == null || !s.enabled || s.baseUrl == null || s.baseUrl.isBlank()) throw new BugzillaException("Bugzilla is not configured for this project", null);
        RestClient c = builder.clone().baseUrl(trim(s.baseUrl)).defaultHeader("Accept", "application/json")
            .defaultHeaders(h -> { if (s.apiKey != null && !s.apiKey.isBlank()) h.set("X-BUGZILLA-API-KEY", s.apiKey); })
            .build();
        try {
            return fn.run(c);
        } catch (RestClientException e) {
            throw new BugzillaException("Could not " + what + ": " + e.getMessage(), e);
        }
    }

    private static Bug bug(JsonNode b) {
        return new Bug(b.path("id").asLong(), b.path("summary").asString(), b.path("status").asString(), b.path("resolution").asString(),
            b.path("severity").asString(), b.path("priority").asString(), b.path("component").asString(), b.path("product").asString());
    }

    private static String trim(String u) { return u.endsWith("/") ? u.substring(0, u.length() - 1) : u; }
}
