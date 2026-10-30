package com.aisdlc.pm.common;

import java.util.List;
import org.springframework.http.HttpStatus;

/** Base for every error the API reports deliberately. The handler turns it into an RFC 7807 problem. */
public class ApiException extends RuntimeException {
    private final HttpStatus status;
    private final String code;
    private final List<?> details;

    public ApiException(HttpStatus status, String code, String message) { this(status, code, message, List.of()); }

    public ApiException(HttpStatus status, String code, String message, List<?> details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }

    public HttpStatus status() { return status; }
    public String code() { return code; }
    public List<?> details() { return details; }

    public static ApiException notFound(String what, String id) {
        return new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", what + " " + id + " was not found.");
    }
    public static ApiException badRequest(String message) { return new ApiException(HttpStatus.BAD_REQUEST, "BAD_REQUEST", message); }
    public static ApiException conflict(String message) { return new ApiException(HttpStatus.CONFLICT, "CONFLICT", message); }
    public static ApiException forbidden(String message) { return new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", message); }
    public static ApiException unauthorized(String message) { return new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", message); }
    /** A gate rule stopped the action; details list the unmet conditions so the user knows what to do. */
    public static ApiException gateBlocked(String message, List<?> unmet) { return new ApiException(HttpStatus.CONFLICT, "GATE_BLOCKED", message, unmet); }
}
