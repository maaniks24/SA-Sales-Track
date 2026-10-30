package com.aisdlc.pm.document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** A stage document (input or output) with its full version history. File content lives in GridFS. */
@Document("documents")
public class DocumentRecord {
    public enum Direction { INPUT, OUTPUT }

    @Id public String id;
    @Indexed public String projectId;
    @Indexed public String workItemId;
    public String workItemKey;
    public String stageId;
    public String templateId;          // T01..T15, X01, or null for other documents
    public String title;
    public Direction direction = Direction.OUTPUT;
    public boolean baselined;
    public String currentVersion;
    public List<DocVersion> versions = new ArrayList<>();
    public String createdBy;
    public Instant createdAt;
    public Instant updatedAt;

    public static class DocVersion {
        public String version;         // 0.1, 0.2 ... 1.0 at baseline
        public String fileId;
        public String fileName;
        public String contentType;
        public long size;
        public String sha256;
        public String uploadedBy;
        public Instant uploadedAt;
        public String comment;
        public boolean baseline;
    }
}
