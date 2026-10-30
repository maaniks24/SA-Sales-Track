package com.aisdlc.pm.trace;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RequirementRepository extends MongoRepository<Requirement, String> {
    List<Requirement> findByProjectIdOrderByReqIdAsc(String projectId);
    Optional<Requirement> findByProjectIdAndReqId(String projectId, String reqId);
}
