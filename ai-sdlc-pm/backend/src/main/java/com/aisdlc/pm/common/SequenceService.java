package com.aisdlc.pm.common;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

/** Atomic counters for human-readable keys such as FAS-12, CR-2026-031 and WVR-004. */
@Service
public class SequenceService {
    @Document("sequences")
    public static class Counter { @Id public String id; public long value; }

    private final MongoTemplate mongo;

    public SequenceService(MongoTemplate mongo) { this.mongo = mongo; }

    public long next(String name) {
        Counter c = mongo.findAndModify(Query.query(Criteria.where("_id").is(name)), new Update().inc("value", 1),
            FindAndModifyOptions.options().returnNew(true).upsert(true), Counter.class);
        return c == null ? 1 : c.value;
    }
}
