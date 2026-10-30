package com.aisdlc.pm.integration;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface IntegrationEventRepository extends MongoRepository<IntegrationEvent, String> {
    List<IntegrationEvent> findTop100ByProjectIdOrderByAtDesc(String projectId);
    List<IntegrationEvent> findTop100ByProjectIdAndSourceOrderByAtDesc(String projectId, String source);
}
