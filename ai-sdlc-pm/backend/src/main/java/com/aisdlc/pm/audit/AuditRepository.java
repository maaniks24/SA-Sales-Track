package com.aisdlc.pm.audit;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AuditRepository extends MongoRepository<AuditEvent, String> {
    List<AuditEvent> findTop20ByProjectIdOrderByAtDesc(String projectId);
    List<AuditEvent> findByEntityTypeAndEntityIdOrderByAtDesc(String entityType, String entityId);
}
