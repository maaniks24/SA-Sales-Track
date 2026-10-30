# /ai-context — Common Context Pack

This folder is the single, versioned source of shared context for every AI prompt used on the Fixed Assets suite.
It is defined in section 7 of **PD-AISDLC-01 AI-Augmented SDLC Process Definition**.

## How to install
1. Copy this folder to the root of the main repository as `/ai-context`.
2. Copy `AI-INSTRUCTIONS.md` to the repository root.
3. For each approved AI tool, add the one-line pointer file in the location that tool reads automatically
   (the approved tool list and their pointer locations are recorded in CP-40). The pointer contains only:
   `Follow /AI-INSTRUCTIONS.md and load /ai-context before any task.`
4. Copy `templates/pull_request_template.md` to your Git host's pull request template location.
5. Each file owner completes the `OWNER TO COMPLETE` blocks, then the Council approves **CP v1.0**.

## Files
| File | Content | Owner |
|---|---|---|
| AI-INSTRUCTIONS.md | Root instruction file loaded by every AI tool; points to /ai-context and states the binding rules | Architect |
| CP-00 product-overview.md | Modules, surfaces, module prefixes, domain glossary (asset class, SLM, WDV, CWIP, NBV, impairment, label) | Architect |
| CP-10 coding-standards.md | Layering, exceptions, logging, transactions, audit trail, versioning policy | Architect |
| CP-11 naming-conventions.md | Packages, classes, methods, tables, columns, API paths, events, branches, commits, test IDs | Architect |
| CP-12 folder-structure.md | Canonical project skeleton per surface and where each kind of file goes | Architect |
| CP-20 shared-library-index.md | Every base class, utility, validator and component, with when to use it and the do-not-rewrite list | Tech Leads |
| CP-21 ui-style-guide.md | Design tokens, approved style classes, component catalogue for web and mobile | UI Lead |
| CP-22 api-contract-standards.md | REST conventions, versioning, pagination, error envelope, event naming | Architect |
| CP-23 validation-and-error-registry.md | Every validation ID and error code with message text; the only source for SFVD and code | Architect |
| CP-30 test-standards.md | Test case template, ID convention, negative-pattern library, automation and locator patterns, device matrix | QA Lead |
| CP-31 test-data-and-seed.md | Seed data structure, standard asset fixtures, masking rules, data builders | QA Lead |
| CP-40 security-and-compliance.md | Authorisation model, PII handling, audit log rules, secrets policy, AI data rules | Security |
| CP-50 prompt-templates/ | One approved prompt per stage, S0 to S9 | Architect + QA Lead |
| CP-60 review-checklists.md | The gate checklists from T10, so AI can self-check before a human reviews | Council |
| CP-99 golden-examples/ | One reference feature per surface (service, mobile, internal web) for AI to imitate | Tech Leads |

## Changing the pack
Raise **T14 Context Pack Change Request**, open a pull request against this folder, get two approvals
(file owner + a Council member), bump `VERSION`, and notify all three surface teams the same day.
