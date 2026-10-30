package com.aisdlc.pm.integration.git;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** Every commit pushed to the project's repository, linked or not; it feeds the ID-discipline metric. */
@Document("commits")
public class CommitRecord {
    @Id public String id;            // projectId:sha
    @Indexed public String projectId;
    public String sha;
    public String message;
    public String author;
    public String branch;
    public String url;
    public Instant at;
    public boolean validId;
    public List<String> workItemKeys = new ArrayList<>();
    public List<String> requirementIds = new ArrayList<>();
}
