package com.aisdlc.pm.integration;

import java.time.Instant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class IntegrationEventService {
    private static final Logger log = LoggerFactory.getLogger("integration");
    private final IntegrationEventRepository repo;

    public IntegrationEventService(IntegrationEventRepository repo) { this.repo = repo; }

    public IntegrationEvent record(String projectId, String source, String type, String status, String summary, String detail) {
        IntegrationEvent e = new IntegrationEvent();
        e.projectId = projectId; e.source = source; e.type = type; e.status = status; e.summary = summary;
        e.detail = detail == null || detail.length() <= 2000 ? detail : detail.substring(0, 2000) + "…";
        e.at = Instant.now();
        if ("FAILED".equals(status) || "REJECTED".equals(status)) log.warn("{} {} {}: {}", source, type, status, summary);
        else log.info("{} {} {}: {}", source, type, status, summary);
        return repo.save(e);
    }

    public List<IntegrationEvent> recent(String projectId, String source) {
        return source == null || source.isBlank() ? repo.findTop100ByProjectIdOrderByAtDesc(projectId) : repo.findTop100ByProjectIdAndSourceOrderByAtDesc(projectId, source);
    }
}
