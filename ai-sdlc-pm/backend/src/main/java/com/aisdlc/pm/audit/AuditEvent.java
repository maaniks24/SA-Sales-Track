package com.aisdlc.pm.audit;

import java.time.Instant;
import java.util.Map;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** Append-only record of who did what, when, to which item. Never updated or deleted by the application. */
@Document("audit_log")
@CompoundIndex(name = "entity_at", def = "{'entityType': 1, 'entityId': 1, 'at': -1}")
public class AuditEvent {
    @Id public String id;
    @Indexed public Instant at;
    @Indexed public String actor;
    @Indexed public String action;
    public String entityType;
    public String entityId;
    @Indexed public String projectId;
    public String summary;
    public Map<String, Object> details;
    public String correlationId;
}
