package com.aisdlc.pm.common;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.net.URI;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/** Turns every failure into an RFC 7807 problem with a stable code and the correlation ID,
 *  logs it once at the right level, and records unexpected errors as system events. */
@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private final SystemEventService events;

    public GlobalExceptionHandler(SystemEventService events) { this.events = events; }

    private ProblemDetail problem(HttpStatus status, String code, String detail, List<?> details) {
        ProblemDetail p = ProblemDetail.forStatusAndDetail(status, detail);
        p.setType(URI.create("urn:aisdlc:error:" + code.toLowerCase()));
        p.setTitle(status.getReasonPhrase());
        p.setProperty("code", code);
        p.setProperty("correlationId", MDC.get("correlationId"));
        if (details != null && !details.isEmpty()) p.setProperty("details", details);
        return p;
    }

    @ExceptionHandler(ApiException.class)
    ProblemDetail api(ApiException ex, HttpServletRequest req) {
        if (ex.status().is5xxServerError()) log.error("{} {}: {}", req.getMethod(), req.getRequestURI(), ex.getMessage());
        else log.info("{} {} rejected [{}]: {}", req.getMethod(), req.getRequestURI(), ex.code(), ex.getMessage());
        return problem(ex.status(), ex.code(), ex.getMessage(), ex.details());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail invalid(MethodArgumentNotValidException ex) {
        List<Map<String, String>> fields = ex.getBindingResult().getFieldErrors().stream()
            .map(f -> Map.of("field", f.getField(), "message", String.valueOf(f.getDefaultMessage()))).toList();
        return problem(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "Some fields are missing or invalid.", fields);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ProblemDetail violation(ConstraintViolationException ex) {
        return problem(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", ex.getMessage(), List.of());
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MissingServletRequestParameterException.class, IllegalArgumentException.class})
    ProblemDetail unreadable(Exception ex) {
        return problem(HttpStatus.BAD_REQUEST, "BAD_REQUEST", "The request could not be read: " + ex.getMessage(), List.of());
    }

    @ExceptionHandler(OptimisticLockingFailureException.class)
    ProblemDetail stale(OptimisticLockingFailureException ex) {
        return problem(HttpStatus.CONFLICT, "STALE_UPDATE", "Someone else changed this item. Reload it and try again.", List.of());
    }

    @ExceptionHandler({AccessDeniedException.class, AuthorizationDeniedException.class})
    ProblemDetail denied(Exception ex) {
        return problem(HttpStatus.FORBIDDEN, "FORBIDDEN", "You do not have permission to do this.", List.of());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ProblemDetail tooBig(MaxUploadSizeExceededException ex) {
        return problem(HttpStatus.PAYLOAD_TOO_LARGE, "FILE_TOO_LARGE", "The file is larger than the 50 MB limit.", List.of());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ProblemDetail noResource(NoResourceFoundException ex) {
        return problem(HttpStatus.NOT_FOUND, "NOT_FOUND", "No such endpoint: " + ex.getResourcePath(), List.of());
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail unexpected(Exception ex, HttpServletRequest req) {
        log.error("Unexpected error on {} {}", req.getMethod(), req.getRequestURI(), ex);
        events.record("ERROR", "API", "Unexpected error on " + req.getMethod() + " " + req.getRequestURI(), ex, req.getRequestURI());
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
            "Something went wrong on the server. Quote reference " + MDC.get("correlationId") + " when reporting it.", List.of());
    }
}
