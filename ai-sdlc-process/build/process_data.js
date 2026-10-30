/* Single source of truth for the AI SDLC process.
   Read by: the process definition document, the templates, the Context Pack checklists and the deck. */

const MODES = {
  M:  { code: 'M',    name: 'Manual',           color: 'C25E3A', tint: 'F8E6DF',
        desc: 'Performed and owned entirely by a named person. AI is not used to produce the output.' },
  AG: { code: 'AI-G', name: 'AI-Generated',     color: '0E7C86', tint: 'DDF0F1',
        desc: 'AI produces the draft from approved inputs and the Context Pack. A named person must validate it before it is used. It is never a deliverable as generated.' },
  AA: { code: 'AI-A', name: 'AI-Assisted',      color: '7A5C8E', tint: 'ECE5F1',
        desc: 'A person produces the output. AI is used only to summarise, search, scan or suggest. The person decides.' },
  AU: { code: 'AUTO', name: 'Automated',        color: '3E6B7A', tint: 'E1EAEE',
        desc: 'Deterministic tooling with no AI judgement: Jenkins pipeline, PMD, Sonar, OpenAPI diff, link-check jobs.' },
  NA: { code: 'AI-X', name: 'AI Not Permitted', color: '8E2424', tint: 'F3DCDC',
        desc: 'AI must not be used for this activity under any circumstances.' }
};

const WORK_TYPES = {
  NF: { code: 'NF', name: 'New Application / New Feature', short: 'New feature',
        when: 'A capability that does not exist today: a new application, module, screen set, service or integration.',
        examples: ['Mobile RFID scanning for physical asset verification', 'New lease-asset module', 'New integration with the ERP general ledger'] },
  CR: { code: 'CR', name: 'Enhancement / Change Request', short: 'Change request',
        when: 'A change to behaviour, rules, screens, reports or interfaces that already exist and are baselined.',
        examples: ['Pro-rata daily depreciation for mid-year additions', 'Add cost-centre filter to the asset register report', 'New label template field'] },
  SR: { code: 'SR', name: 'Issue Fix / Service Request', short: 'Issue / SR',
        when: 'Something is broken (defect), or an operational request that changes data, configuration or access rather than designed behaviour.',
        examples: ['Depreciation run posts duplicate entries for transferred assets (defect)', 'Correct useful life for 42 assets (data SR)', 'Add a role to a user group (access SR)'] }
};

/* io rows: [item, source or template, prepared by, mode] ; act rows: [activity, performed by, mode] ; out rows: [output, template, mode, owner] */
const STAGES = [
  {
    id: 'S0', gate: 'G0', name: 'Intake and Classification', short: 'Intake',
    purpose: 'Register every new work item, classify it as a New Feature, Change Request or Issue / Service Request, link it to the current baseline, and route it to the correct process path.',
    entry: ['Work item raised in Jira by business, support or an internal team', 'Requester and business contact identified'],
    inputs: [
      ['Work item description and attachments', 'Jira', 'Requester', 'M'],
      ['Current baseline: RTM, SFVD versions, release history', 'X01 Tracker, document repository', 'Business Analyst', 'M'],
      ['Logs, screenshots, error references (issues only)', 'Support, monitoring tools', 'Support', 'M'],
      ['Classification rules', 'Section 3.4 of this document', '—', 'M']
    ],
    activities: [
      ['Log the item with requester, module, surface(s) and business priority', 'Requester / BA', 'M'],
      ['Summarise long descriptions, e-mail threads and logs into a structured intake summary', 'BA / Triage Lead', 'AA'],
      ['Search the RTM and backlog for duplicates and related items', 'BA', 'AA'],
      ['Classify the work type (NF / CR / SR); assign ID and module prefix', 'BA (Architect if unclear)', 'M'],
      ['For issues: set provisional severity P1 to P4', 'Triage Lead', 'M'],
      ['Assign the accountable owner and process path; record Gate G0', 'Delivery Manager', 'M']
    ],
    outputs: [
      ['Classified Jira item: work type, ID, module, severity', 'Jira', 'M', 'BA'],
      ['Intake summary', 'T01 Part A (NF/CR) or T05 (SR)', 'AA', 'BA / Triage Lead'],
      ['Duplicate and related-item links', 'Jira links', 'AA', 'BA'],
      ['Gate G0 record', 'T10', 'M', 'Delivery Manager']
    ],
    auto: ['Jira mandatory-field validation (work type, module, requester)'],
    techniques: ['V1', 'V2'],
    validationNote: 'The AI intake summary is compared line by line with the original request; any statement not in the source is removed. Each suggested duplicate is opened and confirmed by a person.',
    checklist: [
      'Work type classified using the rules in section 3.4; borderline cases decided by the Architect',
      'Intake summary reflects the original request: nothing added, nothing lost',
      'Duplicates and related items confirmed by a person, not accepted from the AI suggestion',
      'Module prefix, surface(s) and requester recorded',
      'Severity set for issues (P1 to P4) with a one-line justification',
      'Accountable owner and process path assigned'
    ],
    gateText: 'G0 Intake approved: item classified, ID assigned, owner named, process path selected.',
    raci: { R: 'BA / Triage Lead', A: 'Delivery Manager', C: 'Architect', I: 'Requester' },
    aiRule: 'AI may summarise and search. AI must not classify the work type or set severity.'
  },
  {
    id: 'S1', gate: 'G1', name: 'Requirements and Review Points', short: 'Requirements',
    purpose: 'Turn the business need into an approved, uniquely identified requirement register with acceptance criteria. This register is the root of all traceability.',
    entry: ['G0 passed; work type NF, or CR after impact analysis (T04)'],
    inputs: [
      ['Business requirement note and client review points', 'T01 Part B', 'Business / Product Owner', 'M'],
      ['Current workflow, screen inventory and report list', 'Existing SFVD, live product', 'BA', 'M'],
      ['Domain glossary: asset classes, SLM / WDV, useful life, CWIP, impairment, disposal, label formats', 'CP-00', 'Architect', 'M'],
      ['Integration, validation and non-functional expectations', 'Business, Architect', 'BA', 'M'],
      ['Context Pack sections CP-00, CP-40 and stage prompt P-S1', '/ai-context', '—', 'M']
    ],
    activities: [
      ['Prepare the business requirement note with review points', 'BA with Business', 'M'],
      ['Generate the draft register: one ID per requirement, acceptance criteria, impact map, assumptions and open questions', 'BA using AI', 'AG'],
      ['Reconcile the register with the source: every statement mapped, nothing invented', 'BA', 'M'],
      ['Walk through open questions with the business and record answers', 'BA, Product Owner', 'M'],
      ['Verify domain and statutory rules (depreciation, capitalisation thresholds, audit retention)', 'BA with domain SME', 'M'],
      ['Approve the register, freeze REQ-IDs and create RTM rows', 'Product Owner', 'M']
    ],
    outputs: [
      ['Requirement Register v1.0 with REQ-IDs and acceptance criteria', 'T01 Part C', 'AG', 'BA'],
      ['Assumption and open-question log, fully resolved', 'T11', 'AG', 'BA'],
      ['Impact map across microservices, mobile and internal web', 'T01 Part D', 'AG', 'BA'],
      ['RTM rows created', 'X01 RTM sheet', 'M', 'BA'],
      ['Gate G1 record', 'T10', 'M', 'Product Owner']
    ],
    auto: ['Template completeness check', 'REQ-ID format and uniqueness check in the RTM'],
    techniques: ['V1', 'V2', 'V4', 'V7'],
    validationNote: 'Every requirement must trace to a sentence in the source note, and every sentence in the note must be covered. Differences in the count are explained in writing. A domain SME re-derives two worked examples by hand.',
    checklist: [
      'Every statement in the source note maps to at least one REQ-ID',
      'No requirement exists without a source statement (nothing invented by AI)',
      'Each requirement is atomic, testable and has acceptance criteria',
      'Every AI-declared assumption and open question is answered by the business, not by AI',
      'Depreciation, capitalisation and statutory rules verified by a domain SME',
      'Impact on microservices, mobile and internal web identified',
      'Non-functional needs captured: volume, response time, retention, security',
      'REQ-IDs follow the convention and are unique in the RTM',
      'AI Usage Declaration (T11) attached with the Context Pack version'
    ],
    gateText: 'G1 Requirements approved: register v1.0 signed by the Product Owner, REQ-IDs frozen, RTM rows created.',
    raci: { R: 'Business Analyst', A: 'Product Owner', C: 'Architect, QA Lead', I: 'Development, Release' },
    aiRule: 'AI may structure, de-duplicate and draft acceptance criteria. AI must not answer its own open questions or decide scope.'
  },
  {
    id: 'S2', gate: 'G2', name: 'SFVD: Screens, Fields, Validations', short: 'SFVD',
    purpose: 'Specify every screen, field, validation, error message and business flow precisely enough that development and testing work from the same truth.',
    entry: ['G1 passed'],
    inputs: [
      ['Approved Requirement Register', 'T01', 'BA', 'M'],
      ['SFVD template and two approved SFVDs as worked examples', 'T02, CP-99', 'Tech Writer', 'M'],
      ['Data dictionary and entity relationship model', 'Architecture repository', 'Architect', 'M'],
      ['Validation and error-code registry', 'CP-23', 'Architect', 'M'],
      ['UI style guide and component catalogue', 'CP-21', 'UI Lead', 'M'],
      ['Naming conventions', 'CP-11', '—', 'M'],
      ['Existing SFVD (CR: affected sections only)', 'Document repository', 'Tech Writer', 'M']
    ],
    activities: [
      ['Generate the SFVD draft per screen: purpose, actors, flow, field table, validations, error codes, user stories, UI references', 'Tech Writer using AI', 'AG'],
      ['Verify field by field against the data dictionary', 'Tech Writer', 'M'],
      ['Verify every validation ID and error code exists in the registry; raise a registry change for genuinely new ones', 'Tech Writer, Architect', 'M'],
      ['Verify reuse call-outs: the named components and validators exist and fit', 'Architect', 'M'],
      ['Business walkthrough of flows and screens', 'BA, Product Owner', 'M'],
      ['Baseline the SFVD; update the requirement-screen-field matrix; release to Dev and QA the same day', 'Tech Writer', 'M']
    ],
    outputs: [
      ['SFVD vX.Y', 'T02', 'AG', 'Tech Writer'],
      ['RTM screen and field columns', 'X01 RTM sheet', 'M', 'Tech Writer'],
      ['Registry change requests, if any', 'T14', 'M', 'Architect'],
      ['Gate G2 record', 'T10', 'M', 'BA Lead']
    ],
    auto: ['Template structure check', 'Screen-to-REQ-ID link check', 'Registry lookup script for validation and error IDs (manual lookup until scripted)'],
    techniques: ['V1', 'V2', 'V3', 'V4', 'V5'],
    validationNote: 'Every identifier the AI writes (field, validation ID, error code, style class, component) is looked up in the registry or data dictionary. An identifier that cannot be found is treated as invented and the section is rejected.',
    checklist: [
      'Every screen and field maps to a REQ-ID',
      'Every field matches the data dictionary: name, type, length, mandatory',
      'Every validation ID and error code exists in the registry; none invented',
      'Business flows match the approved register, including negative and exception flows',
      'UI references use only approved style classes and components',
      'Reuse call-outs verified against the shared library index',
      'Mobile offline behaviour stated where applicable',
      'Audit-trail fields and role permissions specified for every screen',
      'AI assumption list resolved; AI Usage Declaration attached'
    ],
    gateText: 'G2 SFVD baselined: matrix updated, document released to Development and QA on the same day.',
    raci: { R: 'Tech Writer / BA', A: 'BA Lead', C: 'Architect, QA Lead, Product Owner', I: 'Development, Mobile, Release' },
    aiRule: 'AI may draft. AI must not create new fields, validation IDs, error codes or style classes.'
  },
  {
    id: 'S3', gate: 'G3', name: 'Solution Design and Interface Contract', short: 'Design',
    purpose: 'Decide how the change is built across services and surfaces, and agree the API contract before any code is written.',
    entry: ['G2 passed', 'For CR and SR: only when the impact analysis or RCA shows a contract, schema or cross-service change'],
    inputs: [
      ['Finalised SFVD', 'T02', '—', 'M'],
      ['Service map, bounded contexts and event topics', 'Architecture repository, CP-22', 'Architect', 'M'],
      ['Existing OpenAPI specifications', 'Contract repository', 'Tech Lead', 'M'],
      ['Database schema and migration standard', 'CP-10, CP-11', 'DBA', 'M'],
      ['Shared library index', 'CP-20', 'Architect', 'M'],
      ['Non-functional, security and authorisation model', 'CP-40', 'Security', 'M']
    ],
    activities: [
      ['Generate the design draft: service impact, OpenAPI contract, DTO and entity design, sequence diagrams, migration draft, reuse plan', 'Tech Lead using AI', 'AG'],
      ['Run OpenAPI lint and diff, and SQL migration lint', 'Jenkins', 'AU'],
      ['Architecture review: boundaries, reuse, backward compatibility, versioning', 'Architect', 'M'],
      ['Database review: indexes, migration, rollback', 'DBA', 'M'],
      ['Security review: authorisation, PII, audit fields', 'Security', 'M'],
      ['Merge the contract to the contract repository; record the design decision', 'Tech Lead', 'M']
    ],
    outputs: [
      ['Solution Design Note', 'T03', 'AG', 'Tech Lead'],
      ['OpenAPI contract', 'Contract repository', 'AG', 'Tech Lead'],
      ['Migration and rollback scripts (draft)', 'Code repository', 'AG', 'DBA'],
      ['Architecture decision record', 'T03 section 8', 'M', 'Architect'],
      ['Gate G3 record', 'T10', 'M', 'Architect']
    ],
    auto: ['OpenAPI lint', 'OpenAPI diff against the previous version', 'SQL migration lint'],
    techniques: ['V2', 'V3', 'V5', 'V6', 'V9'],
    validationNote: 'Every class, library or service the design proposes to reuse is checked in the shared library index. The OpenAPI diff is the evidence for backward compatibility; a breaking change without a version bump is rejected automatically.',
    checklist: [
      'No cross-service database access; bounded contexts respected',
      'Contract backward compatible, or the version bumped with consumers listed',
      'The capability does not already exist in another service',
      'Base classes and shared libraries reused; no parallel utilities designed',
      'Error envelope, pagination and naming follow CP-22',
      'Mobile offline and synchronisation impact addressed',
      'Migration reversible; rollback script present and reviewed by the DBA',
      'Authorisation, audit fields and PII handling reviewed by Security',
      'Design decision and the alternatives considered are recorded'
    ],
    gateText: 'G3 Design approved: contract merged to the contract repository before coding starts.',
    raci: { R: 'Tech Lead', A: 'Architect', C: 'DBA, Security, QA Lead', I: 'All development teams' },
    aiRule: 'AI may draft designs and contracts. AI must not merge a contract or approve a breaking change.'
  },
  {
    id: 'S4', gate: 'G4', name: 'Development', short: 'Development',
    purpose: 'Implement the approved design inside the existing structure, reusing shared code, with unit tests.',
    entry: ['G3 passed, or G1 / RCA approval for a change without design impact', 'Task carries a REQ-ID or defect ID'],
    inputs: [
      ['SFVD section, API contract and design note', 'T02, T03', '—', 'M'],
      ['Coding standards, naming conventions, folder structure', 'CP-10, CP-11, CP-12', '—', 'M'],
      ['Shared library index and UI style guide', 'CP-20, CP-21', '—', 'M'],
      ['Golden reference example for the surface', 'CP-99', '—', 'M'],
      ['REQ-ID or defect ID', 'Jira', '—', 'M'],
      ['Static analysis rule set', 'Jenkins configuration', '—', 'M']
    ],
    activities: [
      ['Create the branch named with the ID', 'Developer', 'M'],
      ['Generate code inside the existing structure, unit tests, configuration, i18n keys and migration', 'Developer using AI', 'AG'],
      ['Search the shared library before accepting any new class, utility or CSS', 'Developer', 'M'],
      ['Run the local build, unit tests, PMD and Sonar scan', 'Build tooling', 'AU'],
      ['Self-review against the T09 checklist; remove unused and alternative code', 'Developer', 'M'],
      ['Raise a pull request of 400 lines or fewer with T09 and the AI Usage Declaration', 'Developer', 'M']
    ],
    outputs: [
      ['Source code and unit tests', 'Code repository', 'AG', 'Developer'],
      ['Pull request with completed checklist', 'T09', 'M', 'Developer'],
      ['AI Usage Declaration in the pull request', 'T11 (short form)', 'M', 'Developer'],
      ['CI results', 'Jenkins', 'AU', 'Developer']
    ],
    auto: ['Compile and unit tests', 'PMD and Checkstyle', 'Sonar quality gate', 'Coverage on new code', 'Duplication', 'Secret scan', 'Naming lint'],
    techniques: ['V3', 'V5', 'V6', 'V8', 'V9'],
    validationNote: 'Deterministic gates catch standards, duplication and security problems; the developer then proves understanding through explain-back. For a defect fix the failing test must be committed before the fix.',
    checklist: [
      'Shared library searched; no duplicate utility, validator, base method or CSS created',
      'Package, class, method and file names follow CP-11',
      'Layering and folder placement follow CP-12',
      'No hardcoded values, credentials or environment-specific configuration',
      'Exception handling, logging and audit trail follow CP-10',
      'Queries checked for N+1, pagination and index use',
      'Unit tests cover new logic, including boundary and negative cases',
      'No unused or commented-out AI-generated alternatives remain',
      'Branch name and every commit carry the REQ-ID or defect ID',
      'Pull request 400 lines or fewer, or split; T09 completed',
      'The developer can explain every line'
    ],
    gateText: 'G4 Pull request ready: CI green, checklist complete, AI usage declared.',
    raci: { R: 'Developer', A: 'Tech Lead', C: 'Architect', I: 'QA' },
    aiRule: 'AI may generate code and tests. For P1 and P2 defects AI is not permitted (see section 5.3).'
  },
  {
    id: 'S5', gate: 'G5', name: 'Code Review', short: 'Code review',
    purpose: 'Independent human verification that the code is correct, consistent, reusable and secure before it is merged.',
    entry: ['G4 passed'],
    inputs: [
      ['Pull request diff and T09 checklist', 'Code repository', 'Developer', 'M'],
      ['SFVD section and API contract', 'T02, T03', '—', 'M'],
      ['Standards and shared library index', 'CP-10 to CP-22', '—', 'M'],
      ['Sonar results and contract diff', 'Jenkins', '—', 'AU']
    ],
    activities: [
      ['Generate a review aid: diff summary, standards-deviation scan, duplicate detection, missing-test hints', 'Reviewer using AI', 'AA'],
      ['Confirm the CI quality gate result', 'Jenkins', 'AU'],
      ['Review business logic against the SFVD line by line', 'Reviewer', 'M'],
      ['Check reuse, layering, naming and contract adherence', 'Reviewer', 'M'],
      ['Security and data-access review (Security consulted for sensitive changes)', 'Reviewer', 'M'],
      ['Approve or request changes; record the decision', 'Reviewer', 'M']
    ],
    outputs: [
      ['Approved pull request or review comments', 'Code repository', 'M', 'Reviewer'],
      ['Merge with REQ-ID in the message', 'Code repository', 'M', 'Reviewer'],
      ['Gate G5 record (pull request approval)', 'Code repository / T10', 'M', 'Tech Lead']
    ],
    auto: ['Sonar quality gate', 'Duplication and coverage thresholds', 'OpenAPI diff', 'Pull request size check'],
    techniques: ['V6', 'V9'],
    validationNote: 'The AI review aid is advisory. Each AI finding is verified by the reviewer before it is raised, and the absence of AI findings is never treated as approval.',
    checklist: [
      'Reviewer is not the developer who ran the AI prompt',
      'Business logic matches the SFVD and acceptance criteria',
      'Reuse opportunities enforced, not merely noted',
      'Contract adherence and backward compatibility confirmed',
      'Security, authorisation, input validation and PII handling checked',
      'Tests are meaningful: they assert behaviour and include negative cases',
      'Sonar: zero blocker and critical issues; duplication and coverage within thresholds',
      'All review comments resolved; nothing the reviewer cannot explain is merged'
    ],
    gateText: 'G5 Code approved and merged by an independent reviewer.',
    raci: { R: 'Reviewer (peer or Tech Lead)', A: 'Tech Lead', C: 'Architect, Security', I: 'QA, Product Owner' },
    aiRule: 'AI may assist the reviewer. AI never approves or merges.'
  },
  {
    id: 'S6', gate: 'G6', name: 'Test Design', short: 'Test design',
    purpose: 'Derive complete test cases and test data from the baselined SFVD and contract, in parallel with design and development.',
    entry: ['G2 passed (and G3 for contract-based cases)'],
    inputs: [
      ['Finalised SFVD and API contract', 'T02, contract repository', '—', 'M'],
      ['Test case template and ID convention', 'T07, CP-30', 'QA Lead', 'M'],
      ['Test data and seed data specification', 'T08, CP-31', 'QA Lead', 'M'],
      ['Boundary and negative scenario pattern library', 'CP-30', 'QA Lead', 'M'],
      ['Index of the existing regression suite', 'Test management tool', 'QA', 'M'],
      ['Device, browser and role matrix', 'CP-30', 'QA Lead', 'M']
    ],
    activities: [
      ['Generate test cases: functional, validation, UI, flow, integration, cross-surface; positive and negative; expected results; REQ mapping; automation flag', 'QA Engineer using AI', 'AG'],
      ['Generate test data requirements mapped to the seed structure', 'QA Engineer using AI', 'AG'],
      ['Coverage reconciliation: every REQ-ID and every field validation covered', 'QA Engineer', 'M'],
      ['Remove duplicates of existing regression cases', 'QA Engineer', 'M'],
      ['Verify expected results against the SFVD; SME re-calculates financial values', 'QA Lead, domain SME', 'M'],
      ['Approve the suite; baseline it in the test management tool; update the RTM', 'QA Lead', 'M']
    ],
    outputs: [
      ['Test Case Specification', 'T07', 'AG', 'QA Engineer'],
      ['Test Data Specification', 'T08', 'AG', 'QA Engineer'],
      ['RTM test columns', 'X01 RTM sheet', 'M', 'QA Engineer'],
      ['Gate G6 record', 'T10', 'M', 'QA Lead']
    ],
    auto: ['RTM coverage check: REQ-IDs without a test case are flagged', 'Duplicate test title check'],
    techniques: ['V1', 'V2', 'V4', 'V7'],
    validationNote: 'Counts are reconciled (REQ-IDs and field validations in, test cases out). Expected results for depreciation, label and audit scenarios are recalculated by a domain SME independently of the AI.',
    checklist: [
      'Every REQ-ID has at least one positive and one negative case',
      'Every field validation in the SFVD has a test case',
      'Expected results traced to SFVD text, not inferred',
      'Depreciation, label and audit expected values independently re-calculated by the SME',
      'No duplicate of an existing regression case',
      'Test data follows the seed structure; personal and financial data masked',
      'Priority, regression and automation tags set',
      'Device, browser and role coverage matches the matrix'
    ],
    gateText: 'G6 Test suite approved and baselined in the test management tool.',
    raci: { R: 'QA Engineer', A: 'QA Lead', C: 'BA, Developer', I: 'Product Owner, Release' },
    aiRule: 'AI may draft cases and data. AI must not decide expected results for financial calculations without SME verification.'
  },
  {
    id: 'S7', gate: 'G7', name: 'Test Execution and Automation', short: 'Test execution',
    purpose: 'Execute the approved suite, automate the agreed cases, and prove that nothing was silently dropped.',
    entry: ['G5 and G6 passed', 'Build deployed to the test environment'],
    inputs: [
      ['Approved test suite', 'Test management tool', 'QA Lead', 'M'],
      ['Seed data script', 'CP-31 / T08', 'QA', 'M'],
      ['Environment configuration and test accounts', 'Environment matrix', 'DevOps', 'M'],
      ['Automation framework patterns and locator standard', 'CP-30', 'Automation Lead', 'M'],
      ['Existing regression pack', 'Automation repository', 'QA', 'M']
    ],
    activities: [
      ['Load seed data', 'Seed script', 'AU'],
      ['Generate automation scripts: page objects, locators, data-driven steps', 'Automation Engineer using AI', 'AG'],
      ['Review scripts one-to-one against approved cases; verify assertions', 'Automation Engineer, QA Lead', 'M'],
      ['Execute manual and automated tests', 'QA', 'M'],
      ['Draft defect reports from failures', 'QA using AI', 'AA'],
      ['Run the automation parity check; record deferrals with reasons', 'QA Lead', 'AU']
    ],
    outputs: [
      ['Execution report', 'Test management tool', 'M', 'QA'],
      ['Automated scripts added to the regression pack', 'Automation repository', 'AG', 'Automation Engineer'],
      ['Defects linked to REQ-IDs', 'Jira', 'AA', 'QA'],
      ['Automation parity report', 'X01 / Jenkins', 'AU', 'QA Lead'],
      ['Gate G7 record', 'T10', 'M', 'QA Lead']
    ],
    auto: ['Parity check: approved = executed + automated + formally deferred', 'Flaky test detection by re-run', 'RTM test-status update'],
    techniques: ['V4', 'V8'],
    validationNote: 'On a sample of AI-generated scripts the reviewer deliberately changes one expected value and confirms the script fails. A script that still passes has no real assertion and is rejected.',
    checklist: [
      'Every automated script maps one-to-one to an approved case; no steps dropped',
      'Assertions verify expected results, proven by a deliberate-fail check on a sample',
      'No hardcoded data, fixed waits or environment coupling',
      'Scripts are independent and repeatable in any order',
      'Parity: approved = executed + automated + formally deferred',
      'Every failure has a defect linked to its REQ-ID',
      'Deferred cases have a reason, an owner and a target release'
    ],
    gateText: 'G7 Test exit: parity 100%, no open P1 or P2 defects, evidence attached.',
    raci: { R: 'Automation Engineer / QA', A: 'QA Lead', C: 'Developer', I: 'Product Owner, Release' },
    aiRule: 'AI may draft scripts and defect descriptions. AI must not mark a test as passed.'
  },
  {
    id: 'S8', gate: 'G8', name: 'Build and Release', short: 'Release',
    purpose: 'Produce a signed, immutable and traceable release package.',
    entry: ['G7 passed'],
    inputs: [
      ['Merged code and the release scope from Jira', 'Jira, code repository', 'Release Manager', 'M'],
      ['Version and branching policy', 'CP-10', '—', 'M'],
      ['Release note template', 'T12', '—', 'M'],
      ['Environment configuration matrix', 'DevOps', 'DevOps', 'M'],
      ['Migration and rollback scripts', 'Code repository', 'DBA', 'M'],
      ['RTM snapshot', 'X01', 'QA Lead', 'AU']
    ],
    activities: [
      ['Build the immutable artifact with a version tag', 'Jenkins', 'AU'],
      ['Generate release notes from commits and REQ-IDs, config diff summary and rollback steps', 'Release Manager using AI', 'AG'],
      ['Reconcile release notes with the RTM and Jira scope', 'Release Manager', 'M'],
      ['Verify configuration differences for each environment', 'DevOps', 'M'],
      ['Migration dry run on a production-like copy', 'DBA / DevOps', 'M'],
      ['Record release approval', 'Delivery Manager', 'M']
    ],
    outputs: [
      ['Release package (immutable, checksummed)', 'Artifact repository', 'AU', 'DevOps'],
      ['Release Note', 'T12', 'AG', 'Release Manager'],
      ['Deployment Runbook (draft)', 'T13', 'AG', 'DevOps'],
      ['Gate G8 record', 'T10', 'M', 'Delivery Manager']
    ],
    auto: ['Version uniqueness', 'Artifact checksum', 'RTM link check: every REQ in scope has passed tests'],
    techniques: ['V1', 'V4', 'V6'],
    validationNote: 'Three counts must agree: Jira scope, release-note lines and RTM rows. Each release-note line is traced to a merged pull request.',
    checklist: [
      'Version number unique and follows policy; artifact checksum recorded',
      'Every release-note line traces to a merged pull request and REQ-ID; nothing omitted',
      'Known issues and deferred cases listed',
      'Configuration differences verified for each environment; no secrets in notes',
      'Migration dry run passed; rollback tested',
      'Open defects accepted or deferred in writing',
      'Release approval recorded before promotion'
    ],
    gateText: 'G8 Release approved: signed package, RTM snapshot attached.',
    raci: { R: 'Release Manager', A: 'Delivery Manager', C: 'DevOps, Architect, QA Lead', I: 'All teams' },
    aiRule: 'AI may draft notes and runbooks. AI must not trigger a build promotion.'
  },
  {
    id: 'S9', gate: 'G9', name: 'Deploy, Verify and Close', short: 'Deploy',
    purpose: 'Deploy safely, prove it works in production, and close the loop with a frozen audit baseline.',
    entry: ['G8 passed', 'Deployment window approved'],
    inputs: [
      ['Signed release package', 'Artifact repository', 'DevOps', 'M'],
      ['Deployment runbook and smoke checklist', 'T13', 'DevOps', 'M'],
      ['Backup confirmation and rollback plan', 'T13', 'DBA / DevOps', 'M'],
      ['Monitoring dashboards and alert thresholds', 'Monitoring tools', 'DevOps', 'M']
    ],
    activities: [
      ['Pre-deployment validation and backup confirmation', 'DevOps', 'M'],
      ['Deploy through the Jenkins pipeline following the runbook', 'Jenkins', 'AU'],
      ['Execute the smoke pack', 'QA', 'M'],
      ['Summarise post-deployment logs and metrics for anomalies', 'DevOps using AI', 'AA'],
      ['Monitor for the agreed window; decide go or rollback', 'DevOps, Delivery Manager', 'M'],
      ['Business sign-off; freeze the RTM; close Jira items; raise context-gap changes', 'PO, BA, Architect', 'M']
    ],
    outputs: [
      ['Deployment record and smoke results', 'T13', 'M', 'DevOps / QA'],
      ['Monitoring summary', 'T13', 'AA', 'DevOps'],
      ['Business sign-off', 'T10', 'M', 'Product Owner'],
      ['Frozen RTM for the release', 'X01', 'M', 'BA'],
      ['Context Pack change requests', 'T14', 'M', 'Architect']
    ],
    auto: ['Pipeline deployment log', 'Health checks', 'Alerting'],
    techniques: ['V8'],
    validationNote: 'The AI log summary is checked against the dashboards; an anomaly is confirmed in the source logs before any action. "No anomalies" from AI is never accepted without the dashboard check.',
    checklist: [
      'Backup confirmed by a named person before deployment',
      'Deployment executed from the runbook; deviations recorded',
      'Smoke pack 100% passed, executed by QA rather than the deployer',
      'Monitoring window completed with no unexplained errors',
      'Rollback decision owner named before deployment started',
      'Business sign-off recorded',
      'RTM frozen and versioned with the release',
      'Lessons learned captured; context gaps raised on T14'
    ],
    gateText: 'G9 Release closed: smoke passed, monitoring clean, RTM frozen.',
    raci: { R: 'DevOps', A: 'Delivery Manager', C: 'QA Lead, Product Owner, Architect', I: 'All teams' },
    aiRule: 'AI may summarise logs. AI must not execute deployment or rollback actions.'
  }
];

/* Tailoring: how each stage applies per work type. F = full, D = delta, C = conditional, L = light, X = skip */
const TAILORING = [
  ['S0', 'F', 'F', 'F', 'Intake summary (T01 A)', 'Intake + baseline link', 'Triage form (T05)'],
  ['S1', 'F', 'D', 'C', 'Full register', 'Impact analysis (T04); new / revised REQ-IDs', 'RCA (T06) replaces requirements for defects'],
  ['S2', 'F', 'D', 'C', 'Full SFVD', 'Affected sections, change-marked, version bump', 'Only if designed behaviour changes'],
  ['S3', 'F', 'C', 'C', 'Full design note + contract', 'If contract, schema or cross-service change', 'If the fix changes a contract or schema'],
  ['S4', 'F', 'F', 'F', 'Full', 'Full', 'AI permission set by severity'],
  ['S5', 'F', 'F', 'F', 'Full', 'Full + backward-compatibility check', 'Second reviewer for P1 / P2'],
  ['S6', 'F', 'D', 'L', 'Full suite', 'New cases + impacted regression selection', 'Failing test first + targeted regression'],
  ['S7', 'F', 'D', 'L', 'Full', 'New + impacted regression + smoke', 'Targeted + regression pack'],
  ['S8', 'F', 'F', 'C', 'Scheduled release', 'Scheduled release', 'Hotfix path for P1 / P2'],
  ['S9', 'F', 'F', 'F', 'Full', 'Full', 'Full + extended monitoring']
];
const TAILOR_KEY = { F: 'Full', D: 'Delta', C: 'Conditional', L: 'Light', X: 'Skip' };

const SEVERITY = [
  ['P1 Critical', 'Production down, financial misstatement (e.g. wrong depreciation posted to ledger), data loss or security breach', 'Immediate; hotfix', 'AI-X for RCA and fix. AI-A only to summarise logs.', 'Two engineers + Architect', 'Emergency change'],
  ['P2 High', 'Major function impaired; workaround is costly or risky', 'Hotfix within SLA', 'AI-X for RCA and fix. AI-A only to summarise logs.', 'Two engineers', 'Hotfix release'],
  ['P3 Medium', 'Function impaired; acceptable workaround exists', 'Next scheduled release', 'RCA manual. Fix AI-G permitted after RCA approval.', 'Independent reviewer', 'Scheduled release'],
  ['P4 Low', 'Cosmetic or minor inconvenience', 'Planned', 'RCA manual (short form). Fix AI-G permitted.', 'Independent reviewer', 'Scheduled release']
];

const SR_TYPES = [
  ['Data correction', 'Fix asset master records, re-run depreciation for a period, correct location or custodian', 'Scripted, reversible, before/after evidence. Scripts that change cost, accumulated depreciation or NBV are AI-X; other scripts AI-G with peer review and dry run.'],
  ['Configuration change', 'Asset class useful life, depreciation rate table, label template, approval limits', 'Change record with old and new values; peer review; verification in test first. AI-A only.'],
  ['Access and role change', 'Add or remove users, roles, location access', 'Approved by data owner; executed by admin; AI-X.'],
  ['Report or export tweak', 'Column order, filter default, format', 'If code changes: re-route as a CR. If configuration only: change record and verification.'],
  ['Bulk master-data upload', 'New asset batch, transfer batch', 'Upload template validation; sample verification of 10% or 20 rows, whichever is greater. AI-A for validation summaries.']
];

const TECHNIQUES = [
  ['V1', 'Source cross-check', 'Invented content and omissions', 'Map every output item to a source item, and every source item to an output item. Unmapped output is removed; unmapped source is added.', 'S0, S1, S2, S6, S8'],
  ['V2', 'Assumption register review', 'Silent guesses presented as fact', 'The stage prompt requires AI to list every assumption and open question. The reviewer resolves each one; an unresolved item blocks the gate.', 'Every AI-G stage'],
  ['V3', 'Registry lookup', 'Invented identifiers', 'Every field, validation ID, error code, class, style class and API named by AI is looked up in the data dictionary or Context Pack registry.', 'S2, S3, S4'],
  ['V4', 'Count reconciliation', 'Silent omission', 'Compare counts in and out: statements to REQs, dictionary columns to fields, REQs to test cases, approved cases to executed cases, scope to release notes.', 'S1, S2, S6, S7, S8'],
  ['V5', 'Golden-example comparison', 'Structure and naming drift', 'Compare the output with the CP-99 reference artifact for the same surface: same sections, same patterns, same naming.', 'S2, S3, S4'],
  ['V6', 'Deterministic tool checks', 'Standards, quality and security defects', 'Lint, PMD, Checkstyle, Sonar, OpenAPI diff, SQL lint, secret scan, ID link check. Objective and blocking.', 'S3, S4, S5, S8'],
  ['V7', 'Independent re-derivation', 'Wrong domain logic that looks right', 'A domain SME calculates sample values without looking at the AI output (for example WDV for a mid-year addition) and compares.', 'S1, S6, S7'],
  ['V8', 'Execution evidence', 'Claims that were never run', 'Tests are executed and results attached. Defect fixes show fail-before and pass-after. Automation is proven by a deliberate-fail check.', 'S4, S7, S9, SR'],
  ['V9', 'Explain-back', 'Code or design nobody understands', 'The author explains any AI-generated element on request. If it cannot be explained it is reworked, however plausible it looks.', 'S3, S4, S5'],
  ['V10', 'Regeneration consistency', 'Ambiguous inputs', 'For critical artifacts only: regenerate once from the same input. Material differences mean the input is ambiguous; fix the input, not the output.', 'S1, S2, S3 (optional)']
];

const UNIVERSAL_CHECKLIST = [
  'Generated from an approved, versioned input; input ID and version recorded',
  'Standard stage prompt template used; Context Pack version recorded',
  'AI Usage Declaration (T11) completed: tool, prompt template, sections generated',
  'Assumption list present, and every assumption resolved by a person',
  'Every output item traces to a source item; no orphan content',
  'No invented identifiers: fields, validation IDs, error codes, APIs, classes, style classes',
  'Reuse verified: every referenced component exists and is actually used',
  'Structure follows the template; naming follows CP-11',
  'Domain rules spot-checked by independent re-derivation where financial values are involved',
  'No personal data, production data or secrets in the prompt or the output',
  'Reviewer is not the AI operator; sign-off recorded in T10'
];

const DOMAIN_CHECKS = [
  ['Straight-line depreciation', 'Monthly charge; partial first period when the put-to-use date is mid-month; salvage value applied once'],
  ['Written-down value', 'Rate applied to opening WDV; pro-rata on additions during the year; disposals removed from the base'],
  ['Change of estimate', 'Change of useful life or method applied prospectively only, never restated'],
  ['Impairment and revaluation', 'Subsequent depreciation recalculated on the revised carrying amount'],
  ['Disposal and retirement', 'Depreciation stops from the disposal date; gain or loss computed on NBV'],
  ['CWIP and capitalisation', 'No depreciation before the capitalisation date; capitalisation thresholds respected'],
  ['Period boundaries', 'Financial year end, leap years, closed periods cannot be posted to'],
  ['Rounding', 'Rounding rule and the treatment of the final-period residual'],
  ['Labels and tags', 'Barcode or RFID format, uniqueness, re-print, transfer between locations'],
  ['Physical verification and audit', 'Verification statuses, discrepancy handling, audit trail: who, when, old value, new value']
];

const TEMPLATES = [
  ['T01', 'Requirement Intake and Register', 'Captures the request, review points, the requirement register with REQ-IDs and acceptance criteria, and the surface impact map', 'S0, S1', 'NF, CR', 'Business Analyst', 'AI-G draft, completed and signed manually'],
  ['T02', 'SFVD (Screens, Fields, Validations, Data)', 'Screens, fields, validations, error codes, flows, user stories and UI references', 'S2', 'NF, CR (delta), SR (if behaviour changes)', 'Tech Writer', 'AI-G draft, verified manually'],
  ['T03', 'Solution Design Note', 'Service impact, API contract summary, data design, migration, NFRs and the architecture decision record', 'S3', 'NF, CR major', 'Tech Lead', 'AI-G draft, reviewed by Architect'],
  ['T04', 'Change Request Impact Analysis', 'Impact on REQs, documents, services, contracts, data, tests and effort; CR approval', 'S0, S1 (CR)', 'CR', 'Architect / BA', 'AI-A (RTM and code search); decisions manual'],
  ['T05', 'Issue and Service Request Triage Form', 'Reproduction, classification, severity, and for SRs the change details and verification', 'S0 (SR)', 'SR', 'Triage Lead', 'Manual (AI-A summary of logs)'],
  ['T06', 'Root Cause Analysis', 'Root cause, why it was not caught, which gate missed it, corrective and preventive actions', 'SR defect path', 'SR', 'Developer + Tech Lead', 'Manual only (AI-X)'],
  ['T07', 'Test Case Specification', 'Test cases with IDs, steps, expected results, REQ mapping and tags', 'S6', 'All', 'QA Engineer', 'AI-G draft, verified manually'],
  ['T08', 'Test Data and Seed Data Specification', 'Seed structure, standard fixtures, masking rules and data per case', 'S6, S7', 'All', 'QA Engineer', 'AI-G draft, verified manually'],
  ['T09', 'Pull Request and Code Review Checklist', 'Developer self-review and independent reviewer checklist', 'S4, S5', 'All code changes', 'Developer, Reviewer', 'Manual'],
  ['T10', 'Stage Gate Checklists and Sign-off', 'One checklist and sign-off block per gate, G0 to G9, with the four verification levels', 'All', 'All', 'Gate owner', 'Manual'],
  ['T11', 'AI Usage Declaration and Assumption Register', 'Tool, prompt template, Context Pack version, sections generated, assumptions and how each was resolved', 'Every AI-G step', 'All', 'AI operator', 'Manual'],
  ['T12', 'Release Note', 'Version, scope by REQ-ID, known issues, configuration changes, deferred items', 'S8', 'All', 'Release Manager', 'AI-G draft, reconciled manually'],
  ['T13', 'Deployment Runbook and Smoke Checklist', 'Pre-checks, steps, smoke tests, monitoring window, rollback', 'S8, S9', 'All', 'DevOps', 'AI-G draft, executed manually'],
  ['T14', 'Context Pack Change Request', 'Proposal to add or change a Context Pack file, with reason and approval', 'Any', 'All', 'Anyone; approved by Council', 'Manual'],
  ['T15', 'Waiver and Deviation Request', 'Request to bypass a rule or gate, with risk, owner and expiry', 'Any', 'All', 'Requester; approved by Council', 'Manual'],
  ['X01', 'AI SDLC Tracker Workbook (Excel)', 'RTM, gate log, AI usage log, waiver register, Context Pack version log, defect-to-gate analysis', 'All', 'All', 'BA, QA Lead, Council', 'Manual, with automated feeds where available']
];

const CONTEXT_PACK = [
  ['AI-INSTRUCTIONS.md', 'Root instruction file loaded by every AI tool; points to /ai-context and states the binding rules', 'Architect', 'Any change to the rules'],
  ['CP-00 product-overview.md', 'Modules, surfaces, module prefixes, domain glossary (asset class, SLM, WDV, CWIP, NBV, impairment, label)', 'Architect', 'New module or term'],
  ['CP-10 coding-standards.md', 'Layering, exceptions, logging, transactions, audit trail, versioning policy', 'Architect', 'Standards change'],
  ['CP-11 naming-conventions.md', 'Packages, classes, methods, tables, columns, API paths, events, branches, commits, test IDs', 'Architect', 'Standards change'],
  ['CP-12 folder-structure.md', 'Canonical project skeleton per surface and where each kind of file goes', 'Architect', 'Structure change'],
  ['CP-20 shared-library-index.md', 'Every base class, utility, validator and component, with when to use it and the do-not-rewrite list', 'Tech Leads', 'Any shared code added or retired'],
  ['CP-21 ui-style-guide.md', 'Design tokens, approved style classes, component catalogue for web and mobile', 'UI Lead', 'Style change'],
  ['CP-22 api-contract-standards.md', 'REST conventions, versioning, pagination, error envelope, event naming', 'Architect', 'Standards change'],
  ['CP-23 validation-and-error-registry.md', 'Every validation ID and error code with message text; the only source for SFVD and code', 'Architect', 'Approved registry change'],
  ['CP-30 test-standards.md', 'Test case template, ID convention, negative-pattern library, automation and locator patterns, device matrix', 'QA Lead', 'Standards change'],
  ['CP-31 test-data-and-seed.md', 'Seed data structure, standard asset fixtures, masking rules, data builders', 'QA Lead', 'Data model change'],
  ['CP-40 security-and-compliance.md', 'Authorisation model, PII handling, audit log rules, secrets policy, AI data rules', 'Security', 'Policy change'],
  ['CP-50 prompt-templates/', 'One approved prompt per stage, S0 to S9', 'Architect + QA Lead', 'Prompt improvement'],
  ['CP-60 review-checklists.md', 'The gate checklists from T10, so AI can self-check before a human reviews', 'Council', 'Checklist change'],
  ['CP-99 golden-examples/', 'One reference feature per surface (service, mobile, internal web) for AI to imitate', 'Tech Leads', 'Quarterly refresh']
];

const ID_CONVENTIONS = [
  ['Module prefix', 'FAM asset master · DEP depreciation · LBL labelling and tracking · AUD validation and audit · PLT platform', 'DEP'],
  ['Requirement', '<MOD>-REQ-<nnn>; a revised requirement keeps its ID with .r<n>', 'DEP-REQ-214, DEP-REQ-214.r2'],
  ['Change request', 'CR-<yyyy>-<nnn>', 'CR-2026-031'],
  ['Service request', 'SR-<yyyy>-<nnnnn>', 'SR-2026-00412'],
  ['Defect', 'BUG-<MOD>-<nnn>', 'BUG-DEP-118'],
  ['SFVD', 'SFVD-<MOD>-<nn> v<major>.<minor>', 'SFVD-DEP-07 v2.1'],
  ['Test case', 'TC-<MOD>-<REQ nnn>-<nn>', 'TC-DEP-214-03'],
  ['Branch', '<type>/<ID>-<short-description>', 'feature/DEP-REQ-214-prorata-wdv'],
  ['Commit message', '[<ID>] <imperative summary>', '[DEP-REQ-214] Apply daily pro-rata to WDV additions'],
  ['Release', 'REL <major>.<minor>.<patch>', 'REL 4.7.0'],
  ['Context Pack', 'CP v<major>.<minor>', 'CP v1.3'],
  ['Prompt template', 'P-<stage> v<n>', 'P-S2 v3']
];

const ROLES = [
  ['Product Owner (PO)', 'Owns scope and priority; approves G1 and the business sign-off at G9; answers business open questions.'],
  ['Business Analyst (BA)', 'Runs intake and requirements; operates AI for the register; owns the RTM rows.'],
  ['Technical Writer', 'Operates AI for the SFVD; verifies fields, validations and registry IDs.'],
  ['Architect', 'Owns the Context Pack and this process; approves G3; decides classification disputes; chairs the Council.'],
  ['Tech Lead', 'Operates AI for design; accountable for G4 and G5; maintains the shared library index.'],
  ['Developer', 'Operates AI for code and tests; owns every line it generates; completes T09.'],
  ['Reviewer', 'Independent of the AI operator; approves or rejects the pull request.'],
  ['QA Lead / QA Engineer', 'Operates AI for test cases and data; owns G6 and G7 and the parity check.'],
  ['Automation Engineer', 'Operates AI for automation scripts; proves assertions by deliberate-fail checks.'],
  ['Domain SME', 'Independently re-derives financial and audit values for verification.'],
  ['Release Manager', 'Operates AI for release notes; reconciles scope; prepares G8.'],
  ['DevOps', 'Owns pipelines, deployment, monitoring and rollback; accountable for S9 execution.'],
  ['Security', 'Consulted on designs and sensitive changes; owns CP-40.'],
  ['Delivery Manager', 'Accountable for G0, G8 and G9; owns schedule but cannot bypass a gate.'],
  ['AI Governance Council', 'Architect (chair), QA Lead, Delivery Manager, Security. Owns thresholds, waivers, audits and metrics.']
];

/* stage x role RACI letters, roles: PO, BA, TW, ARC, TL, DEV, REV, QA, REL, OPS, SEC, DM */
const RACI_ROLES = ['PO', 'BA', 'TW', 'ARC', 'TL', 'DEV', 'REV', 'QA', 'REL', 'OPS', 'SEC', 'DM'];
const RACI = {
  S0: ['I', 'R', '', 'C', '', '', '', '', '', '', '', 'A'],
  S1: ['A', 'R', '', 'C', '', 'I', '', 'C', 'I', '', '', 'I'],
  S2: ['C', 'A', 'R', 'C', '', 'I', '', 'C', 'I', '', '', ''],
  S3: ['', '', '', 'A', 'R', 'I', '', 'C', '', '', 'C', ''],
  S4: ['', '', '', 'C', 'A', 'R', '', 'I', '', '', '', ''],
  S5: ['I', '', '', 'C', 'A', '', 'R', 'I', '', '', 'C', ''],
  S6: ['I', 'C', '', '', '', 'C', '', 'A/R', 'I', '', '', ''],
  S7: ['I', '', '', '', '', 'C', '', 'A/R', 'I', '', '', ''],
  S8: ['I', '', '', 'C', '', '', '', 'C', 'R', 'C', '', 'A'],
  S9: ['C', 'C', '', 'C', '', '', '', 'C', 'I', 'R', '', 'A']
};

const METRICS = [
  ['RTM completeness', 'REQ-IDs with linked code and passed tests ÷ REQ-IDs in scope', '100%', 'Each release'],
  ['Automation parity', '(Executed + automated + deferred) ÷ approved cases', '100%', 'Each release'],
  ['ID discipline', 'Commits carrying a valid ID ÷ all commits', '100%', 'Weekly'],
  ['Gate evidence', 'Gates with a T10 record ÷ gates passed', '100%', 'Monthly audit'],
  ['AI declaration', 'AI-G artifacts with a T11 declaration ÷ AI-G artifacts', '100%', 'Monthly audit'],
  ['Unresolved assumptions at gate', 'Assumptions still open when a gate is signed', '0', 'Each gate'],
  ['Review findings per AI-assisted PR', 'Reviewer findings ÷ AI-assisted pull requests', 'Falling trend', 'Monthly'],
  ['Escaped defects', 'Production defects per release, by stage of origin', 'Falling trend', 'Each release'],
  ['Defects traced to a missed gate', 'Defects whose RCA names a gate that should have caught them', 'Each one actioned', 'Monthly'],
  ['Stage cycle time', 'Working days from stage entry to gate', 'Baseline, then falling', 'Monthly'],
  ['Context Pack lead time', 'Days from T14 raised to merged', '≤ 5 working days', 'Monthly']
];

const AI_PERMISSIONS = {
  AG: ['Requirement register and acceptance criteria drafts', 'SFVD drafts', 'Design notes, OpenAPI contracts, migration drafts', 'Code and unit tests (except P1 / P2 fixes)', 'Test cases, test data and automation scripts', 'Release notes and runbook drafts', 'Fixes for P3 / P4 defects after RCA approval'],
  AA: ['Intake and log summaries', 'Duplicate and impact searches across the RTM and code', 'Code review aids: diff summary, deviation scan, duplicate detection', 'Regression selection suggestions for CRs', 'Defect description drafts', 'Post-deployment log summaries'],
  NA: ['Classifying work type or setting severity', 'Approving any gate, pull request or release', 'Answering its own open questions or assumptions', 'Root cause analysis for any defect', 'Fixes for P1 and P2 defects', 'Scripts that change cost, accumulated depreciation or NBV', 'Executing deployments, rollbacks or production data changes', 'Prompts containing production personal data, financial records or secrets', 'Creating new validation IDs, error codes or style classes outside the registry process']
};

module.exports = { MODES, WORK_TYPES, STAGES, TAILORING, TAILOR_KEY, SEVERITY, SR_TYPES, TECHNIQUES, UNIVERSAL_CHECKLIST, DOMAIN_CHECKS, TEMPLATES, CONTEXT_PACK, ID_CONVENTIONS, ROLES, RACI_ROLES, RACI, METRICS, AI_PERMISSIONS };
