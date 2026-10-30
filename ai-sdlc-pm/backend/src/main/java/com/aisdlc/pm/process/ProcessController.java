package com.aisdlc.pm.process;

import java.io.IOException;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ProcessController {
    private final ProcessService process;
    public ProcessController(ProcessService process) { this.process = process; }

    @GetMapping("/process")
    public ProcessDefinition definition() { return process.definition(); }

    /** Blank template (Word or Excel) as published with the process definition. */
    @GetMapping("/templates/{id}/file")
    public ResponseEntity<byte[]> template(@PathVariable String id) throws IOException {
        String file = process.templateFile(id.toUpperCase());
        byte[] bytes = new ClassPathResource("templates/" + file).getContentAsByteArray();
        MediaType type = MediaTypeFactory.getMediaType(file).orElse(MediaType.APPLICATION_OCTET_STREAM);
        return ResponseEntity.ok().contentType(type)
            .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(file).build().toString()).body(bytes);
    }
}
