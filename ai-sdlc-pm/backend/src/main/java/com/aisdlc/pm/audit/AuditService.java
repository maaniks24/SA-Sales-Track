package com.aisdlc.pm.audit;

import com.aisdlc.pm.common.PageResult;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
    private static final Logger log = LoggerFactory.getLogger("audit");
    private final AuditRepository repo;
    private final MongoTemplate mongo;

    public AuditService(AuditRepository repo, MongoTemplate mongo) { this.repo = repo; this.mongo = mongo; }

    public static String currentActor() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        return a == null || a.getName() == null ? "system" : a.getName();
    }

    public AuditEvent record(String action, String entityType, String entityId, String projectId, String summary, Map<String, Object> details) {
        return recordAs(currentActor(), action, entityType, entityId, projectId, summary, details);
    }

    public AuditEvent recordAs(String actor, String action, String entityType, String entityId, String projectId, String summary, Map<String, Object> details) {
        AuditEvent e = new AuditEvent();
        e.at = Instant.now();
        e.actor = actor;
        e.action = action;
        e.entityType = entityType;
        e.entityId = entityId;
        e.projectId = projectId;
        e.summary = summary;
        e.details = details;
        e.correlationId = MDC.get("correlationId");
        log.info("{} {} {}/{}: {}", actor, action, entityType, entityId, summary);
        return repo.insert(e);
    }

    public PageResult<AuditEvent> search(String projectId, String actor, String action, String entityType, String entityId,
                                         Instant from, Instant to, int page, int size) {
        List<Criteria> c = new ArrayList<>();
        if (projectId != null) c.add(Criteria.where("projectId").is(projectId));
        if (actor != null && !actor.isBlank()) c.add(Criteria.where("actor").is(actor));
        if (action != null && !action.isBlank()) c.add(Criteria.where("action").is(action));
        if (entityType != null && !entityType.isBlank()) c.add(Criteria.where("entityType").is(entityType));
        if (entityId != null && !entityId.isBlank()) c.add(Criteria.where("entityId").is(entityId));
        if (from != null) c.add(Criteria.where("at").gte(from));
        if (to != null) c.add(Criteria.where("at").lte(to));
        Query q = c.isEmpty() ? new Query() : new Query(new Criteria().andOperator(c.toArray(new Criteria[0])));
        long total = mongo.count(q, AuditEvent.class);
        PageRequest pr = PageRequest.of(page, Math.min(size, 200), Sort.by(Sort.Direction.DESC, "at"));
        List<AuditEvent> items = mongo.find(q.with(pr), AuditEvent.class);
        return PageResult.of(new PageImpl<>(items, pr, total));
    }

    public List<AuditEvent> forEntity(String type, String id) { return repo.findByEntityTypeAndEntityIdOrderByAtDesc(type, id); }
    /** The work item's own events plus those of its documents and waivers, which carry the key in details.workItem. */
    public List<AuditEvent> forWorkItem(String key) {
        Criteria c = new Criteria().orOperator(Criteria.where("entityType").is("WORK_ITEM").and("entityId").is(key), Criteria.where("details.workItem").is(key));
        return mongo.find(new Query(c).with(Sort.by(Sort.Direction.DESC, "at")).limit(500), AuditEvent.class);
    }

    public List<AuditEvent> recent(String projectId) { return repo.findTop20ByProjectIdOrderByAtDesc(projectId); }
}
