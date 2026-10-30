package com.aisdlc.pm.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(Jwt jwt, Cors cors, Mongo mongo, Seed seed, String publicUrl, Bugzilla bugzilla) {
    public record Jwt(String secret, int ttlHours) { }
    public record Cors(List<String> allowedOrigins) { }
    public record Mongo(boolean embedded, String embeddedFile) { }
    public record Seed(boolean enabled) { }
    public record Bugzilla(String syncCron) { }
}
