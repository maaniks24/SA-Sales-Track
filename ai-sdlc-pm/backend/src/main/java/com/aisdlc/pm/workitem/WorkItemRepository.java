package com.aisdlc.pm.workitem;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface WorkItemRepository extends MongoRepository<WorkItem, String> {
    Optional<WorkItem> findByKey(String key);
    List<WorkItem> findByProjectId(String projectId);
    List<WorkItem> findByProjectIdAndColumn(String projectId, WorkItem.Column column);
    List<WorkItem> findBySprintId(String sprintId);
    long countByProjectIdAndColumn(String projectId, WorkItem.Column column);
}
