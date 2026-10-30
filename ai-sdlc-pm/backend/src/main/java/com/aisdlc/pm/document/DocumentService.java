package com.aisdlc.pm.document;

import com.aisdlc.pm.audit.AuditService;
import com.aisdlc.pm.common.ApiException;
import com.aisdlc.pm.document.DocumentRecord.DocVersion;
import com.aisdlc.pm.workitem.WorkItem;
import com.aisdlc.pm.workitem.WorkItem.StageState;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;

@Service
public class DocumentService {
    public record Download(String fileName, String contentType, byte[] bytes) { }

    private final DocumentRepository repo;
    private final GridFsTemplate gridFs;
    private final AuditService audit;

    public DocumentService(DocumentRepository repo, GridFsTemplate gridFs, AuditService audit) { this.repo = repo; this.gridFs = gridFs; this.audit = audit; }

    public List<DocumentRecord> forWorkItem(String workItemId) { return repo.findByWorkItemIdOrderByStageIdAscCreatedAtAsc(workItemId); }
    public List<DocumentRecord> forStage(String workItemId, String stageId) { return repo.findByWorkItemIdAndStageId(workItemId, stageId); }
    public DocumentRecord get(String id) { return repo.findById(id).orElseThrow(() -> ApiException.notFound("Document", id)); }

    /** Adds a new version. A document is identified within its stage by template ID, or by title when it has no template. */
    public DocumentRecord upload(WorkItem item, String stageId, String templateId, String title, DocumentRecord.Direction direction,
                                 String comment, String fileName, String contentType, byte[] bytes) {
        StageState st = item.stage(stageId);
        if (st == null) throw ApiException.notFound("Stage", stageId);
        if (st.status == StageState.Status.APPROVED && direction == DocumentRecord.Direction.OUTPUT) {
            throw ApiException.conflict("Gate " + stageId.replace('S', 'G') + " is approved, so this stage's outputs are frozen. Raise a change request to revise them.");
        }
        if (bytes == null || bytes.length == 0) throw ApiException.badRequest("The file is empty.");
        String tpl = templateId == null || templateId.isBlank() ? null : templateId.toUpperCase();
        String name = title == null || title.isBlank() ? fileName : title.trim();
        DocumentRecord d = forStage(item.id, stageId).stream()
            .filter(x -> x.direction == direction && (tpl != null ? tpl.equals(x.templateId) : x.templateId == null && name.equalsIgnoreCase(x.title)))
            .findFirst().orElse(null);
        Instant now = Instant.now();
        if (d == null) {
            d = new DocumentRecord();
            d.projectId = item.projectId; d.workItemId = item.id; d.workItemKey = item.key; d.stageId = stageId;
            d.templateId = tpl; d.title = name; d.direction = direction; d.createdBy = AuditService.currentActor(); d.createdAt = now;
        }
        DocVersion v = new DocVersion();
        v.version = nextMinor(d.currentVersion);
        v.fileName = fileName; v.contentType = contentType == null ? "application/octet-stream" : contentType; v.size = bytes.length;
        v.sha256 = sha256(bytes); v.uploadedBy = AuditService.currentActor(); v.uploadedAt = now; v.comment = comment;
        v.fileId = gridFs.store(new ByteArrayInputStream(bytes), fileName, v.contentType,
            new Document(Map.of("workItem", item.key, "stage", stageId, "version", v.version))).toHexString();
        d.versions.add(v);
        d.currentVersion = v.version;
        d.baselined = false;
        d.updatedAt = now;
        DocumentRecord saved = repo.save(d);
        audit.record("DOC_VERSION_UPLOADED", "DOCUMENT", saved.id, item.projectId,
            item.key + " " + stageId + ": " + saved.title + " v" + v.version, Map.of("workItem", item.key, "stage", stageId, "sha256", v.sha256, "size", v.size));
        return saved;
    }

    /** Baselining records the next major version (0.3 becomes 1.0) against the same file and marks the document ready for the gate. */
    public DocumentRecord baseline(String id, String comment) {
        DocumentRecord d = get(id);
        if (d.versions.isEmpty()) throw ApiException.badRequest("Upload a version before baselining.");
        DocVersion cur = d.versions.get(d.versions.size() - 1);
        if (cur.baseline) throw ApiException.conflict("Version " + cur.version + " is already the baseline.");
        DocVersion b = new DocVersion();
        b.version = nextMajor(cur.version);
        b.fileId = cur.fileId; b.fileName = cur.fileName; b.contentType = cur.contentType; b.size = cur.size; b.sha256 = cur.sha256;
        b.uploadedBy = AuditService.currentActor(); b.uploadedAt = Instant.now(); b.comment = comment == null ? "Baselined from v" + cur.version : comment;
        b.baseline = true;
        d.versions.add(b);
        d.currentVersion = b.version;
        d.baselined = true;
        d.updatedAt = b.uploadedAt;
        DocumentRecord saved = repo.save(d);
        audit.record("DOC_BASELINED", "DOCUMENT", id, d.projectId, d.workItemKey + " " + d.stageId + ": " + d.title + " baselined as v" + b.version,
            Map.of("from", cur.version, "to", b.version, "workItem", String.valueOf(d.workItemKey), "stage", d.stageId));
        return saved;
    }

    public Download download(String id, String version) {
        DocumentRecord d = get(id);
        DocVersion v = version == null ? d.versions.get(d.versions.size() - 1)
            : d.versions.stream().filter(x -> x.version.equals(version)).findFirst().orElseThrow(() -> ApiException.notFound("Version", version));
        var file = gridFs.findOne(Query.query(Criteria.where("_id").is(new ObjectId(v.fileId))));
        if (file == null) throw ApiException.notFound("File for version", v.version);
        GridFsResource r = gridFs.getResource(file);
        try (InputStream in = r.getInputStream()) {
            return new Download(versionedName(v.fileName, v.version), v.contentType, in.readAllBytes());
        } catch (IOException e) {
            throw new IllegalStateException("Could not read the stored file", e);
        }
    }

    static String nextMinor(String v) {
        if (v == null) return "0.1";
        String[] p = v.split("\\.");
        return p[0] + "." + (Integer.parseInt(p[1]) + 1);
    }

    static String nextMajor(String v) {
        if (v == null) return "1.0";
        return (Integer.parseInt(v.split("\\.")[0]) + 1) + ".0";
    }

    static String versionedName(String fileName, String version) {
        int dot = fileName.lastIndexOf('.');
        return dot < 0 ? fileName + "_v" + version : fileName.substring(0, dot) + "_v" + version + fileName.substring(dot);
    }

    static String sha256(byte[] bytes) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
