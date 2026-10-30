# CP-22 API Contract Standards

| Owner | Version | Status |
|---|---|---|
| Architect | 1.0-draft | STARTER — the owner completes every `OWNER TO COMPLETE` block before go-live |

Contract-first rules. The OpenAPI file in the contract repository is the source of truth.

> **For AI:** this file is binding. If something you need is not defined here, list it under OPEN QUESTIONS in your self-check. Do not invent it.

- Every new or changed operation carries `x-req-ids` listing its requirement IDs (enforced by OpenAPI lint).
- A breaking change requires a version bump and a list of consumers; the mobile N-1 release must keep working.
- OWNER TO COMPLETE: path style, pagination, filtering, sorting conventions.
- OWNER TO COMPLETE: standard error envelope (fields, error code from CP-23, correlation ID).
- OWNER TO COMPLETE: event naming and payload versioning.
