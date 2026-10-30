package com.aisdlc.pm.integration;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** What each integration received or did, so a team can see why a commit, build or bug did or did not link. */
@Document("integration_events")
public class IntegrationEvent {
    @Id public String id;
    @Indexed public String projectId;
    public String source;      // GIT, CI, BUGZILLA
    public String type;        // push, pull_request, build, gate-check, sync, create, link, import
    public String status;      // PROCESSED, IGNORED, FAILED, REJECTED
    public String summary;
    public String detail;
    @Indexed public Instant at;
}
