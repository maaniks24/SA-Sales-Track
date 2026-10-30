package com.aisdlc.pm.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.aisdlc.pm.integration.bugzilla.BugzillaClient;
import com.aisdlc.pm.project.Project;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class BugzillaClientTest {
    private MockRestServiceServer server;
    private BugzillaClient client;
    private final Project.BugzillaSettings s = new Project.BugzillaSettings();

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        client = new BugzillaClient(builder);
        s.enabled = true; s.baseUrl = "https://bz.test/"; s.product = "Fixed Asset Suite"; s.component = "Depreciation"; s.apiKey = "k-123";
    }

    @Test
    void readsABugWithTheApiKey() {
        server.expect(requestTo("https://bz.test/rest/bug/4182")).andExpect(header("X-BUGZILLA-API-KEY", "k-123"))
            .andRespond(withSuccess("{\"bugs\":[{\"id\":4182,\"summary\":\"Duplicate journals\",\"status\":\"ASSIGNED\",\"resolution\":\"\",\"severity\":\"major\"}]}", MediaType.APPLICATION_JSON));
        BugzillaClient.Bug b = client.get(s, 4182);
        assertThat(b.summary()).isEqualTo("Duplicate journals");
        assertThat(BugzillaClient.fromBugzillaSeverity(b.severity())).isEqualTo("P2");
        server.verify();
    }

    @Test
    void createsAndResolves() {
        server.expect(requestTo("https://bz.test/rest/bug")).andExpect(method(HttpMethod.POST))
            .andExpect(content().string(org.hamcrest.Matchers.containsString("\"severity\":\"critical\"")))
            .andRespond(withSuccess("{\"id\":5001}", MediaType.APPLICATION_JSON));
        server.expect(requestTo("https://bz.test/rest/bug/5001")).andExpect(method(HttpMethod.PUT))
            .andExpect(content().string(org.hamcrest.Matchers.containsString("\"resolution\":\"FIXED\"")))
            .andRespond(withSuccess("{\"bugs\":[{\"id\":5001}]}", MediaType.APPLICATION_JSON));
        assertThat(client.create(s, "Summary", "Desc", BugzillaClient.toBugzillaSeverity("P1"))).isEqualTo(5001);
        client.resolve(s, 5001, "Released through G9");
        server.verify();
    }

    @Test
    void serverErrorsBecomeBugzillaExceptions() {
        server.expect(requestTo("https://bz.test/rest/bug/1")).andRespond(withServerError());
        assertThatThrownBy(() -> client.get(s, 1)).isInstanceOf(BugzillaClient.BugzillaException.class).hasMessageContaining("Could not read bug 1");
    }

    @Test
    void refusesWhenNotConfigured() {
        s.enabled = false;
        assertThatThrownBy(() -> client.get(s, 1)).hasMessageContaining("not configured");
    }
}
