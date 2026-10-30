package com.aisdlc.pm.integration.ci;

import java.util.List;
import java.util.Map;

/** Build result posted by Jenkins (see docs/integrations.md for the Jenkinsfile step). */
public record CiPayload(String job, Long buildNumber, String status, String url, String branch, String commit, String workItem,
                        Map<String, String> checks, List<TestResult> testResults, Map<String, Integer> parity, String release) {
    public record TestResult(String reqId, String testCase, String result) { }
}
