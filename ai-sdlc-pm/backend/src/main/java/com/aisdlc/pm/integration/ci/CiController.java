package com.aisdlc.pm.integration.ci;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Jenkins integration: build results in, gate decisions out. Authenticated by the project's CI token. */
@RestController
public class CiController {
    private final CiService ci;
    public CiController(CiService ci) { this.ci = ci; }

    @PostMapping("/api/integrations/ci/webhook/{projectKey}")
    public CiService.Result build(@PathVariable String projectKey, @RequestHeader(value = "X-CI-Token", required = false) String token, @RequestBody CiPayload body) {
        return ci.receive(projectKey, token, body);
    }

    @GetMapping("/api/integrations/ci/gate-check")
    public CiService.GateCheck gateCheck(@RequestParam String project, @RequestParam String workItem, @RequestParam String gate,
                                         @RequestHeader(value = "X-CI-Token", required = false) String token) {
        return ci.gateCheck(project, token, workItem, gate);
    }
}
