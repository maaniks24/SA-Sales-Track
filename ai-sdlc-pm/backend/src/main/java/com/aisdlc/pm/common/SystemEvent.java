package com.aisdlc.pm.common;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** Technical events kept for support: unexpected errors and integration failures. */
@Document("system_events")
public class SystemEvent {
    @Id public String id;
    @Indexed public Instant at;
    public String level;          // ERROR, WARN, INFO
    public String source;         // API, GIT, CI, BUGZILLA, SCHEDULER
    public String message;
    public String exception;
    public String path;
    public String correlationId;
    public String actor;
}
