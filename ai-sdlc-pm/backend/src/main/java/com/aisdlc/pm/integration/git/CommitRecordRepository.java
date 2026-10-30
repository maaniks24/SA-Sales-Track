package com.aisdlc.pm.integration.git;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CommitRecordRepository extends MongoRepository<CommitRecord, String> {
    List<CommitRecord> findByProjectId(String projectId);
    List<CommitRecord> findTop50ByProjectIdOrderByAtDesc(String projectId);
}
