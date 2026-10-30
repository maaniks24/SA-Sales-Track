package com.aisdlc.pm.audit;

import com.aisdlc.pm.common.PageResult;
import com.aisdlc.pm.common.SystemEvent;
import com.aisdlc.pm.common.SystemEventRepository;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuditController {
    private final AuditService audit;
    private final SystemEventRepository systemEvents;

    public AuditController(AuditService audit, SystemEventRepository systemEvents) { this.audit = audit; this.systemEvents = systemEvents; }

    @GetMapping("/audit")
    public PageResult<AuditEvent> search(@RequestParam(required = false) String projectId, @RequestParam(required = false) String actor,
                                         @RequestParam(required = false) String action, @RequestParam(required = false) String entityType,
                                         @RequestParam(required = false) String entityId,
                                         @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
                                         @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
                                         @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        return audit.search(projectId, actor, action, entityType, entityId, from, to, page, size);
    }

    @GetMapping(value = "/audit/export", produces = "text/csv")
    public ResponseEntity<byte[]> export(@RequestParam(required = false) String projectId, @RequestParam(required = false) String action) {
        PageResult<AuditEvent> all = audit.search(projectId, null, action, null, null, null, null, 0, 200);
        StringBuilder sb = new StringBuilder("time,actor,action,entity_type,entity_id,summary,correlation_id\n");
        for (AuditEvent e : all.items()) {
            sb.append(e.at).append(',').append(csv(e.actor)).append(',').append(e.action).append(',').append(csv(e.entityType)).append(',')
              .append(csv(e.entityId)).append(',').append(csv(e.summary)).append(',').append(csv(e.correlationId)).append('\n');
        }
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=audit-log.csv")
            .contentType(MediaType.parseMediaType("text/csv")).body(sb.toString().getBytes(StandardCharsets.UTF_8));
    }

    @GetMapping("/system-events")
    @PreAuthorize("hasAnyRole('ADMIN','COUNCIL','DEVOPS')")
    public PageResult<SystemEvent> systemEvents(@RequestParam(required = false) String level, @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "50") int size) {
        PageRequest pr = PageRequest.of(page, Math.min(size, 200), Sort.by(Sort.Direction.DESC, "at"));
        return PageResult.of(level == null ? systemEvents.findAll(pr) : systemEvents.findByLevel(level, pr));
    }

    static String csv(String s) {
        if (s == null) return "";
        String v = s.replace("\"", "\"\"");
        return v.contains(",") || v.contains("\n") || v.contains("\"") ? "\"" + v + "\"" : v;
    }
}
