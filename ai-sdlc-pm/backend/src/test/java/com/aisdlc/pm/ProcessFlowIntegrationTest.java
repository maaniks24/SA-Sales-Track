package com.aisdlc.pm;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.aisdlc.pm.integration.git.GitWebhookService;
import com.aisdlc.pm.seed.DemoDataSeeder;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.request.AbstractMockHttpServletRequestBuilder;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/** End-to-end through the REST API on the seeded demo project: gates, separation of duties, webhooks, errors and audit. */
@SpringBootTest(properties = "app.seed.enabled=true")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProcessFlowIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired JsonMapper json;

    private String token(String user) throws Exception {
        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + user + "\",\"password\":\"" + DemoDataSeeder.DEMO_PASSWORD + "\"}"))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(body).path("token").asString();
    }

    private <B extends AbstractMockHttpServletRequestBuilder<B>> B as(String token, B r) { return r.header("Authorization", "Bearer " + token); }

    private JsonNode read(RequestBuilder r) throws Exception {
        return json.readTree(mvc.perform(r).andExpect(status().is2xxSuccessful()).andReturn().getResponse().getContentAsString());
    }

    private String fasId(String t) throws Exception {
        for (JsonNode p : read(as(t, get("/api/projects"))).values()) if ("FAS".equals(p.path("key").asString())) return p.path("id").asString();
        throw new AssertionError("FAS not seeded");
    }

    @Test
    void securityAndErrorsFollowProblemDetails() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"username\":\"admin\",\"password\":\"nope\"}"))
            .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/projects")).andExpect(status().isUnauthorized());
        String t = token("admin");
        mvc.perform(as(t, get("/api/work-items/FAS-999")).header("X-Correlation-Id", "test-corr-1"))
            .andExpect(status().isNotFound()).andExpect(header().string("X-Correlation-Id", "test-corr-1"))
            .andExpect(jsonPath("$.code").value("NOT_FOUND")).andExpect(jsonPath("$.correlationId").value("test-corr-1"));
    }

    @Test
    void boardBlocksMovesUntilGatesAreApproved() throws Exception {
        String t = token("nandini.dm");
        mvc.perform(as(t, post("/api/work-items/FAS-8/move")).contentType(MediaType.APPLICATION_JSON).content("{\"column\":\"BUILD\"}"))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("GATE_BLOCKED"));
        JsonNode dash = read(as(t, get("/api/projects/" + fasId(t) + "/dashboard")));
        assertThat(dash.path("kpis").size()).isEqualTo(8);
        assertThat(dash.path("pendingApprovals").size()).isGreaterThanOrEqualTo(3);
    }

    @Test
    void newFeatureWalksG0WithSeparationOfDuties() throws Exception {
        String ba = token("ravi.ba"), dm = token("nandini.dm"), admin = token("admin");
        String pid = fasId(ba);
        String key = read(as(ba, post("/api/projects/" + pid + "/work-items")).contentType(MediaType.APPLICATION_JSON)
            .content("{\"type\":\"NF\",\"title\":\"Asset disposal workflow\",\"module\":\"FAM\"}")).path("key").asString();
        read(as(ba, post("/api/work-items/" + key + "/move")).contentType(MediaType.APPLICATION_JSON).content("{\"column\":\"INTAKE\"}"));

        // the Delivery Manager ran the AI prompt, so they may not sign G0
        read(as(ba, put("/api/work-items/" + key + "/stages/S0/ai")).contentType(MediaType.APPLICATION_JSON)
            .content("{\"aiUsage\":\"AI_G\",\"aiOperator\":\"nandini.dm\",\"unresolvedAssumptions\":0}"));
        mvc.perform(as(ba, post("/api/work-items/" + key + "/stages/S0/submit"))).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("GATE_BLOCKED"));

        String t01 = read(as(ba, multipart("/api/work-items/" + key + "/stages/S0/documents")
            .file(new MockMultipartFile("file", "T01.docx", "application/octet-stream", "intake".getBytes())).param("templateId", "T01"))).path("id").asString();
        JsonNode baselined = read(as(ba, post("/api/documents/" + t01 + "/baseline")).contentType(MediaType.APPLICATION_JSON).content("{}"));
        assertThat(baselined.path("currentVersion").asString()).isEqualTo("1.0");
        read(as(ba, multipart("/api/work-items/" + key + "/stages/S0/documents")
            .file(new MockMultipartFile("file", "T11.docx", "application/octet-stream", "ai".getBytes())).param("templateId", "T11")));
        JsonNode item = read(as(ba, get("/api/work-items/" + key)));
        for (JsonNode c : item.path("stages").path("S0").path("checklist").values()) {
            read(as(ba, put("/api/work-items/" + key + "/stages/S0/checklist/" + c.path("index").asInt())).contentType(MediaType.APPLICATION_JSON).content("{\"checked\":true}"));
        }
        read(as(ba, post("/api/work-items/" + key + "/stages/S0/submit")));

        mvc.perform(as(dm, post("/api/work-items/" + key + "/stages/S0/decision")).contentType(MediaType.APPLICATION_JSON).content("{\"decision\":\"APPROVED\"}"))
            .andExpect(status().is4xxClientError());
        JsonNode approved = read(as(admin, post("/api/work-items/" + key + "/stages/S0/decision")).contentType(MediaType.APPLICATION_JSON)
            .content("{\"decision\":\"APPROVED\",\"comment\":\"ok\",\"reviewer\":\"priya.po\"}"));
        assertThat(approved.path("stages").path("S0").path("status").asString()).isEqualTo("APPROVED");
        assertThat(approved.path("stages").path("S1").path("status").asString()).isEqualTo("IN_PROGRESS");

        JsonNode activity = read(as(admin, get("/api/work-items/" + key + "/activity")));
        assertThat(activity.toString()).contains("GATE_APPROVED", "DOC_BASELINED", "AI_USAGE_DECLARED");
    }

    @Test
    void gitAndJenkinsWebhooksLinkToWorkItems() throws Exception {
        String body = "{\"ref\":\"refs/heads/feature/FAS-8\",\"commits\":[{\"id\":\"cafe01\",\"message\":\"FAS-8 FAM-REQ-102 transfer API\",\"timestamp\":\"2026-10-01T10:00:00Z\",\"author\":{\"name\":\"Arjun\"}}]}";
        mvc.perform(post("/api/integrations/git/webhook/FAS").header("X-GitHub-Event", "push").header("X-Hub-Signature-256", "sha256=bad").content(body))
            .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/integrations/git/webhook/FAS").header("X-GitHub-Event", "push")
                .header("X-Hub-Signature-256", "sha256=" + GitWebhookService.hmac("demo-webhook-secret", body)).content(body))
            .andExpect(status().isOk()).andExpect(jsonPath("$.linkedWorkItems[0]").value("FAS-8"));

        mvc.perform(post("/api/integrations/ci/webhook/FAS").header("X-CI-Token", "demo-ci-token").contentType(MediaType.APPLICATION_JSON)
                .content("{\"job\":\"fas-pipeline\",\"buildNumber\":900,\"status\":\"SUCCESS\",\"branch\":\"feature/FAS-8\",\"checks\":{\"pmd\":\"pass\"}}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.workItem").value("FAS-8"));
        mvc.perform(get("/api/integrations/ci/gate-check").param("project", "FAS").param("workItem", "FAS-5").param("gate", "G9").header("X-CI-Token", "demo-ci-token"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.allowed").value(true));

        String t = token("kiran.tl");
        JsonNode w = read(as(t, get("/api/work-items/FAS-8")));
        assertThat(w.path("commits").toString()).contains("cafe01");
        assertThat(w.path("builds").toString()).contains("\"PMD\":\"PASS\"");
        JsonNode rtm = read(as(t, get("/api/projects/" + fasId(t) + "/requirements")));
        assertThat(rtm.toString()).contains("cafe01");
    }
}
