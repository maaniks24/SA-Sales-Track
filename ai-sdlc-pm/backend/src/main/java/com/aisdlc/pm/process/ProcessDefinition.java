package com.aisdlc.pm.process;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

/** The AI SDLC process (PD-AISDLC-01) as exported from the shared process data by tools/export-process.js. */
public record ProcessDefinition(
    String version, Map<String, Object> modes, Map<String, Object> workTypes, List<List<String>> severity, List<List<String>> srTypes,
    List<List<String>> techniques, List<String> universalChecklist, List<List<String>> idConventions, List<List<String>> contextPack,
    List<List<String>> principles, List<StageDef> stages, Map<String, Map<String, List<String>>> checklistOverrides,
    Map<String, Map<String, String>> applicability, List<TemplateDef> templates, Map<String, Object> docMap) {

    public record StageDef(
        String id, String gate, String name, @JsonProperty("short") String shortName, String purpose, List<String> entry,
        List<Map<String, String>> inputs, List<Map<String, String>> activities, List<Map<String, String>> outputs,
        List<String> checklist, String gateText, Map<String, String> raci, String aiRule, List<String> techniques,
        List<String> automatedChecks, String responsibleRole, String accountableRole, List<String> prerequisites,
        String boardColumn, Map<String, List<String>> requiredDocs, List<String> requiredCiChecks, String gitEvidence,
        List<String> inputTemplates) { }

    public record TemplateDef(String id, String name, String purpose, String stage, String workTypes, String owner, String mode) { }
}
