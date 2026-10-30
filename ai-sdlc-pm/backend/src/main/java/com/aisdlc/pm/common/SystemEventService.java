package com.aisdlc.pm.common;

import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;

@Service
public class SystemEventService {
    private static final Logger log = LoggerFactory.getLogger(SystemEventService.class);
    private final SystemEventRepository repo;

    public SystemEventService(SystemEventRepository repo) { this.repo = repo; }

    public void record(String level, String source, String message, Throwable ex, String path) {
        try {
            SystemEvent e = new SystemEvent();
            e.at = Instant.now();
            e.level = level; e.source = source; e.message = message; e.path = path;
            e.exception = ex == null ? null : ex.getClass().getName() + ": " + String.valueOf(ex.getMessage());
            e.correlationId = MDC.get("correlationId");
            e.actor = MDC.get("user");
            repo.save(e);
        } catch (RuntimeException storeFailure) {
            // never let error recording hide the original problem
            log.warn("Could not store system event: {}", storeFailure.getMessage());
        }
    }
}
