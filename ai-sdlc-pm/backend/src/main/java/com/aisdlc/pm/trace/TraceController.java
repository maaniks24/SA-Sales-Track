package com.aisdlc.pm.trace;

import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects/{projectId}/requirements")
public class TraceController {
    private final TraceService trace;
    public TraceController(TraceService trace) { this.trace = trace; }

    @GetMapping public List<Requirement> matrix(@PathVariable String projectId) { return trace.matrix(projectId); }
    @PostMapping public Requirement save(@PathVariable String projectId, @RequestBody Requirement r) { return trace.save(projectId, r); }

    @GetMapping(value = "/export", produces = "text/csv")
    public ResponseEntity<byte[]> export(@PathVariable String projectId) {
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=traceability-matrix.csv")
            .contentType(MediaType.parseMediaType("text/csv")).body(trace.csv(projectId).getBytes(StandardCharsets.UTF_8));
    }
}
