package com.aisdlc.pm.gate;

/** Published after a gate is approved so integrations (for example Bugzilla) can react without coupling to the gate engine. */
public record GateApprovedEvent(String projectId, String workItemKey, String stageId) { }
