package com.aisdlc.pm.integration.git;

import java.time.Instant;
import java.util.List;

/** Provider-neutral view of a Git webhook. */
public record GitEvent(String provider, String kind, String branch, List<Commit> commits, PullRequest pullRequest) {
    public record Commit(String sha, String message, String author, String url, Instant at) { }
    public record PullRequest(String number, String title, String url, String state, String sourceBranch, String targetBranch, String author) { }
}
