package com.aisdlc.pm.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.aisdlc.pm.integration.git.GitEvent;
import com.aisdlc.pm.integration.git.GitPayloadParser;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class GitPayloadParserTest {
    private final GitPayloadParser parser = new GitPayloadParser(JsonMapper.builder().build());

    @Test
    void githubPushAndMergedPullRequest() {
        GitEvent push = parser.parse("GITHUB", "push", """
            {"ref":"refs/heads/feature/FAS-12-rfid","commits":[{"id":"abc123","message":"FAS-12 LBL-REQ-031 reader","timestamp":"2026-10-01T10:00:00+05:30",
             "url":"https://x/commit/abc123","author":{"name":"Arjun"}}]}""");
        assertThat(push.branch()).isEqualTo("feature/FAS-12-rfid");
        assertThat(push.commits()).singleElement().satisfies(c -> {
            assertThat(c.sha()).isEqualTo("abc123");
            assertThat(c.author()).isEqualTo("Arjun");
        });

        GitEvent pr = parser.parse("GITHUB", "pull_request", """
            {"action":"closed","pull_request":{"number":42,"title":"FAS-12 RFID","state":"closed","merged":true,"html_url":"https://x/pull/42",
             "head":{"ref":"feature/FAS-12"},"base":{"ref":"main"},"user":{"login":"arjun"}}}""");
        assertThat(pr.pullRequest().number()).isEqualTo("42");
        assertThat(pr.pullRequest().state()).isEqualTo("MERGED");
        assertThat(pr.pullRequest().targetBranch()).isEqualTo("main");
    }

    @Test
    void gitlabMergeRequestAndBitbucketPush() {
        GitEvent mr = parser.parse("GITLAB", "Merge Request Hook", """
            {"user":{"username":"meera"},"object_attributes":{"iid":7,"title":"FAS-3 idempotent run","state":"opened","url":"https://gl/mr/7",
             "source_branch":"bugfix/FAS-3","target_branch":"main"}}""");
        assertThat(mr.pullRequest().state()).isEqualTo("OPEN");
        assertThat(mr.pullRequest().author()).isEqualTo("meera");

        GitEvent bb = parser.parse("BITBUCKET", "repo:push", """
            {"push":{"changes":[{"new":{"name":"feature/FAS-9"},"commits":[{"hash":"f00d","message":"FAS-9 sync queue","date":"2026-10-02T08:00:00Z",
             "author":{"raw":"Vikram <v@x>"},"links":{"html":{"href":"https://bb/c/f00d"}}}]}]}}""");
        assertThat(bb.branch()).isEqualTo("feature/FAS-9");
        assertThat(bb.commits()).extracting(GitEvent.Commit::sha).containsExactly("f00d");
    }

    @Test
    void unusedEventsAreIgnored() {
        assertThat(parser.parse("GITHUB", "issues", "{}")).isNull();
    }
}
