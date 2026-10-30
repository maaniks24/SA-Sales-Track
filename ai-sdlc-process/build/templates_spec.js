/* Template definitions T01–T15: read by build_templates.js (Word) and build_site.js (web view). */
const D = require('./process_data');
const ST = id => D.STAGES.find(s => s.id === id);
const STD = (extra = []) => [['Document ID', '[e.g. DEP-RR]'], ['Version', '[0.1]'], ['Module', '[FAM / DEP / LBL / AUD / PLT]'], ['Status', '[Draft / In review / Baselined]'],
  ['Related IDs', '[REQ / CR / SR IDs]'], ['Context Pack version', '[CP v1.x]'], ['Prompt template', '[P-Sx vN]'], ['AI tool used', '[tool, or None]'],
  ['Author / AI operator', null], ['Reviewer', null], ...extra];

const T = [];
/* ---------------- T01 ---------------- */
T.push({ id: 'T01', file: 'T01-Requirement-Intake-and-Register', title: 'Requirement Intake and Register', stages: ['S0', 'S1'],
  purpose: 'Captures the business need and review points, and turns them into an approved register of uniquely identified, testable requirements.',
  when: 'S0 Intake and S1 Requirements, for new features and (with T04) change requests.', who: 'Business Analyst, with the Product Owner and business requester.',
  mode: 'Parts A and B M. Parts C to E AI-G, then verified and completed by the BA. Part G M.', ai: 'AI may structure and draft. AI must not answer its own open questions, decide scope or set priority.',
  store: 'Document repository /<module>/<release>/, linked from the Jira epic or CR.', info: STD([['Jira epic / CR', null], ['Product Owner', null]]),
  sections: [
    { h: 'Part A  Intake summary', b: [
      { t: 'opts', label: 'Work type', list: ['New feature (NF)', 'Change request (CR) — attach T04'] },
      { t: 'opts', label: 'Surfaces affected', list: ['Web + microservices', 'Mobile', 'Internal web', 'Integrations'] },
      { t: 'form', pairs: [['Requested by', null], ['Business owner', null], ['Business priority', '[High / Medium / Low]'], ['Target release', null], ['Duplicates checked', '[Jira links confirmed by a person]'], ['Related items', null]] },
      { t: 'guide', text: 'Summary of the need in three to five sentences. If AI summarised a long request, compare it line by line with the original.' },
      { t: 'text', lines: 4 } ] },
    { h: 'Part B  Business requirement note and review points', b: [
      { t: 'guide', text: 'One row per business statement, copied from the source. These row numbers are the “source ref” that every requirement in Part C must point to.' },
      { t: 'table', h: ['#', 'Business statement (source text)', 'Review point / client comment', 'Source (document, meeting, date)'], w: [0.06, 0.44, 0.28, 0.22], example: [['B1', 'Assets added mid-year must be depreciated from the date they are put to use.', 'Confirm whether daily or monthly pro-rata.', 'Finance workshop, 12 Oct']], rows: 6 } ] },
    { h: 'Part C  Requirement register', b: [
      { t: 'guide', text: 'Atomic, testable requirements. One ID each, per section 8.2 of the process definition. Every row must reference at least one Part B source.' },
      { t: 'table', h: ['REQ-ID', 'Requirement', 'Acceptance criteria', 'Source', 'Priority', 'Surface', 'Status'], w: [0.12, 0.28, 0.28, 0.07, 0.08, 0.1, 0.07],
        example: [['DEP-REQ-214', 'The system shall depreciate an asset from its put-to-use date.', 'Given an asset put to use on 15 Jul, July depreciation covers 17 days.', 'B1', 'Must', 'Service', 'Draft']], rows: 8 } ] },
    { h: 'Part D  Surface impact map', b: [
      { t: 'table', h: ['Area', 'Impacted?', 'Details', 'REQ-IDs'], w: [0.22, 0.12, 0.46, 0.2], fixed: [['Microservices'], ['Mobile application'], ['Internal web'], ['Integrations (ERP, ledger)'], ['Reports and exports'], ['Data and migration']], rows: 0 } ] },
    { h: 'Part E  Non-functional requirements', b: [
      { t: 'table', h: ['Category', 'Requirement', 'REQ-ID'], w: [0.24, 0.58, 0.18], fixed: [['Volume', 'e.g. 1 million assets per entity'], ['Performance', 'e.g. depreciation run for one entity within 30 minutes'], ['Availability'], ['Security and access'], ['Audit and retention'], ['Mobile offline']], rows: 0 } ] },
    { h: 'Part F  Open questions and assumptions', b: [
      { t: 'guide', text: 'Copy every assumption and open question the AI declared, plus any raised by people. All must be answered by the business before G1. The full register can be kept in T11 instead.' },
      { t: 'table', h: ['#', 'Question or assumption', 'Raised by', 'Answer', 'Answered by', 'Date'], w: [0.06, 0.34, 0.12, 0.28, 0.12, 0.08], rows: 5 } ] },
    { h: 'Part G  Reconciliation', b: [
      { t: 'form', cols: 2, pairs: [['Business statements in Part B', null], ['Requirements in Part C', null], ['Statements with no requirement (explain each)', null], ['Requirements with no source (must be 0)', null], ['SME who verified domain rules', null]] } ] }
  ], signoff: ['Business Analyst', 'Product Owner (G1)', 'Architect', 'QA Lead'] });
/* ---------------- T02 ---------------- */
T.push({ id: 'T02', file: 'T02-SFVD', title: 'SFVD — Screens, Fields, Validations, Data', stages: ['S2'],
  purpose: 'Specifies every screen, field, validation, error message and flow so that development and testing work from the same baselined truth.',
  when: 'S2 for new features; affected sections only (change-marked) for CRs; for defects only if designed behaviour changes.', who: 'Technical Writer or BA, verified with the Architect.',
  mode: 'AI-G draft per screen, then verified field by field (M).', ai: 'AI must not create new fields, validation IDs, error codes or style classes. Anything missing goes to section 10.',
  store: 'Document repository /<module>/<release>/ as SFVD-<MOD>-<nn>_T02_v<x.y>.', info: STD([['REQ-IDs covered', null], ['Data dictionary version', null]]),
  sections: [
    { h: '1  Change log for this version', b: [{ t: 'table', h: ['Version', 'Date', 'CR / REQ-ID', 'Sections changed', 'Author'], w: [0.12, 0.14, 0.2, 0.36, 0.18], rows: 3 }] },
    { h: '2  Screen inventory', b: [{ t: 'table', h: ['Screen ID', 'Screen name', 'Surface', 'Purpose', 'Roles', 'REQ-IDs'], w: [0.12, 0.2, 0.12, 0.26, 0.14, 0.16], example: [['DEP-SCR-07', 'Depreciation run', 'Internal web', 'Start and monitor a depreciation run', 'Finance admin', 'DEP-REQ-210'], ], rows: 4 }] },
    { h: '3  Screen specification', b: [
      { t: 'guide', text: 'Repeat sections 3.1 to 3.3 for each screen.' },
      { t: 'form', pairs: [['Screen ID', null], ['Screen name', null], ['Navigation from', null], ['Navigation to', null], ['Roles and permissions', null], ['Style classes (CP-21)', null], ['Reused components (CP-20)', null], ['Mobile offline', '[Allowed / Not allowed]']] },
      { t: 'guide', text: '3.1  Field table — every column must exist in the data dictionary; every validation ID and error code in CP-23.' },
      { t: 'table', h: ['#', 'Label', 'Dictionary column', 'Type', 'Len', 'Mand.', 'Default', 'Validation ID', 'Error code', 'REQ-ID'], w: [0.04, 0.13, 0.15, 0.08, 0.06, 0.07, 0.09, 0.13, 0.11, 0.14], example: [['1', 'Put-to-use date', 'ast_put_to_use_dt', 'Date', '—', 'Y', '—', 'VAL-DT-004', 'ERR-AST-112', 'DEP-REQ-214']], rows: 6 },
      { t: 'guide', text: '3.2  Actions' },
      { t: 'table', h: ['Action / button', 'Behaviour', 'Confirmation / validation', 'Audit entry', 'REQ-ID'], w: [0.18, 0.32, 0.2, 0.14, 0.16], rows: 3 },
      { t: 'guide', text: '3.3  Business rules on this screen' },
      { t: 'text', lines: 3 } ] },
    { h: '4  Business flows', b: [{ t: 'table', h: ['Flow', 'Step', 'Actor', 'System behaviour', 'Alternate / exception path', 'REQ-ID'], w: [0.08, 0.06, 0.12, 0.32, 0.28, 0.14], rows: 5 }] },
    { h: '5  Validations and messages', b: [{ t: 'table', h: ['Validation ID', 'Rule', 'Error code', 'Message text (from CP-23)', 'Screens'], w: [0.15, 0.3, 0.13, 0.27, 0.15], rows: 4 }] },
    { h: '6  User stories', b: [{ t: 'table', h: ['Story ID', 'As a … I want … so that …', 'Acceptance criteria', 'REQ-ID'], w: [0.12, 0.38, 0.36, 0.14], rows: 4 }] },
    { h: '7  Mobile offline and synchronisation', b: [{ t: 'table', h: ['Screen', 'Offline allowed', 'Sync rule', 'Conflict rule'], w: [0.2, 0.14, 0.33, 0.33], rows: 3 }] },
    { h: '8  Audit trail', b: [{ t: 'table', h: ['Entity', 'Fields audited', 'Captured (who / when / old / new)', 'Retention'], w: [0.2, 0.34, 0.3, 0.16], rows: 3 }] },
    { h: '9  Reuse call-outs', b: [{ t: 'table', h: ['Need', 'Existing component / validator', 'Verified in code by', 'Notes'], w: [0.25, 0.3, 0.2, 0.25], rows: 3 }] },
    { h: '10  Open questions and registry changes', b: [{ t: 'table', h: ['#', 'Missing item or question', 'Proposed resolution', 'T14 / registry ref', 'Status'], w: [0.06, 0.34, 0.3, 0.16, 0.14], rows: 4 }] }
  ], signoff: ['Technical Writer / BA', 'BA Lead (G2)', 'Architect', 'QA Lead', 'Product Owner'] });
/* ---------------- T03 ---------------- */
T.push({ id: 'T03', file: 'T03-Solution-Design-Note', title: 'Solution Design Note', stages: ['S3'],
  purpose: 'Records how a change is built across services and surfaces, the API contract agreed before coding, the data changes and the architecture decisions.',
  when: 'S3 for new features and Major CRs; for defects when the fix changes a contract or schema.', who: 'Tech Lead, reviewed by the Architect, DBA and Security.',
  mode: 'AI-G draft, AUTO OpenAPI and SQL checks, M review.', ai: 'AI may draft designs and contracts. AI must not merge the contract or approve a breaking change.',
  store: 'Document repository; the OpenAPI file itself lives in the contract repository.', info: STD([['SFVD version', null], ['Contract version', null]]),
  sections: [
    { h: '1  Scope', b: [{ t: 'form', cols: 2, pairs: [['REQ-IDs in scope', null], ['Out of scope', null], ['Assumptions', null]] }] },
    { h: '2  Service and surface impact', b: [{ t: 'table', h: ['Service / application', 'Change (new / modify / none)', 'Responsibility of the change', 'Owning team'], w: [0.26, 0.18, 0.38, 0.18], rows: 4 }] },
    { h: '3  API contract summary', b: [
      { t: 'guide', text: 'The OpenAPI file is the source of truth; this table summarises it for review. Attach the OpenAPI diff result.' },
      { t: 'table', h: ['Operation', 'Method and path', 'Request', 'Response', 'Errors (CP-22)', 'Version', 'x-req-ids', 'Breaking?'], w: [0.13, 0.17, 0.13, 0.13, 0.13, 0.08, 0.13, 0.1], rows: 4 } ] },
    { h: '4  Events and messages', b: [{ t: 'table', h: ['Topic', 'Producer', 'Consumers', 'Payload', 'Idempotency key'], w: [0.2, 0.17, 0.2, 0.25, 0.18], rows: 3 }] },
    { h: '5  Data design', b: [{ t: 'table', h: ['Table / entity', 'Change', 'Columns', 'Indexes', 'Migration script', 'Rollback script'], w: [0.16, 0.12, 0.22, 0.14, 0.18, 0.18], rows: 3 }] },
    { h: '6  Reuse plan', b: [{ t: 'table', h: ['Need', 'Existing component (CP-20)', 'Reuse / extend / new', 'Justification if new'], w: [0.24, 0.28, 0.16, 0.32], rows: 4 }] },
    { h: '7  Mobile and internal web impact', b: [{ t: 'text', lines: 3, hint: 'Offline and sync behaviour, minimum supported mobile version (N-1 rule), shared UI components.' }] },
    { h: '8  Architecture decision record', b: [{ t: 'table', h: ['Decision', 'Options considered', 'Chosen', 'Rationale', 'Consequences'], w: [0.2, 0.24, 0.14, 0.22, 0.2], rows: 3 }] },
    { h: '9  Non-functional and security design', b: [{ t: 'table', h: ['Aspect', 'Design'], w: [0.25, 0.75], fixed: [['Authorisation'], ['PII handling'], ['Audit fields'], ['Performance target and approach'], ['Failure and retry']], rows: 0 }] },
    { h: '10  Risks and open questions', b: [{ t: 'table', h: ['#', 'Risk or question', 'Owner', 'Resolution'], w: [0.06, 0.48, 0.16, 0.3], rows: 3 }] }
  ], signoff: ['Tech Lead', 'Architect (G3)', 'DBA', 'Security'] });
/* ---------------- T04 ---------------- */
T.push({ id: 'T04', file: 'T04-CR-Impact-Analysis', title: 'Change Request Impact Analysis', stages: [],
  purpose: 'Establishes exactly what a change request touches before it is approved, and classifies it as Minor or Major.',
  when: 'S0 and S1 for every change request. No CR is approved without it.', who: 'Architect with the Business Analyst; approved by the Product Owner.',
  mode: 'AI-A searches the RTM and code; every impacted item is confirmed M by the Architect.', ai: 'AI may search and suggest. A suggested impact is not an impact until the Architect confirms it.',
  store: 'Attached to the Jira CR as <CR-ID>_T04.', info: [['CR ID', '[CR-yyyy-nnn]'], ['Title', null], ['Requested by', null], ['Date', null], ['Baseline REQ-IDs', null], ['Baseline SFVD versions', null], ['Context Pack version', null], ['Analyst', null]],
  sections: [
    { h: '1  Change description', b: [{ t: 'table', h: ['Current behaviour', 'Requested behaviour', 'Business reason'], w: [0.34, 0.34, 0.32], rows: 2 }] },
    { h: '2  Classification', b: [
      { t: 'checklist', title: 'Any ticked item makes the CR Major', items: ['Changes an API contract or database schema', 'Affects more than one surface', 'Estimated at more than five working days', 'Changes a financial calculation or posting'], evidence: false },
      { t: 'opts', label: 'Classification', list: ['Minor', 'Major'] } ] },
    { h: '3  Impact on requirements', b: [{ t: 'table', h: ['REQ-ID', 'Impact (revise / new / retire)', 'New or revised ID', 'Suggested by AI?', 'Confirmed by', 'Notes'], w: [0.14, 0.18, 0.16, 0.12, 0.16, 0.24], example: [['DEP-REQ-214', 'Revise', 'DEP-REQ-214.r2', 'Yes', 'Architect', 'Daily pro-rata']], rows: 4 }] },
    { h: '4  Impact on documents', b: [{ t: 'table', h: ['Document', 'Section', 'Change needed', 'Owner'], w: [0.22, 0.18, 0.4, 0.2], rows: 3 }] },
    { h: '5  Impact on components and data', b: [{ t: 'table', h: ['Service / app / report', 'Change', 'Contract impact', 'Data impact', 'Confirmed by'], w: [0.24, 0.26, 0.16, 0.16, 0.18], rows: 4 }] },
    { h: '6  Design notes (Minor CR only)', b: [{ t: 'text', lines: 4, hint: 'For a Minor CR, S3 is not run. Record the design approach here instead.' }] },
    { h: '7  Regression selection', b: [
      { t: 'guide', text: 'AI may propose cases from the RTM and changed files. The QA Lead confirms. Minimum: impacted cases + smoke + critical-path pack.' },
      { t: 'table', h: ['Test case ID', 'Reason selected', 'Proposed by (AI / QA)', 'Confirmed'], w: [0.2, 0.46, 0.18, 0.16], rows: 5 } ] },
    { h: '8  Financial rule changes', b: [
      { t: 'opts', label: 'Application', list: ['Not applicable', 'Prospective', 'Retrospective (Finance approval required)'] },
      { t: 'form', cols: 2, pairs: [['Finance approver', null], ['Approval reference', null]] } ] },
    { h: '9  Effort and schedule', b: [{ t: 'table', h: ['Area', 'Estimate (days)', 'Assumptions'], w: [0.3, 0.18, 0.52], fixed: [['Specification'], ['Design'], ['Development'], ['Testing'], ['Release']], rows: 0 }] }
  ], checklist: ['Every impacted REQ-ID confirmed by the Architect, not only suggested by AI', 'Contract and schema impact assessed; Minor or Major classification justified', 'Mobile N-1 compatibility considered', 'Regression selection confirmed by the QA Lead and includes the critical-path pack', 'Financial rule changes: prospective or retrospective decided; Finance approval recorded', 'Effort and schedule agreed with the Product Owner'],
  checkGuide: 'Completed before gate G1 for the CR.', signoff: ['Architect', 'Business Analyst', 'QA Lead', 'Product Owner (G1)', 'Finance (if financial rule)'] });
/* ---------------- T05 ---------------- */
T.push({ id: 'T05', file: 'T05-Issue-and-SR-Triage', title: 'Issue and Service Request Triage Form', stages: [],
  purpose: 'Triages every reported issue or service request, decides whether code is needed, and records service-request changes from preparation to verification.',
  when: 'S0 for every SR; Parts C to E only for service requests (no code change).', who: 'Triage Lead; reviewers and authorised admin for Parts D and E.',
  mode: 'M throughout. AI-A may summarise logs. AI-G may draft non-financial scripts only.', ai: 'Scripts that change cost, accumulated depreciation or NBV: AI not permitted (AI-X).',
  store: 'Attached to the Jira SR or bug as <ID>_T05.', info: [['SR / BUG ID', null], ['Reported by', null], ['Date and time', null], ['Channel', '[Support / monitoring / business]'], ['Module', null], ['Surface', null], ['Environment', null], ['Triage Lead', null]],
  sections: [
    { h: 'Part A  Triage', b: [
      { t: 'form', cols: 2, pairs: [['Summary', null], ['Steps to reproduce', null], ['Expected result', null], ['Actual result', null], ['Reproduced by / when', null], ['Evidence (logs, screenshots)', null], ['AI log summary used? Verified by', '[Yes / No — name]']] },
      { t: 'opts', label: 'Classification', list: ['Defect', 'Service request', 'Re-route as CR'] },
      { t: 'opts', label: 'Severity', list: ['P1', 'P2', 'P3', 'P4'] },
      { t: 'form', cols: 2, pairs: [['Severity justification', null], ['SR type (if SR)', '[Data / Config / Access / Report / Upload]']] } ] },
    { h: 'Part B  Defect path', b: [{ t: 'form', cols: 2, pairs: [['RCA document (T06)', null], ['Failing test name and commit', null], ['AI permission for the fix', '[P1/P2: AI-X · P3/P4: AI-G after RCA]']] }] },
    { h: 'Part C  Service request change specification', b: [
      { t: 'table', h: ['Object / table', 'Current value', 'New value', 'Records', 'Script ref', 'Rollback script', 'Changes financial value?'], w: [0.16, 0.14, 0.14, 0.09, 0.15, 0.15, 0.17], rows: 3 } ] },
    { h: 'Part D  Review and dry run', b: [{ t: 'form', cols: 4, pairs: [['Reviewer 1', null], ['Reviewer 2 (financial)', null], ['Dry-run environment', null], ['Dry-run date', null], ['Before extract', null], ['After extract', null], ['Result', null], ['Sample checked', '[10% or 20 rows]']] }] },
    { h: 'Part E  Execution and verification', b: [{ t: 'form', cols: 4, pairs: [['Change record ID', null], ['Executed by (admin)', null], ['Date and time', null], ['Verified by requester', null], ['Evidence', null], ['Closed on', null]] }] }
  ], checklist: ['Issue reproduced, or request validated, before any change', 'Classification and severity justified; re-routed if code or new behaviour is needed', 'Script is reversible and the rollback script was tested', 'Scripts changing financial values were written manually and reviewed by two people', 'Dry run on a production-like copy; before and after evidence attached', 'Executed by an authorised admin under a change record', 'Requester verified the outcome'],
  checkGuide: 'Completed before closure (G9). For defects, the T06 and code-review checklists also apply.', signoff: ['Triage Lead', 'Reviewer', 'Data owner', 'Requester'] });
/* ---------------- T06 ---------------- */
T.push({ id: 'T06', file: 'T06-Root-Cause-Analysis', title: 'Root Cause Analysis', stages: [],
  purpose: 'Explains why a defect happened and why it was not caught, and fixes the process gap as well as the code.',
  when: 'Every defect, before the fix is approved (G1 on the defect path).', who: 'Developer with the Tech Lead; Architect for P1 and P2.',
  mode: 'AI-X. Written entirely by the engineer.', ai: 'AI may summarise logs for you, but the analysis, the cause and the actions are written by a person.',
  store: 'Attached to the Jira bug as <BUG-ID>_T06.', info: [['BUG ID', null], ['Severity', null], ['Module', null], ['Release introduced', null], ['Release fixed', null], ['Author', null], ['Reviewer', null], ['Date', null]],
  sections: [
    { h: '1  Problem and impact', b: [{ t: 'form', cols: 2, pairs: [['Problem statement', null], ['Business impact', null], ['Financial impact', '[None / amount / postings affected]'], ['Records or users affected', null]] }] },
    { h: '2  Timeline', b: [{ t: 'table', h: ['Date and time', 'Event', 'Source'], w: [0.2, 0.55, 0.25], rows: 4 }] },
    { h: '3  Reproduction', b: [{ t: 'form', cols: 2, pairs: [['Failing test name', null], ['Commit (before fix)', null]] }] },
    { h: '4  Root cause', b: [
      { t: 'guide', text: 'Keep asking why until the answer is a process cause, not only a code cause.' },
      { t: 'table', h: ['Why', 'Answer'], w: [0.12, 0.88], fixed: [['Why 1'], ['Why 2'], ['Why 3'], ['Why 4'], ['Why 5']], rows: 0 } ] },
    { h: '5  Why it was not caught', b: [{ t: 'table', h: ['Gate that should have caught it', 'Why it did not', 'Evidence'], w: [0.24, 0.46, 0.3], rows: 2 }] },
    { h: '6  Corrective action (the fix)', b: [{ t: 'form', cols: 2, pairs: [['Description', null], ['Pull request', null], ['Reviewers', null]] }] },
    { h: '7  Preventive actions', b: [{ t: 'table', h: ['Action', 'Type (test / checklist / Context Pack / design)', 'Owner', 'Due', 'T14 ref'], w: [0.34, 0.24, 0.14, 0.12, 0.16], rows: 3 }] },
    { h: '8  Data impact and remediation', b: [{ t: 'form', cols: 2, pairs: [['Records affected', null], ['Correction SR', null]] }] }
  ], checklist: ['Root cause written by an engineer, not generated by AI', 'The five whys reach a process cause, not only a code cause', 'The gate that missed the defect is named, with evidence', 'Failing test committed before the fix', 'Preventive action for the missed gate assigned with an owner and date', 'Data impact assessed; correction raised as an SR if needed', 'P1 / P2: reviewed by the Architect'],
  checkGuide: 'Completed before the RCA is approved (G1 on the defect path).', signoff: ['Developer', 'Tech Lead', 'Architect (P1 / P2)', 'QA Lead'] });
/* ---------------- T07 (landscape) ---------------- */
T.push({ id: 'T07', file: 'T07-Test-Case-Specification', title: 'Test Case Specification', stages: ['S6'], landscape: true,
  purpose: 'Defines the approved test cases for a scope of requirements, with traceability, expected results and automation intent.',
  when: 'S6, starting as soon as the SFVD is baselined (G2).', who: 'QA Engineer; reviewed by the QA Lead, BA and domain SME.',
  mode: 'AI-G draft, then coverage reconciliation and SME verification (M).', ai: 'AI must not decide expected values for financial calculations without SME verification.',
  store: 'Test management tool; export attached to the release folder.', info: STD([['SFVD version', null], ['Suite ID', null]]),
  sections: [
    { h: '1  Coverage summary', b: [{ t: 'table', h: ['REQ-ID', 'Positive cases', 'Negative cases', 'Validation cases', 'Covered'], w: [0.24, 0.18, 0.18, 0.2, 0.2], rows: 4 }] },
    { h: '2  Test cases', b: [{ t: 'table', h: ['TC-ID', 'REQ-ID', 'Title', 'Preconditions / data', 'Steps', 'Expected result', 'Type', '+/−', 'Priority', 'Automate', 'Regression'],
      w: [0.09, 0.09, 0.13, 0.11, 0.18, 0.16, 0.05, 0.04, 0.05, 0.05, 0.05], example: [['TC-DEP-214-03', 'DEP-REQ-214', 'Mid-month put-to-use', 'FX-AST-014', '1. Run July depreciation', '17 days of charge = SME value', 'F', '+', 'High', 'Y', 'Y']], rows: 8 }] },
    { h: '3  Device, browser and role coverage', b: [{ t: 'table', h: ['TC-ID', 'Device / browser', 'Role', 'Result'], w: [0.2, 0.35, 0.25, 0.2], rows: 3 }] },
    { h: '4  Duplicate check against regression', b: [{ t: 'table', h: ['TC-ID', 'Similar existing case', 'Decision (keep / drop / merge)'], w: [0.25, 0.4, 0.35], rows: 3 }] },
    { h: '5  SME verification of expected results', b: [{ t: 'table', h: ['TC-ID', 'Scenario', 'SME calculated value', 'AI expected value', 'Match'], w: [0.15, 0.35, 0.18, 0.18, 0.14], rows: 3 }] }
  ], signoff: ['QA Engineer', 'QA Lead (G6)', 'Business Analyst', 'Domain SME'] });
/* ---------------- T08 ---------------- */
T.push({ id: 'T08', file: 'T08-Test-Data-and-Seed-Specification', title: 'Test Data and Seed Data Specification', stages: [],
  purpose: 'Defines the data each test case needs, built from the standard seed structure, so every tester and every AI prompt uses the same data.',
  when: 'S6 when cases are designed; used in S7 for execution.', who: 'QA Engineer; reviewed by the QA Lead.',
  mode: 'AI-G draft mapped to the CP-31 seed structure, verified M.', ai: 'Never use production personal or financial data in prompts or test data.',
  store: 'Alongside T07; seed scripts in the automation repository.', info: STD([['Seed structure version (CP-31)', null], ['Environment', null]]),
  sections: [
    { h: '1  Standard fixtures used', b: [{ t: 'table', h: ['Fixture ID', 'Description', 'Used by test cases'], w: [0.16, 0.5, 0.34], example: [['FX-AST-014', 'Computer, SLM, 3-year life, cost 90,000, put to use 15 Jul', 'TC-DEP-214-01 to 05']], rows: 4 }] },
    { h: '2  New data required', b: [{ t: 'table', h: ['Data ID', 'Entity', 'Field values', 'Masking', 'Created by (script)', 'Test cases'], w: [0.12, 0.14, 0.3, 0.12, 0.16, 0.16], rows: 4 }] },
    { h: '3  Masking and compliance', b: [{ t: 'table', h: ['Field', 'Masking rule', 'Verified by'], w: [0.3, 0.45, 0.25], rows: 3 }] },
    { h: '4  Environments and accounts', b: [{ t: 'table', h: ['Role', 'Test account', 'Environment'], w: [0.3, 0.4, 0.3], rows: 3 }] },
    { h: '5  Reset and teardown', b: [{ t: 'text', lines: 3, hint: 'How data is reset so tests are repeatable and independent.' }] }
  ], checklist: ['Every test case that needs data has it defined here or in a standard fixture', 'New data follows the CP-31 seed structure', 'No production personal or financial data; masking verified', 'Accounts exist for every role in the role matrix', 'Reset and teardown make tests repeatable in any order'],
  checkGuide: 'Completed with T07 before gate G6.', signoff: ['QA Engineer', 'QA Lead'] });
/* ---------------- T09 ---------------- */
T.push({ id: 'T09', file: 'T09-PR-and-Code-Review-Checklist', title: 'Pull Request and Code Review Checklist', stages: [],
  purpose: 'Records the developer’s self-review and the independent reviewer’s decision for every pull request.',
  when: 'S4 (developer, before raising the PR) and S5 (reviewer). A markdown version is provided as the pull request template.', who: 'Developer, then an independent reviewer.',
  mode: 'M. AI-A review aids are advisory only.', ai: 'AI never approves or merges. For P1/P2 fixes, no AI-generated code.',
  store: 'Pull request description (markdown version in ai-context/templates).', info: [['Pull request', null], ['IDs', '[REQ / CR / BUG]'], ['Branch', null], ['Developer', null], ['Reviewer', null], ['Context Pack version', null], ['Lines changed', '[≤ 400]'], ['Date', null]],
  sections: [
    { h: '1  AI usage', b: [
      { t: 'opts', label: 'AI used', list: ['None', 'AI-A only', 'AI-G'] },
      { t: 'form', cols: 2, pairs: [['Tool', null], ['Prompt template', null], ['Files / sections generated', null], ['T11 reference', null]] } ] },
    { h: '2  Developer self-review (S4)', b: [{ t: 'checklist', items: ST('S4').checklist, title: 'Developer confirms', evidence: false }] },
    { h: '3  CI evidence', b: [{ t: 'table', h: ['Check', 'Result', 'Link'], w: [0.35, 0.2, 0.45], fixed: [['PMD / Checkstyle'], ['Sonar quality gate'], ['New-code coverage'], ['Duplication'], ['OpenAPI diff'], ['Secret scan'], ['ID check']], rows: 0 }] },
    { h: '4  Independent review (S5)', b: [{ t: 'checklist', items: ST('S5').checklist, title: 'Reviewer confirms', evidence: false }] },
    { h: '5  Review findings', b: [{ t: 'table', h: ['#', 'File / line', 'Finding', 'Severity', 'Resolution'], w: [0.06, 0.2, 0.38, 0.12, 0.24], rows: 4 }] }
  ], checklist: [], signoff: ['Developer', 'Reviewer (G5)', 'Tech Lead'] });
/* ---------------- T10 (one page per gate) ---------------- */
T.push({ id: 'T10', file: 'T10-Stage-Gate-Checklists-and-Sign-off', title: 'Stage Gate Checklists and Sign-off', stages: [],
  purpose: 'One page per gate, G0 to G9. The gate owner records the four verification levels and the decision. A stage output becomes the next stage’s input only after this record.',
  when: 'At the end of every stage. Use the page for the gate you are closing.', who: 'L2: stage owner. L3: independent reviewer. L4: gate owner (accountable role).',
  mode: 'M, with AUTO evidence attached.', ai: 'AI never signs a gate. The L3 reviewer is never the AI operator.',
  store: 'Attached to the Jira gate transition as <ID>_G<n>_T10; logged in X01 Gate Log.', info: [['Work item ID', null], ['Work type', '[NF / CR / SR]'], ['Module', null], ['Release', null]],
  sections: D.STAGES.map((s, i) => ({ h: `Gate ${s.gate}  ·  ${s.id} ${s.name}`, newPage: true, b: [
    { t: 'form', pairs: [['Artifact and version', null], ['Context Pack version', null], ['AI operator', null], ['Gate owner', s.raci.A]] },
    { t: 'guide', text: 'L1 Automated checks — attach result or link.' },
    { t: 'table', h: ['Automated check', 'Result', 'Link'], w: [0.5, 0.15, 0.35], fixed: s.auto.map(a => [a]), rows: 0 },
    { t: 'guide', text: 'L2 Role checklist and L3 independent review.' },
    { t: 'checklist', items: s.checklist, evidence: true },
    { t: 'guide', text: 'If any part of the output was AI-generated, the universal checklist in T11 must also be complete.' },
    { t: 'opts', label: 'L4 Decision', list: ['Approve', 'Approve with conditions', 'Reject'] },
    { t: 'form', cols: 2, pairs: [['Conditions or rejection reason', null], ['L3 reviewer (not the AI operator)', null], ['Gate owner signature and date', null]] }
  ] })), checklist: [], signoff: ['Gate owner', 'L3 reviewer'] });
/* ---------------- T11 ---------------- */
T.push({ id: 'T11', file: 'T11-AI-Usage-Declaration-and-Assumptions', title: 'AI Usage Declaration and Assumption Register', stages: [],
  purpose: 'Declares how AI was used to produce an artifact, and records every assumption and open question AI raised and how each was resolved.',
  when: 'Every time an AI-G output is produced (S1, S2, S3, S4, S6, S7, S8). A short form is in the PR template for code.', who: 'The AI operator; checked by the reviewer.',
  mode: 'M.', ai: 'Declaring AI use is mandatory. Undeclared AI-generated content fails the gate.',
  store: 'Attached to the artifact or pull request; summary row in X01 AI Usage Log.', info: [['Artifact ID and version', null], ['Stage', null], ['AI operator', null], ['Reviewer', null], ['Date', null], ['Work item', null]],
  sections: [
    { h: '1  Declaration', b: [{ t: 'form', cols: 2, pairs: [['AI tool and model', null], ['Prompt template and version', '[P-Sx vN]'], ['Context Pack version', null], ['Input artifacts (ID and version)', null], ['Sections or files generated by AI', null], ['Sections written manually', null]] },
      { t: 'checklist', items: ['No production personal data, financial records, credentials or secrets were included in any prompt'], title: 'Operator confirms', evidence: false }] },
    { h: '2  Assumption and open-question register', b: [
      { t: 'guide', text: 'Copy every assumption and open question from the AI self-check block (prompt block 8). Each must be resolved before the gate.' },
      { t: 'table', h: ['#', 'Assumption or question as stated by AI', 'A / Q', 'Resolution', 'Resolved by', 'Date', 'Status'], w: [0.05, 0.35, 0.07, 0.26, 0.11, 0.08, 0.08], rows: 6 } ] },
    { h: '3  Validation techniques applied', b: [{ t: 'checklist', title: 'Technique', items: D.TECHNIQUES.map(t => `${t[0]} ${t[1]} — ${t[2]}`), evidence: true }] }
  ], checklist: D.UNIVERSAL_CHECKLIST, checkGuide: 'The universal AI output acceptance checklist (process definition 6.3). Completed by the reviewer.', signoff: ['AI operator', 'Reviewer'] });
/* ---------------- T12 ---------------- */
T.push({ id: 'T12', file: 'T12-Release-Note', title: 'Release Note', stages: ['S8'],
  purpose: 'States exactly what a release contains, reconciled with Jira scope and the RTM.',
  when: 'S8 for every release, including hotfixes.', who: 'Release Manager; approved by the Delivery Manager.',
  mode: 'AI-G draft from commits and REQ-IDs, reconciled M.', ai: 'AI may draft; every line must trace to a merged pull request.',
  store: 'Release folder as REL-<version>_T12.', info: [['Release version', null], ['Release date', null], ['Type', '[Scheduled / Hotfix]'], ['Release Manager', null], ['Artifact checksum', null], ['Context Pack version', null], ['Jira release', null], ['Environments', null]],
  sections: [
    { h: '1  Summary', b: [{ t: 'text', lines: 3 }] },
    { h: '2  Scope', b: [{ t: 'table', h: ['ID', 'Type (NF / CR / BUG)', 'Title', 'Surfaces', 'Release-note text', 'PR'], w: [0.14, 0.12, 0.2, 0.12, 0.3, 0.12], rows: 5 }] },
    { h: '3  Configuration changes', b: [{ t: 'table', h: ['Key', 'Old value', 'New value', 'Environment'], w: [0.3, 0.22, 0.22, 0.26], rows: 3 }] },
    { h: '4  Database changes', b: [{ t: 'table', h: ['Script', 'Reversible', 'Dry-run result'], w: [0.5, 0.2, 0.3], rows: 2 }] },
    { h: '5  Known issues and deferred items', b: [{ t: 'table', h: ['ID', 'Description', 'Workaround', 'Target release'], w: [0.15, 0.4, 0.3, 0.15], rows: 3 }] },
    { h: '6  Compatibility', b: [{ t: 'form', cols: 2, pairs: [['Minimum mobile app version', null], ['API versions served', null]] }] },
    { h: '7  Reconciliation', b: [{ t: 'form', cols: 2, pairs: [['Items in Jira release scope', null], ['Lines in section 2', null], ['RTM rows in scope with passed tests', null], ['All three agree?', '[Yes / No — explain]']] }] }
  ], signoff: ['Release Manager', 'Delivery Manager (G8)', 'QA Lead'] });
/* ---------------- T13 ---------------- */
T.push({ id: 'T13', file: 'T13-Deployment-Runbook-and-Smoke-Checklist', title: 'Deployment Runbook and Smoke Checklist', stages: ['S9'],
  purpose: 'The step-by-step plan for deploying a release, proving it works and rolling back if it does not.',
  when: 'Drafted at S8, executed at S9.', who: 'DevOps; smoke tests by QA; business sign-off by the Product Owner.',
  mode: 'AI-G draft, executed M; AI-A may summarise post-deployment logs.', ai: 'AI must not execute deployment or rollback steps.',
  store: 'Release folder as REL-<version>_T13.', info: [['Release', null], ['Window', null], ['Change record', null], ['Deployer', null], ['Approver', null], ['Rollback decision owner', null]],
  sections: [
    { h: '1  Pre-deployment checks', b: [{ t: 'checklist', items: ['Backup confirmed by a named person', 'Artifact checksum matches the signed release', 'Configuration verified for this environment', 'Stakeholders and support notified', 'Monitoring dashboards open and alert thresholds set'], title: 'Before starting', evidence: true }] },
    { h: '2  Deployment steps', b: [{ t: 'table', h: ['#', 'Step', 'Command / Jenkins job', 'Expected', 'Done by', 'Time', 'Result'], w: [0.05, 0.25, 0.2, 0.18, 0.11, 0.08, 0.13], rows: 6 }] },
    { h: '3  Smoke tests', b: [{ t: 'table', h: ['TC-ID', 'Check', 'Result', 'Executed by (QA)'], w: [0.18, 0.47, 0.15, 0.2], rows: 6 }] },
    { h: '4  Monitoring window', b: [{ t: 'table', h: ['Metric', 'Threshold', 'Observed', 'OK'], w: [0.35, 0.2, 0.3, 0.15], rows: 4 }] },
    { h: '5  Rollback plan', b: [{ t: 'form', cols: 2, pairs: [['Rollback triggers', null], ['Rollback steps', null], ['Data rollback', null], ['Time to roll back', null]] }] }
  ], signoff: ['DevOps', 'QA (smoke)', 'Product Owner (business sign-off)', 'Delivery Manager (G9)'] });
/* ---------------- T14 ---------------- */
T.push({ id: 'T14', file: 'T14-Context-Pack-Change-Request', title: 'Context Pack Change Request', stages: [],
  purpose: 'Proposes a change to a Context Pack file so a gap found once is fixed for every developer.',
  when: 'Any stage, whenever AI output was wrong because of missing or wrong context. Reviewed at every S9.', who: 'Anyone; approved by the file owner and a Council member.',
  mode: 'M.', ai: 'AI may help draft the wording of the change; the owner approves it.',
  store: 'Council folder as CPCR-<nnn>; logged in X01 CP Version Log once merged.', info: [['CPCR ID', null], ['Raised by', null], ['Date', null], ['Current CP version', null], ['File(s) affected', null], ['Work item where found', null]],
  sections: [
    { h: '1  Gap observed', b: [{ t: 'form', cols: 2, pairs: [['What AI produced (paste example)', null], ['What it should have produced', null], ['Stage and artifact', null]] }] },
    { h: '2  Proposed change', b: [{ t: 'table', h: ['File', 'Section', 'New or changed text'], w: [0.22, 0.18, 0.6], rows: 3 }] },
    { h: '3  Impact', b: [{ t: 'form', cols: 2, pairs: [['Surfaces affected', null], ['Prompt templates to update', null], ['Checklists to update', null]] }] },
    { h: '4  Merge record', b: [{ t: 'form', cols: 2, pairs: [['Pull request', null], ['New CP version', null], ['Broadcast to teams on', null]] }] }
  ], checklist: ['An example of the wrong AI output is attached', 'The change is a rule or fact, not a one-off preference', 'It does not conflict with another Context Pack file', 'Prompt templates and checklists updated where needed', 'VERSION bumped and all three surface teams notified'],
  checkGuide: 'Completed by the file owner before merge.', signoff: ['File owner', 'Council member'] });
/* ---------------- T15 ---------------- */
T.push({ id: 'T15', file: 'T15-Waiver-and-Deviation-Request', title: 'Waiver and Deviation Request', stages: [],
  purpose: 'Requests permission to bypass a rule or gate for a limited time, with the risk understood and compensating controls in place.',
  when: 'Any stage, before the deviation happens (P1 incidents: within two working days after).', who: 'Requester; approved only by the AI Governance Council.',
  mode: 'M.', ai: 'Not applicable.', store: 'Council folder as WVR-<nnn>; logged in X01 Waiver Register.',
  info: [['Waiver ID', null], ['Requested by', null], ['Date', null], ['Work item', null], ['Rule or gate to waive', null], ['Owner', null]],
  sections: [
    { h: '1  What is waived and why', b: [{ t: 'text', lines: 4 }] },
    { h: '2  Risk assessment', b: [{ t: 'form', cols: 2, pairs: [['Likelihood', '[Low / Medium / High]'], ['Impact', '[Low / Medium / High]'], ['What could go wrong', null]] }] },
    { h: '3  Compensating controls', b: [{ t: 'text', lines: 3 }] },
    { h: '4  Duration', b: [{ t: 'form', cols: 2, pairs: [['Start', null], ['Expiry (≤ 90 days)', null]] }] },
    { h: '5  Council decision', b: [{ t: 'opts', label: 'Decision', list: ['Approved', 'Approved with conditions', 'Rejected'] }, { t: 'form', cols: 2, pairs: [['Conditions', null], ['Decision date', null]] }] },
    { h: '6  Closure', b: [{ t: 'form', cols: 2, pairs: [['Closed on', null], ['Outcome', null]] }] }
  ], checklist: ['The reason is not schedule pressure alone', 'Risk assessed and compensating controls defined', 'Expiry within 90 days and an owner named', 'Logged in the X01 Waiver Register'],
  checkGuide: 'Completed by the Council before approval.', signoff: ['Requester', 'Architect', 'Council chair'] });


module.exports = { T };
