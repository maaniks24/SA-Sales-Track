package com.aisdlc.pm.project;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("projects")
public class Project {
    @Id public String id;
    @Indexed(unique = true) public String key;
    public String name;
    public String description;
    public List<String> modules = new ArrayList<>();
    public List<String> surfaces = new ArrayList<>();
    public Integrations integrations = new Integrations();
    public Map<String, Integer> wipLimits = new LinkedHashMap<>(Map.of("INTAKE", 10, "DEFINE", 6, "BUILD", 8, "TEST", 6, "RELEASE", 4));
    public String contextPackVersion = "CP v1.0";
    public String currentRelease;
    public Instant createdAt;
    @Version public Long version;

    public static class Integrations {
        public GitSettings git = new GitSettings();
        public CiSettings ci = new CiSettings();
        public BugzillaSettings bugzilla = new BugzillaSettings();
    }

    /** Secrets are accepted on input and stored, but never returned by the API. */
    public static class GitSettings {
        public String provider;            // GITHUB, GITLAB, BITBUCKET
        public String repoUrl;
        public String defaultBranch = "main";
        @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) public String webhookSecret;
        @Transient @JsonProperty(value = "webhookSecretSet", access = JsonProperty.Access.READ_ONLY)
        public boolean webhookSecretSet() { return webhookSecret != null && !webhookSecret.isBlank(); }
    }

    public static class CiSettings {
        public String provider = "JENKINS";
        public String url;
        public String jobName;
        @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) public String token;
        @Transient @JsonProperty(value = "tokenSet", access = JsonProperty.Access.READ_ONLY)
        public boolean tokenSet() { return token != null && !token.isBlank(); }
    }

    public static class BugzillaSettings {
        public boolean enabled;
        public String baseUrl;
        public String product;
        public String component;
        public String version = "unspecified";
        public boolean resolveOnClose = true;
        @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) public String apiKey;
        @Transient @JsonProperty(value = "apiKeySet", access = JsonProperty.Access.READ_ONLY)
        public boolean apiKeySet() { return apiKey != null && !apiKey.isBlank(); }
    }
}
