# CP-10 Coding Standards

| Owner | Version | Status |
|---|---|---|
| Architect | 1.0-draft | STARTER — the owner completes every `OWNER TO COMPLETE` block before go-live |

How code is written on every surface. PMD, Checkstyle and Sonar rules enforce the mechanical parts; this file states the intent so AI follows it before the pipeline does.

> **For AI:** this file is binding. If something you need is not defined here, list it under OPEN QUESTIONS in your self-check. Do not invent it.

## Layering
> **OWNER TO COMPLETE:** state the layer rules per surface (e.g. controller → service → repository; no repository calls from controllers).

## Exceptions and error envelope
> **OWNER TO COMPLETE:** state the exception hierarchy, where exceptions are translated, and the standard error envelope (see CP-22).

## Logging
> **OWNER TO COMPLETE:** log levels, correlation ID, what must never be logged (PII, amounts with identifiers, secrets).

## Transactions and idempotency
> **OWNER TO COMPLETE:** transaction boundaries for asset and depreciation writes; idempotency rule for event consumers.

## Audit trail
> **OWNER TO COMPLETE:** which entities are audited; who / when / old value / new value capture; the shared audit component to use (CP-20).

## Versioning and branching
> **OWNER TO COMPLETE:** semantic versioning rules; branch model; hotfix branches from release tags (process definition 5.3).

## Static analysis
| Tool | Rule set location | Blocking from |
|---|---|---|
| PMD | `OWNER TO COMPLETE` | Day 60 of roll-out |
| Checkstyle | `OWNER TO COMPLETE` | Day 60 |
| Sonar quality gate | `OWNER TO COMPLETE` | Day 60 |
