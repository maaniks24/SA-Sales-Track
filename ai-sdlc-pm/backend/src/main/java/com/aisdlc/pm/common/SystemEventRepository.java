package com.aisdlc.pm.common;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SystemEventRepository extends MongoRepository<SystemEvent, String> {
    Page<SystemEvent> findByLevel(String level, Pageable pageable);
}
