package com.aisdlc.pm.project;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProjectRepository extends MongoRepository<Project, String> {
    Optional<Project> findByKey(String key);
    boolean existsByKey(String key);
}
