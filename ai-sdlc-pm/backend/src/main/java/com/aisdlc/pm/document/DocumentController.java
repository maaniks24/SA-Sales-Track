package com.aisdlc.pm.document;

import com.aisdlc.pm.process.ProcessService;
import com.aisdlc.pm.workitem.WorkItem;
import com.aisdlc.pm.workitem.WorkItemService;
import java.io.IOException;
import java.util.List;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class DocumentController {
    /** Documents of a work item, plus the inputs each stage consumes from earlier stages (by template). */
    public record StageInput(String stageId, String templateId, String templateName, DocumentRecord source) { }
    public record DocumentsView(List<DocumentRecord> documents, List<StageInput> inputs) { }
    public record Baseline(String comment) { }

    private final DocumentService docs;
    private final WorkItemService items;
    private final ProcessService process;

    public DocumentController(DocumentService docs, WorkItemService items, ProcessService process) { this.docs = docs; this.items = items; this.process = process; }

    @GetMapping("/work-items/{key}/documents")
    public DocumentsView list(@PathVariable String key) {
        WorkItem w = items.get(key);
        List<DocumentRecord> all = docs.forWorkItem(w.id);
        List<StageInput> inputs = process.stages().stream().flatMap(s -> s.inputTemplates().stream().map(t -> new StageInput(s.id(), t, process.template(t).name(),
            all.stream().filter(d -> t.equals(d.templateId) && !d.stageId.equals(s.id()) && d.direction == DocumentRecord.Direction.OUTPUT)
                .max((a, b) -> a.updatedAt.compareTo(b.updatedAt)).orElse(null)))).toList();
        return new DocumentsView(all, inputs);
    }

    @PostMapping(value = "/work-items/{key}/stages/{stageId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DocumentRecord upload(@PathVariable String key, @PathVariable String stageId, @RequestPart("file") MultipartFile file,
                                 @RequestParam(required = false) String templateId, @RequestParam(required = false) String title,
                                 @RequestParam(defaultValue = "OUTPUT") DocumentRecord.Direction direction, @RequestParam(required = false) String comment) throws IOException {
        return docs.upload(items.get(key), stageId, templateId, title, direction, comment, file.getOriginalFilename(), file.getContentType(), file.getBytes());
    }

    @PostMapping("/documents/{id}/baseline")
    public DocumentRecord baseline(@PathVariable String id, @RequestBody(required = false) Baseline b) { return docs.baseline(id, b == null ? null : b.comment()); }

    @GetMapping("/documents/{id}/versions/{version}/file")
    public ResponseEntity<byte[]> download(@PathVariable String id, @PathVariable String version) {
        DocumentService.Download d = docs.download(id, version);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(d.contentType()))
            .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(d.fileName()).build().toString()).body(d.bytes());
    }
}
