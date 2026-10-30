/* Generates the /ai-context starter pack (markdown) from the process data. */
const fs = require('fs'); const path = require('path'); const D = require('./process_data');
const OUT = path.join(__dirname, '..', 'ai-context');
const w = (f, s) => { fs.mkdirSync(path.dirname(path.join(OUT, f)), { recursive: true }); fs.writeFileSync(path.join(OUT, f), s.trim() + '\n'); };
const head = (id, title, owner, purpose) => `# ${id} ${title}

| Owner | Version | Status |
|---|---|---|
| ${owner} | 1.0-draft | STARTER — the owner completes every \`OWNER TO COMPLETE\` block before go-live |

${purpose}

> **For AI:** this file is binding. If something you need is not defined here, list it under OPEN QUESTIONS in your self-check. Do not invent it.
`;
const todo = t => `> **OWNER TO COMPLETE:** ${t}`;

w('VERSION', 'CP v1.0-draft');
w('README.md', `# /ai-context — Common Context Pack

This folder is the single, versioned source of shared context for every AI prompt used on the Fixed Assets suite.
It is defined in section 7 of **PD-AISDLC-01 AI-Augmented SDLC Process Definition**.

## How to install
1. Copy this folder to the root of the main repository as \`/ai-context\`.
2. Copy \`AI-INSTRUCTIONS.md\` to the repository root.
3. For each approved AI tool, add the one-line pointer file in the location that tool reads automatically
   (the approved tool list and their pointer locations are recorded in CP-40). The pointer contains only:
   \`Follow /AI-INSTRUCTIONS.md and load /ai-context before any task.\`
4. Copy \`templates/pull_request_template.md\` to your Git host's pull request template location.
5. Each file owner completes the \`OWNER TO COMPLETE\` blocks, then the Council approves **CP v1.0**.

## Files
| File | Content | Owner |
|---|---|---|
${D.CONTEXT_PACK.map(r => `| ${r[0]} | ${r[1]} | ${r[2]} |`).join('\n')}

## Changing the pack
Raise **T14 Context Pack Change Request**, open a pull request against this folder, get two approvals
(file owner + a Council member), bump \`VERSION\`, and notify all three surface teams the same day.
`);

w('AI-INSTRUCTIONS.md', `# AI Instructions — Fixed Assets Suite

These rules bind every AI tool used on this repository. They implement PD-AISDLC-01.

## Always
1. Load \`/ai-context\` (version in \`/ai-context/VERSION\`) before any task and treat every file as binding.
2. Work from an **approved, versioned input** named in the prompt. Never infer requirements from memory.
3. Do **one stage deliverable** per prompt, using the stage template in \`/ai-context/CP-50-prompt-templates/\`.
4. **Reuse before create.** Search CP-20 (shared library), CP-21 (style classes) and CP-23 (validation and error registry) first.
   Never create a new utility, base method, style class, validation ID or error code. If one is genuinely needed, say so under OPEN QUESTIONS.
5. Follow CP-10 coding standards, CP-11 naming, CP-12 folder structure and CP-22 API standards exactly. Imitate the CP-99 golden example for the surface.
6. Stamp the requirement / CR / SR / BUG ID on every section, file header and test you produce.
7. End every response with the SELF-CHECK block: (a) standards applied, (b) reuse decisions, (c) ASSUMPTIONS, (d) OPEN QUESTIONS.

## Never
${D.AI_PERMISSIONS.NA.map(x => '- ' + x).join('\n')}
- Mark a test as passed, approve a pull request, or claim a gate is passed.

## Surface profiles
State the profile in every prompt: \`profile: microservice\`, \`profile: mobile\` or \`profile: internal web\`.
`);

w('CP-00-product-overview.md', head('CP-00', 'Product Overview and Domain Glossary', 'Architect', 'What the product is, how it is divided, and the domain vocabulary AI must use precisely.') + `
## Surfaces
| Surface | Description | Golden example |
|---|---|---|
| Web application + microservices | Loosely coupled services behind the web front end | CP-99/microservice |
| Mobile application | Field use: scanning, labelling, physical verification; works offline | CP-99/mobile |
| Internal web applications | Finance, admin and audit back-office screens | CP-99/internal-web |

## Modules and ID prefixes
${D.ID_CONVENTIONS[0][1].split(' · ').map(x => '- ' + x).join('\n')}

${todo('list every microservice with its bounded context, owning team and data it owns.')}

## Domain glossary
| Term | Definition in this product |
|---|---|
| Asset class | ${'`OWNER TO COMPLETE`'} |
| SLM (straight-line method) | Equal charge per period over useful life after salvage value |
| WDV (written-down value) | Fixed rate applied to the opening carrying amount each period |
| Useful life | \`OWNER TO COMPLETE\` (by asset class) |
| Put-to-use date | Date from which depreciation starts |
| CWIP | Capital work in progress; not depreciated until capitalised |
| NBV | Net book value = cost − accumulated depreciation − impairment |
| Impairment / revaluation | \`OWNER TO COMPLETE\` |
| Disposal / retirement | \`OWNER TO COMPLETE\` |
| Label / tag | \`OWNER TO COMPLETE\` (barcode and RFID formats) |
| Physical verification | \`OWNER TO COMPLETE\` (statuses, discrepancy handling) |

${todo('confirm every definition against the company accounting policy, and add the policy reference.')}
`);

w('CP-10-coding-standards.md', head('CP-10', 'Coding Standards', 'Architect', 'How code is written on every surface. PMD, Checkstyle and Sonar rules enforce the mechanical parts; this file states the intent so AI follows it before the pipeline does.') + `
## Layering
${todo('state the layer rules per surface (e.g. controller → service → repository; no repository calls from controllers).')}

## Exceptions and error envelope
${todo('state the exception hierarchy, where exceptions are translated, and the standard error envelope (see CP-22).')}

## Logging
${todo('log levels, correlation ID, what must never be logged (PII, amounts with identifiers, secrets).')}

## Transactions and idempotency
${todo('transaction boundaries for asset and depreciation writes; idempotency rule for event consumers.')}

## Audit trail
${todo('which entities are audited; who / when / old value / new value capture; the shared audit component to use (CP-20).')}

## Versioning and branching
${todo('semantic versioning rules; branch model; hotfix branches from release tags (process definition 5.3).')}

## Static analysis
| Tool | Rule set location | Blocking from |
|---|---|---|
| PMD | \`OWNER TO COMPLETE\` | Day 60 of roll-out |
| Checkstyle | \`OWNER TO COMPLETE\` | Day 60 |
| Sonar quality gate | \`OWNER TO COMPLETE\` | Day 60 |
`);

w('CP-11-naming-conventions.md', head('CP-11', 'Naming Conventions', 'Architect', 'Names for everything AI might create. Give a correct and an incorrect example for each.') + `
| Item | Rule | Correct | Incorrect |
|---|---|---|---|
| Java package | \`OWNER TO COMPLETE\` | | |
| Class | \`OWNER TO COMPLETE\` | | |
| Method | \`OWNER TO COMPLETE\` | | |
| Database table | \`OWNER TO COMPLETE\` | | |
| Database column | \`OWNER TO COMPLETE\` | | |
| REST path | \`OWNER TO COMPLETE\` | | |
| Event topic | \`OWNER TO COMPLETE\` | | |
| Mobile screen / resource | \`OWNER TO COMPLETE\` | | |
| CSS / style class | Use CP-21 only | | |
${D.ID_CONVENTIONS.slice(1).map(r => `| ${r[0]} | \`${r[1].replace(/; /, '` — ').replace(/ with (\.r<n>)/, ' with `$1')}\` | \`${r[2]}\` | |`).join('\n')}
`);

w('CP-12-folder-structure.md', head('CP-12', 'Folder Structure', 'Architect', 'The canonical project skeleton per surface, and where each kind of file goes.') + `
## Microservice
\`\`\`
${'OWNER TO COMPLETE — paste the standard service skeleton tree here'}
\`\`\`
## Mobile application
\`\`\`
${'OWNER TO COMPLETE'}
\`\`\`
## Internal web application
\`\`\`
${'OWNER TO COMPLETE'}
\`\`\`
## Where things go
| File type | Location |
|---|---|
| New feature (one project per feature, as today) | \`OWNER TO COMPLETE\` |
| DTOs / entities / mappers | \`OWNER TO COMPLETE\` |
| Migration scripts | \`OWNER TO COMPLETE\` |
| Unit tests | \`OWNER TO COMPLETE\` |
| Automation tests | \`OWNER TO COMPLETE\` |
`);

w('CP-20-shared-library-index.md', head('CP-20', 'Shared Library Index', 'Tech Leads', 'Every reusable base class, utility, validator and component. AI must search this list before writing anything new; reviewers reject duplicates.') + `
| Name | Package / module | Purpose | Use when | Do not rewrite? |
|---|---|---|---|---|
| \`EXAMPLE BaseEntity\` | \`OWNER TO COMPLETE\` | Common id, audit and version fields | Every persisted entity | Yes |
| \`EXAMPLE BaseService\` | | | | Yes |
| \`EXAMPLE AuditAware\` | | | | Yes |
| \`EXAMPLE DateRangeValidator\` | | | | Yes |
| Barcode / RFID scan component (mobile) | | | All scanning screens | Yes |

${todo('list every shared component on all three surfaces. Remove the EXAMPLE rows.')}
`);

w('CP-21-ui-style-guide.md', head('CP-21', 'UI Style Guide', 'UI Lead', 'Design tokens, approved style classes and the component catalogue. No new CSS without written justification.') + `
## Design tokens
${todo('colours, spacing, typography tokens.')}

## Approved style classes
| Class | Use for | Surface |
|---|---|---|
| \`OWNER TO COMPLETE\` | | |

## Component catalogue
| Component | Use for | Surface | Location |
|---|---|---|---|
| Data grid | Asset registers and lists | Internal web | |
| Filter panel | | | |
| File upload | Bulk uploads | | |
| Date picker | | | |
| Approval widget | | | |
`);

w('CP-22-api-contract-standards.md', head('CP-22', 'API Contract Standards', 'Architect', 'Contract-first rules. The OpenAPI file in the contract repository is the source of truth.') + `
- Every new or changed operation carries \`x-req-ids\` listing its requirement IDs (enforced by OpenAPI lint).
- A breaking change requires a version bump and a list of consumers; the mobile N-1 release must keep working.
- ${'OWNER TO COMPLETE'}: path style, pagination, filtering, sorting conventions.
- ${'OWNER TO COMPLETE'}: standard error envelope (fields, error code from CP-23, correlation ID).
- ${'OWNER TO COMPLETE'}: event naming and payload versioning.
`);

w('CP-23-validation-and-error-registry.md', head('CP-23', 'Validation and Error Registry', 'Architect', 'The only valid source of validation IDs and error codes. SFVDs, code and tests may use only IDs listed here. New entries come through T14.') + `
| Validation ID | Rule | Error code | Message text | Used by screens / APIs |
|---|---|---|---|---|
| \`EXAMPLE VAL-DT-004\` | Date must not be in a closed period | \`ERR-AST-112\` | The date falls in a closed accounting period. | DEP-SCR-07 |

${todo('migrate the existing validation and error codes from the product. Remove the EXAMPLE row.')}
`);

w('CP-30-test-standards.md', head('CP-30', 'Test Standards', 'QA Lead', 'How test cases are written, named and automated, so AI-generated tests look like ours.') + `
## Test case template and IDs
Use T07. Test case ID: \`TC-<MOD>-<REQ nnn>-<nn>\`.

## Negative and boundary pattern library
| Pattern | Apply to | Example |
|---|---|---|
| Closed-period posting | Any dated financial transaction | Post depreciation into a closed month |
| Mid-period start | Depreciation | Put-to-use on the 15th |
| Transfer within period | Transfers | Transfer on the 20th; one charge only |
| Leap year | Date arithmetic | 29 February |
| ${'OWNER TO COMPLETE'} | | |

## Automation patterns
${todo('page-object pattern, locator strategy, waits policy (no fixed waits), tagging, data-driven style.')}

## Device, browser and role matrix
${todo('supported devices / OS versions, browsers, and roles every feature is tested with.')}
`);

w('CP-31-test-data-and-seed.md', head('CP-31', 'Test Data and Seed Data', 'QA Lead', 'The standard seed structure and fixtures, so every tester and every AI prompt uses the same data. Never use production data.') + `
## Standard fixtures
| Fixture ID | Description |
|---|---|
| \`EXAMPLE FX-AST-014\` | Computer, SLM, 3-year life, cost 90,000, put to use 15 July |
| ${'OWNER TO COMPLETE'} | |

## Masking rules
${todo('fields and masking rules for any data derived from production.')}

## Seed scripts and data builders
${todo('location and usage.')}
`);

w('CP-40-security-and-compliance.md', head('CP-40', 'Security, Compliance and AI Data Rules', 'Security Lead', 'Authorisation, PII, audit and secrets rules, plus the approved AI tools and what may be put into a prompt.') + `
## Approved AI tools
| Tool | Approved for | Pointer file location | Account type |
|---|---|---|---|
| ${'OWNER TO COMPLETE'} | | | Company account only |

## AI data rules
- Never put production personal data, financial records, credentials or secrets into a prompt.
- Use CP-31 seed data in prompts and examples.
- ${'OWNER TO COMPLETE'}: data classification levels and which may be used with which tool.

## Authorisation model
${todo('roles, permissions, location/entity scoping.')}

## Audit and retention
${todo('audit log rules and retention periods.')}
`);

// prompt templates from data
const tasks = {
  S0: 'Summarise the request below into an intake summary and list possible duplicate items from the RTM extract provided. Do not classify the work type or set severity.',
  S1: 'Produce a requirement register (T01 Part C), surface impact map (Part D) and NFR list (Part E) from the business requirement note.',
  S2: 'Write SFVD sections (T02 sections 2 to 10) for the screens these requirements need.',
  S3: 'Produce a solution design note (T03) and the OpenAPI changes for the SFVD sections provided.',
  S4: 'Implement the change described in the SFVD section and contract provided, inside the existing project structure, with unit tests.',
  S5: 'Act as a review aid: summarise the diff, list deviations from CP-10/11/12, likely duplicates of CP-20 components, and missing tests. Do not approve.',
  S6: 'Write test cases (T07) and test data requirements (T08) for the SFVD sections and contract provided.',
  S7: 'Write automation scripts for the approved test cases provided, using the CP-30 automation patterns, one script per case.',
  S8: 'Draft release notes (T12) from the commit list and REQ-IDs provided, and a deployment runbook draft (T13).',
  S9: 'Summarise the post-deployment logs and metrics provided. List anomalies with the exact log lines. Do not recommend rollback decisions.'
};
D.STAGES.forEach(s => w(`CP-50-prompt-templates/P-${s.id}.md`, `# P-${s.id} v1 — ${s.name}

Mode: ${s.activities.filter(a => a[2] === 'AG' || a[2] === 'AA').map(a => D.MODES[a[2]].code).filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'AI-A'} · Gate: ${s.gate} · Owner of output: ${s.raci.R}

\`\`\`text
ROLE:          You are a senior ${s.raci.R.toLowerCase()} on the Fixed Assets suite (profile: <microservice | mobile | internal web>).
CONTEXT:       Load /ai-context at <CP version>. Treat every file as binding, not advisory.
INPUT:         <approved artifact IDs and versions — referenced, not retyped>
TASK:          ${tasks[s.id]} Nothing else.
CONSTRAINTS:   Reuse CP-20 components and CP-21 style classes; use only CP-23 validation IDs and error codes.
               Follow CP-10, CP-11, CP-12 and CP-22. If something you need does not exist, list it under
               OPEN QUESTIONS. Do not invent it.
               ${s.aiRule.replace('see section', 'see PD-AISDLC-01 section')}
OUTPUT FORMAT: <template and sections to fill>
TRACEABILITY:  Put the requirement / CR / SR / BUG ID on every item. Stamp "<CP version>, P-${s.id} v1".
SELF-CHECK:    End with (a) standards applied, (b) reuse decisions, (c) ASSUMPTIONS, (d) OPEN QUESTIONS.
               Then check your output against /ai-context/CP-60-review-checklists.md section ${s.gate}.
\`\`\`
`));

w('CP-60-review-checklists.md', `# CP-60 Review Checklists

Generated from PD-AISDLC-01 section 4 (same content as template T10). AI must self-check against the relevant gate
before handing output to a reviewer. A self-check is not a review: the gate still needs an independent person.

${D.STAGES.map(s => `## ${s.gate} — ${s.id} ${s.name}\n\n${s.checklist.map(c => '- [ ] ' + c).join('\n')}\n`).join('\n')}
## Universal AI output acceptance checklist

${D.UNIVERSAL_CHECKLIST.map(c => '- [ ] ' + c).join('\n')}
`);

w('CP-99-golden-examples/README.md', `# CP-99 Golden Examples

One reviewed reference feature per surface. AI is told to imitate these; reviewers compare against them (technique V5).

| Folder | Surface | Reference feature | Reviewed by | Last refreshed |
|---|---|---|---|---|
| microservice/ | Web + microservices | \`OWNER TO COMPLETE\` | Architect | |
| mobile/ | Mobile application | \`OWNER TO COMPLETE\` | Architect | |
| internal-web/ | Internal web | \`OWNER TO COMPLETE\` | Architect | |

Each folder holds: the SFVD extract, the design note, the code (or links to it), the unit tests and the automation script
for one complete, small feature that follows every standard. Refresh quarterly.
`);

w('templates/pull_request_template.md', `## Work item
- IDs: <!-- REQ / CR / SR / BUG IDs -->
- Context Pack version: <!-- e.g. CP v1.3 -->
- Lines changed: <!-- ≤ 400, or explain the split -->

## AI usage (T11 short form)
- [ ] None  - [ ] AI-assisted only  - [ ] AI-generated
- Tool and prompt template: <!-- e.g. P-S4 v1 -->
- Files or sections generated by AI:

## Developer self-review (S4)
${D.STAGES.find(s => s.id === 'S4').checklist.map(c => '- [ ] ' + c).join('\n')}

## Reviewer (S5) — must not be the person who ran the AI prompt
${D.STAGES.find(s => s.id === 'S5').checklist.map(c => '- [ ] ' + c).join('\n')}
`);
console.log('context pack written:', fs.readdirSync(OUT).length, 'entries');
