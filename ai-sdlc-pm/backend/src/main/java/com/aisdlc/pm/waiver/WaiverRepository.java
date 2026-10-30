package com.aisdlc.pm.waiver;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface WaiverRepository extends MongoRepository<Waiver, String> {
    List<Waiver> findByProjectIdOrderByRequestedAtDesc(String projectId);
    List<Waiver> findByWorkItemKeyAndStageId(String workItemKey, String stageId);
    List<Waiver> findByStatus(Waiver.Status status);
}
