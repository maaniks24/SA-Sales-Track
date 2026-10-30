# REST API reference

All endpoints are under `/api` and need `Authorization: Bearer <token>` from `POST /api/auth/login`,
except the Git and CI webhooks (secret / token) and health. Errors are RFC 7807 problem documents:

```json
{ "status": 409, "code": "GATE_BLOCKED", "detail": "FAS-8 cannot move to Build until G1, G2 are approved.",
  "details": ["G1", "G2"], "correlationId": "397b2fbd-…" }
```

Send `X-Correlation-Id` to trace a request; the same ID is returned and written to the logs and audit events.

| Area | Endpoints |
|------|-----------|
| Auth & users | `POST /auth/login` · `GET /auth/me` · `GET /users` · `POST /users` (admin) · `PUT /users/{id}` (admin) · `POST /users/me/password` |
| Process | `GET /process` (stages, gates, checklists, templates) · `GET /templates/{id}/file` |
| Projects | `GET/POST /projects` · `GET/PUT /projects/{id}` · `PUT /projects/{id}/integrations` |
| Work items | `GET/POST /projects/{pid}/work-items?type&column&assignee&sprintId&q` · `GET/PUT /work-items/{key}` · `GET /work-items/{key}/activity` |
| Board | `GET /projects/{pid}/board?sprintId` · `POST /work-items/{key}/move {column, rank, reason}` |
| Stages & gates | `POST /work-items/{key}/stages/{S}/start` · `POST …/applicability {applicable, reason}` · `PUT …/checklist/{i} {checked, evidence}` · `PUT …/ai {aiUsage, aiOperator, unresolvedAssumptions}` · `GET …/gate` · `POST …/submit` · `POST …/decision {decision, comment, reviewer}` · `GET /projects/{pid}/approvals?mine` |
| Documents | `GET /work-items/{key}/documents` · `POST /work-items/{key}/stages/{S}/documents` (multipart `file`; `templateId`, `title`, `direction`, `comment`) · `POST /documents/{id}/baseline` · `GET /documents/{id}/versions/{v}/file` |
| Traceability | `GET/POST /projects/{pid}/requirements` · `GET …/requirements/export` (CSV) · `POST/DELETE /work-items/{key}/requirements[/{reqId}]` |
| Sprints | `GET/POST /projects/{pid}/sprints` · `POST /sprints/{id}/start` · `POST /sprints/{id}/close` · `GET /sprints/{id}/burndown` |
| Waivers | `GET/POST /projects/{pid}/waivers` · `GET /waivers/{id}` · `POST /waivers/{id}/decision {approve, comment}` · `POST /waivers/{id}/close {outcome}` · `GET /waivers/conditions` |
| Dashboard | `GET /projects/{pid}/dashboard` |
| Audit & logs | `GET /audit?projectId&actor&action&entityType&entityId&from&to&page&size` · `GET /audit/export` · `GET /system-events?level` (Council, DevOps) |
| Integrations | `GET /projects/{pid}/integration-events?source` · `GET /projects/{pid}/commits` · `GET /projects/{pid}/integration-endpoints` |
| Git webhook | `POST /integrations/git/webhook/{PROJECT_KEY}` (GitHub, GitLab, Bitbucket headers) |
| Jenkins | `POST /integrations/ci/webhook/{PROJECT_KEY}` · `GET /integrations/ci/gate-check?project&workItem&gate` (header `X-CI-Token`) |
| Bugzilla | `POST /work-items/{key}/bugs {bugId}` · `DELETE /work-items/{key}/bugs/{id}` · `POST /work-items/{key}/bugs/create` · `POST /work-items/{key}/bugs/refresh` · `POST /projects/{pid}/bugzilla/import` · `POST /projects/{pid}/bugzilla/test` |
