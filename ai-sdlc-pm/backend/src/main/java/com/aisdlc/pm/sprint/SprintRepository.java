package com.aisdlc.pm.sprint;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SprintRepository extends MongoRepository<Sprint, String> {
    List<Sprint> findByProjectIdOrderByStartDesc(String projectId);
    List<Sprint> findByStatus(Sprint.Status status);
}
