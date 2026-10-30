package com.aisdlc.pm.integration;

import tools.jackson.databind.JsonNode;

/** Null-safe reads from webhook payloads. */
public final class Json {
    private Json() { }

    public static JsonNode at(JsonNode n, String... path) {
        JsonNode cur = n;
        for (String p : path) { if (cur == null) return null; cur = cur.path(p); }
        return cur == null || cur.isMissingNode() || cur.isNull() ? null : cur;
    }

    public static String str(JsonNode n, String... path) {
        JsonNode v = at(n, path);
        return v == null ? null : v.asString();
    }
}
