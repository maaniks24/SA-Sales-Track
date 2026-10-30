package com.aisdlc.pm.document;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DocumentRepository extends MongoRepository<DocumentRecord, String> {
    List<DocumentRecord> findByWorkItemIdOrderByStageIdAscCreatedAtAsc(String workItemId);
    List<DocumentRecord> findByWorkItemIdAndStageId(String workItemId, String stageId);
    List<DocumentRecord> findByProjectId(String projectId);
}
