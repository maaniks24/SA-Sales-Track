# CP-60 Review Checklists

Generated from PD-AISDLC-01 section 4 (same content as template T10). AI must self-check against the relevant gate
before handing output to a reviewer. A self-check is not a review: the gate still needs an independent person.

## G0 — S0 Intake and Classification

- [ ] Work type classified using the rules in section 3.4; borderline cases decided by the Architect
- [ ] Intake summary reflects the original request: nothing added, nothing lost
- [ ] Duplicates and related items confirmed by a person, not accepted from the AI suggestion
- [ ] Module prefix, surface(s) and requester recorded
- [ ] Severity set for issues (P1 to P4) with a one-line justification
- [ ] Accountable owner and process path assigned

## G1 — S1 Requirements and Review Points

- [ ] Every statement in the source note maps to at least one REQ-ID
- [ ] No requirement exists without a source statement (nothing invented by AI)
- [ ] Each requirement is atomic, testable and has acceptance criteria
- [ ] Every AI-declared assumption and open question is answered by the business, not by AI
- [ ] Depreciation, capitalisation and statutory rules verified by a domain SME
- [ ] Impact on microservices, mobile and internal web identified
- [ ] Non-functional needs captured: volume, response time, retention, security
- [ ] REQ-IDs follow the convention and are unique in the RTM
- [ ] AI Usage Declaration (T11) attached with the Context Pack version

## G2 — S2 SFVD: Screens, Fields, Validations

- [ ] Every screen and field maps to a REQ-ID
- [ ] Every field matches the data dictionary: name, type, length, mandatory
- [ ] Every validation ID and error code exists in the registry; none invented
- [ ] Business flows match the approved register, including negative and exception flows
- [ ] UI references use only approved style classes and components
- [ ] Reuse call-outs verified against the shared library index
- [ ] Mobile offline behaviour stated where applicable
- [ ] Audit-trail fields and role permissions specified for every screen
- [ ] AI assumption list resolved; AI Usage Declaration attached

## G3 — S3 Solution Design and Interface Contract

- [ ] No cross-service database access; bounded contexts respected
- [ ] Contract backward compatible, or the version bumped with consumers listed
- [ ] The capability does not already exist in another service
- [ ] Base classes and shared libraries reused; no parallel utilities designed
- [ ] Error envelope, pagination and naming follow CP-22
- [ ] Mobile offline and synchronisation impact addressed
- [ ] Migration reversible; rollback script present and reviewed by the DBA
- [ ] Authorisation, audit fields and PII handling reviewed by Security
- [ ] Design decision and the alternatives considered are recorded

## G4 — S4 Development

- [ ] Shared library searched; no duplicate utility, validator, base method or CSS created
- [ ] Package, class, method and file names follow CP-11
- [ ] Layering and folder placement follow CP-12
- [ ] No hardcoded values, credentials or environment-specific configuration
- [ ] Exception handling, logging and audit trail follow CP-10
- [ ] Queries checked for N+1, pagination and index use
- [ ] Unit tests cover new logic, including boundary and negative cases
- [ ] No unused or commented-out AI-generated alternatives remain
- [ ] Branch name and every commit carry the REQ-ID or defect ID
- [ ] Pull request 400 lines or fewer, or split; T09 completed
- [ ] The developer can explain every line

## G5 — S5 Code Review

- [ ] Reviewer is not the developer who ran the AI prompt
- [ ] Business logic matches the SFVD and acceptance criteria
- [ ] Reuse opportunities enforced, not merely noted
- [ ] Contract adherence and backward compatibility confirmed
- [ ] Security, authorisation, input validation and PII handling checked
- [ ] Tests are meaningful: they assert behaviour and include negative cases
- [ ] Sonar: zero blocker and critical issues; duplication and coverage within thresholds
- [ ] All review comments resolved; nothing the reviewer cannot explain is merged

## G6 — S6 Test Design

- [ ] Every REQ-ID has at least one positive and one negative case
- [ ] Every field validation in the SFVD has a test case
- [ ] Expected results traced to SFVD text, not inferred
- [ ] Depreciation, label and audit expected values independently re-calculated by the SME
- [ ] No duplicate of an existing regression case
- [ ] Test data follows the seed structure; personal and financial data masked
- [ ] Priority, regression and automation tags set
- [ ] Device, browser and role coverage matches the matrix

## G7 — S7 Test Execution and Automation

- [ ] Every automated script maps one-to-one to an approved case; no steps dropped
- [ ] Assertions verify expected results, proven by a deliberate-fail check on a sample
- [ ] No hardcoded data, fixed waits or environment coupling
- [ ] Scripts are independent and repeatable in any order
- [ ] Parity: approved = executed + automated + formally deferred
- [ ] Every failure has a defect linked to its REQ-ID
- [ ] Deferred cases have a reason, an owner and a target release

## G8 — S8 Build and Release

- [ ] Version number unique and follows policy; artifact checksum recorded
- [ ] Every release-note line traces to a merged pull request and REQ-ID; nothing omitted
- [ ] Known issues and deferred cases listed
- [ ] Configuration differences verified for each environment; no secrets in notes
- [ ] Migration dry run passed; rollback tested
- [ ] Open defects accepted or deferred in writing
- [ ] Release approval recorded before promotion

## G9 — S9 Deploy, Verify and Close

- [ ] Backup confirmed by a named person before deployment
- [ ] Deployment executed from the runbook; deviations recorded
- [ ] Smoke pack 100% passed, executed by QA rather than the deployer
- [ ] Monitoring window completed with no unexplained errors
- [ ] Rollback decision owner named before deployment started
- [ ] Business sign-off recorded
- [ ] RTM frozen and versioned with the release
- [ ] Lessons learned captured; context gaps raised on T14

## Universal AI output acceptance checklist

- [ ] Generated from an approved, versioned input; input ID and version recorded
- [ ] Standard stage prompt template used; Context Pack version recorded
- [ ] AI Usage Declaration (T11) completed: tool, prompt template, sections generated
- [ ] Assumption list present, and every assumption resolved by a person
- [ ] Every output item traces to a source item; no orphan content
- [ ] No invented identifiers: fields, validation IDs, error codes, APIs, classes, style classes
- [ ] Reuse verified: every referenced component exists and is actually used
- [ ] Structure follows the template; naming follows CP-11
- [ ] Domain rules spot-checked by independent re-derivation where financial values are involved
- [ ] No personal data, production data or secrets in the prompt or the output
- [ ] Reviewer is not the AI operator; sign-off recorded in T10
