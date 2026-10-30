const fs = require('fs'); const path = require('path');
const X = require('./docx_lib'); const D = require('./process_data'); const A = require('./build_process_doc'); const B = require('./build_process_doc2');
const { d, COL, CW, CWL, run, P, H1, H2, H3, bullets, numbered, spacer, table, checklist, callout } = X;
const { modeRuns, FIG } = A;
const { Paragraph, Document, Packer } = d;

/* ======================= 6 VALIDATION ======================= */
function sec6() {
  return [
    H1('6  AI Output Validation Framework'),
    P('AI output fails in predictable ways: it invents plausible identifiers, omits items silently, drifts from house standards, and gets domain rules subtly wrong while sounding certain. Validation is therefore not a general read-through. It is a fixed set of levels and techniques, each aimed at one failure mode, applied the same way by everyone.'),
    H2('6.1  Four levels of verification'),
    ...X.figure(FIG('D7-validation-levels'), 'The four verification levels that close every gate', CW, { maxH: 400 }),
    table(['Level', 'Who', 'What it proves', 'Evidence'], [
      ['L1 Automated', 'Jenkins and tools', 'Objective rules are met: standards, quality, security, contract compatibility, ID links, parity', 'Pipeline result link in T10'],
      ['L2 Role checklist', 'The stage owner', 'Every stage-specific check has been made by the accountable role', 'Ticked checklist in T10'],
      ['L3 Independent review', 'A reviewer who is not the AI operator', 'The output matches the approved input, with no invented or missing content', 'Reviewer name and findings in T10'],
      ['L4 Recorded sign-off', 'The gate owner', 'The decision was taken and is auditable', 'T10 record + X01 gate log']
    ], [1800, 2100, 3700, CW - 7600], { boldCols: [0] }),
    H2('6.2  Validation techniques'),
    P('Each stage in section 4 names the techniques it uses. The reviewer applies them as described here.'),
    table(['ID', 'Technique', 'Catches', 'How to apply', 'Stages'], D.TECHNIQUES, [550, 1650, 1700, 4250, CW - 8150], { boldCols: [0, 1] }),
    H2('6.3  Universal AI output acceptance checklist'),
    P('Apply this checklist to every AI-generated artifact, in addition to the stage checklist. It is repeated in T11.'),
    checklist(D.UNIVERSAL_CHECKLIST, { title: 'Before accepting any AI-generated output' }),
    H2('6.4  Domain spot-check library'),
    P('Fixed-asset accounting is where AI output most often looks right and is wrong. When an artifact touches these areas, the domain SME re-derives at least two scenarios independently (technique V7). The exact rules come from the company’s accounting policy; this list says where to look.'),
    table(['Area', 'What to re-derive or verify'], D.DOMAIN_CHECKS, [2600, CW - 2600], { boldCols: [0] }),
    H2('6.5  Handling rejected AI output'),
    ...numbered([
      'The reviewer records the rejection and the reason in T10 (decision “Reject”) and in the Jira item.',
      'The AI operator classifies the cause: wrong or ambiguous input, missing or wrong context, prompt not followed, or genuine model error.',
      'Wrong input: return it to the previous stage owner. The previous gate is re-opened if needed.',
      'Missing or wrong context: raise T14 to fix the Context Pack, then regenerate.',
      'Prompt not followed or model error: correct manually or regenerate; note it in T11.',
      'The corrected output goes through the full verification again. It is never accepted on the strength of the previous review.',
      'Repeated rejections for the same cause are reported to the Council through the monthly metrics.'
    ]),
    H2('6.6  Evidence to retain'),
    table(['Evidence', 'Where it lives', 'Retention'], [
      ['AI Usage Declaration and assumption register (T11)', 'Attached to the artifact or the pull request', 'Life of the release + audit period'],
      ['Gate record (T10)', 'Jira gate transition + X01 Gate Log', 'Life of the product'],
      ['Pipeline results (L1)', 'Jenkins build linked from the pull request', 'Per Jenkins retention, linked from T10'],
      ['Review comments (L3)', 'Pull request or document comments', 'Life of the release'],
      ['Frozen RTM per release', 'X01, versioned with the release', 'Life of the product'],
      ['Waivers (T15)', 'Council folder + X01 Waiver Register', 'Life of the product']
    ], [3800, 3500, CW - 7300])
  ];
}

/* ======================= 7 CONTEXT PACK ======================= */
function sec7() {
  const prompt = ['ROLE:          You are a senior technical writer, Fixed Assets suite (internal web).',
    'CONTEXT:       Load /ai-context at CP v1.3. Treat every file as binding, not advisory.',
    'INPUT:         Requirement Register DEP-RR v1.0, requirements DEP-REQ-210 to DEP-REQ-218.',
    'TASK:          Write SFVD sections for these requirements\' screens, nothing else.',
    'CONSTRAINTS:   Use only fields in the data dictionary and IDs in CP-23, and only style',
    '               classes in CP-21. If something you need does not exist, list it under',
    '               OPEN QUESTIONS. Do not invent it.',
    'OUTPUT FORMAT: Fill template T02 sections 3 to 7 exactly.',
    'TRACEABILITY:  Put the REQ-ID against every screen, field and validation.',
    '               Stamp "CP v1.3, P-S2 v3" in the header.',
    'SELF-CHECK:    End with (a) standards applied, (b) reuse decisions, (c) ASSUMPTIONS,',
    '               (d) OPEN QUESTIONS. Never answer your own open questions.'];
  return [
    H1('7  Common Context Pack'),
    H2('7.1  Purpose and structure'),
    P('Consistent AI output is an input problem. If every developer gives AI the same standards, registries and examples, AI produces the same shape of output for everyone. The Context Pack is the single, versioned place where that shared input lives. Only the top layer, the task prompt and its approved input, differs from one person to another.'),
    ...X.figure(FIG('D9-context-layers'), 'Context layers: only the task prompt is personal', CW, { maxH: 330 }),
    H2('7.2  Files and owners'),
    table(['File', 'Content', 'Owner', 'Update trigger'], D.CONTEXT_PACK, [2900, 4100, 1300, CW - 8300], { boldCols: [0] }),
    P([['Starter versions of every file, with the sections each owner must complete, are provided in the ai-context folder of this package.', { italics: true, color: COL.muted }]]),
    H2('7.3  How the pack is loaded'),
    ...bullets([
      'The pack lives at /ai-context in the main repository, so it is versioned, reviewed and branched like code.',
      'AI-INSTRUCTIONS.md at the repository root states the binding rules and points to /ai-context. Each approved AI tool has a one-line pointer file in the location that tool reads automatically, so whichever approved tool is used loads the same rules.',
      'The current version is held in /ai-context/VERSION and is recorded in T11, in the pull request description and in every T10 gate record.',
      'Surface profiles are selected in the prompt (“profile: microservice”, “profile: mobile”, “profile: internal web”).'
    ]),
    H2('7.4  Change control'),
    ...numbered([
      'Anyone raises T14 describing the gap, with an example of the wrong AI output it causes.',
      'The file owner drafts the change as a pull request to /ai-context.',
      'Two approvals are required: the file owner and one Council member.',
      'On merge, VERSION is bumped (minor for additions, major for rule changes) and a short note goes to all three surface teams the same day.',
      'Target lead time from T14 to merge: five working days. Lead time is reported monthly.'
    ]),
    H2('7.5  Standard stage prompt structure'),
    P('Every prompt for a deliverable uses the eight blocks below. The stage templates in CP-50 pre-fill blocks 1, 2, 5, 6 and 8; the AI operator completes blocks 3, 4 and 7.'),
    table(['#', 'Block', 'Purpose'], [
      ['1', 'ROLE', 'Sets the perspective and the surface profile.'],
      ['2', 'CONTEXT', 'Names the Context Pack version; makes it binding.'],
      ['3', 'INPUT', 'Approved artifact IDs and versions — referenced, never retyped.'],
      ['4', 'TASK', 'One stage deliverable only.'],
      ['5', 'CONSTRAINTS', 'Reuse rules; what must not be created; what to do when something is missing.'],
      ['6', 'OUTPUT FORMAT', 'The template to fill, so review is mechanical.'],
      ['7', 'TRACEABILITY', 'IDs to stamp on every section; Context Pack and prompt version.'],
      ['8', 'SELF-CHECK', 'Standards applied, reuse decisions, assumptions, open questions. Non-negotiable.']
    ], [500, 1800, CW - 2300], { boldCols: [1], centerCols: [0] }),
    H3('Example: stage S2 prompt'),
    X.callout(null, prompt.map(l => new Paragraph({ style: 'Code', children: [run(l)] })), { color: COL.slate, fill: 'F4F7F8' })
  ];
}

/* ======================= 8 TRACEABILITY ======================= */
function sec8() {
  return [
    H1('8  Traceability and Identifiers'),
    H2('8.1  The traceability chain'),
    P('The requirement ID is the thread that ties every artifact together. It is what lets us prove coverage at audit, see the impact of a change before making it, and trace a defect back to the gate that missed it.'),
    ...X.figure(FIG('D8-traceability-chain'), 'The traceability chain and where each ID is recorded', CW),
    H2('8.2  ID conventions'),
    table(['Item', 'Format', 'Example'], D.ID_CONVENTIONS, [2000, 4800, CW - 6800], { boldCols: [0] }),
    H2('8.3  Where each ID must appear'),
    table(['ID', 'Must appear in'], [
      ['REQ-ID', 'T01 register, Jira story, SFVD screen and field rows, OpenAPI x-req-ids, branch name, commit message, test case, release note line'],
      ['CR ID', 'T04, Jira CR, revision note of each affected REQ, SFVD revision table, release note'],
      ['SR / BUG ID', 'T05 or T06, branch name, commit message, failing test name, release note'],
      ['Test case ID', 'T07, test management tool, automation script annotation, RTM'],
      ['Context Pack version', 'T11, pull request description, T10 gate record'],
      ['Prompt template version', 'T11']
    ], [2300, CW - 2300], { boldCols: [0] }),
    H2('8.4  Automated traceability checks'),
    ...bullets([
      'A commit-message check (Git hook and Jenkins stage) rejects commits without a valid ID.',
      'OpenAPI lint requires an x-req-ids tag on every new or changed operation.',
      'A nightly job rebuilds the RTM in X01 from Jira, Git and the test management tool, and flags requirements without code or passed tests.',
      'The release job fails if any requirement in scope lacks a passed test, or if the parity check does not reconcile.'
    ])
  ];
}

/* ======================= 9 ROLES + GOVERNANCE ======================= */
function sec9() {
  const raciW = [1700, ...Array(12).fill(Math.floor((CW - 1700) / 12))]; raciW[12] += (CW - raciW.reduce((a, b) => a + b, 0));
  const fills = D.STAGES.map(() => D.RACI_ROLES.map(() => null));
  const rows = D.STAGES.map((s, i) => [s.id + ' ' + s.short, ...D.RACI[s.id].map((v, j) => { if (v.includes('A')) fills[i][j + 1] = 'F8E6DF'; return v; })]);
  return [
    H1('9  Roles, Responsibilities and Governance'),
    H2('9.1  Roles'),
    table(['Role', 'Responsibilities in the AI SDLC'], D.ROLES, [2800, CW - 2800], { boldCols: [0] }),
    H2('9.2  RACI matrix'),
    P('R responsible, A accountable, C consulted, I informed. Accountable cells are shaded. PO Product Owner; BA Business Analyst; TW Technical Writer; ARC Architect; TL Tech Lead; DEV Developer; REV Reviewer; QA QA Lead / Engineer; REL Release Manager; OPS DevOps; SEC Security; DM Delivery Manager.'),
    table(['Stage', ...D.RACI_ROLES], rows, raciW, { boldCols: [0], centerCols: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], fills, zebra: false }),
    spacer(),
    callout('Separation of duties', ['The person who ran the AI prompt for an output is never the person who signs the L3 review or the gate for that output.'], { color: COL.rust, fill: 'FBF0EC' }),
    H2('9.3  AI Governance Council'),
    table(['Item', 'Definition'], [
      ['Members', 'Solution Architect (chair), QA Lead, Delivery Manager, Security Lead. Product Owner attends for scope or business-rule topics.'],
      ['Owns', 'This document, the Context Pack, gate thresholds, the approved AI tool list, waivers, audits and metrics.'],
      ['Weekly (30 minutes)', 'Open T14 and T15 items, gate exceptions, pilot feedback.'],
      ['Monthly', 'Drift audit: a 10% sample of AI-assisted merges scored against the T10 checklists. Metrics review (9.5).'],
      ['Quarterly', 'Refresh golden examples and prompt templates; review thresholds; retire stale context.'],
      ['Every release', 'RTM frozen; open waivers reviewed and cleared or renewed.']
    ], [2300, CW - 2300], { boldCols: [0] }),
    H2('9.4  Waivers and escalation'),
    ...bullets([
      'Any deviation from a rule or gate needs a T15 waiver: what is waived, why, the risk, the owner and an expiry no later than 90 days.',
      'Only the Council approves a waiver. Schedule pressure alone is not a reason.',
      'For a P1 incident the Delivery Manager and Architect may approve verbally; the T15 is completed within two working days.',
      'Waivers are logged in X01 and reviewed at every release.'
    ]),
    H2('9.5  Metrics'),
    table(['Metric', 'Definition', 'Target', 'Reviewed'], D.METRICS, [2600, 4100, 1500, CW - 8200], { boldCols: [0] }),
    P([['Baselines are measured in the first pilot month. Targets marked “trend” are judged on direction, not an absolute number.', { italics: true, color: COL.muted, size: 18 }]])
  ];
}

/* ======================= 10 SUPPORT DOCUMENTS ======================= */
function sec10intro() {
  return [
    H1('10  Support Documents and Templates', { newPage: false }),
    P('The process depends on a small set of documents. Templates T01 to T15 and the tracker workbook X01 are filled in manually, with AI drafting where the mode allows. The Context Pack files are reference documents that AI reads. The configuration artifacts make the tools enforce the process automatically.'),
  ];
}
function sec10land() {
  return [
    H2('10.1  Document lifecycle map', { newPage: false }),
    ...X.figure(FIG('D10-document-map'), 'Which document is produced, used and signed at each stage', CWL, { maxH: 390 }),
    H2('10.2  Templates register', { newPage: true }),
    table(['ID', 'Template', 'Purpose', 'Stage', 'Work types', 'Owner', 'How it is filled', 'File'],
      D.TEMPLATES.map(t => [t[0], t[1], t[2], t[3], t[4], t[5], [modeRuns(t[6], 18)], 'templates/' + (t[0] === 'X01' ? 'X01-AI-SDLC-Tracker.xlsx' : t[0] + '-*.docx')]),
      [650, 2350, 3600, 1200, 1500, 1500, 2200, CWL - 13000], { boldCols: [0, 1] })
  ];
}
function sec10b() {
  return [
    H2('10.3  Configuration artifacts', { newPage: false }),
    table(['Artifact', 'Where', 'What it enforces'], [
      ['Pull request template (T09 as markdown)', 'Repository: pull request template location for your Git host', 'Every PR carries the checklist, IDs, AI usage and Context Pack version'],
      ['Commit-message ID check', 'Git hook + Jenkins stage', 'No commit without a valid REQ, CR, SR or BUG ID'],
      ['Jenkins quality stages', 'Jenkinsfile', 'PMD, Checkstyle, Sonar gate, coverage, duplication, OpenAPI diff, secret scan, ID check'],
      ['Jenkins release stages', 'Release pipeline', 'RTM link check and parity check before promotion'],
      ['Jira configuration', 'Jira administration', 'Work types, custom fields (Work Type, Module, Severity, AI Usage, CP Version), gate statuses that require a T10 attachment'],
      ['Test management fields', 'Test management tool', 'REQ-ID link and automation flag on every case'],
      ['AI-INSTRUCTIONS.md and tool pointer files', 'Repository root', 'Every approved AI tool loads the same rules and Context Pack']
    ], [2900, 2900, CW - 5800], { boldCols: [0] }),
    H2('10.4  Storage, naming and versioning'),
    table(['Document', 'Location', 'File name', 'Versioning'], [
      ['T01, T02, T03, T07, T08', 'Document repository /<module>/<release>/', '<ID>_<Txx>_v<x.y> e.g. SFVD-DEP-07_T02_v2.1', 'Minor for edits; major at gate baseline'],
      ['T04, T05, T06', 'Attached to the Jira CR, SR or bug', '<CR/SR/BUG ID>_<Txx>', 'Single version, updated until closed'],
      ['T09', 'Pull request description', '—', 'Pull request history'],
      ['T10, T11', 'Jira gate transition; X01 logs', '<ID>_G<n>_T10, <ID>_T11', 'One per gate or AI use'],
      ['T12, T13', 'Release folder', 'REL-<version>_<Txx>', 'One per release'],
      ['T14, T15', 'Council folder; X01 registers', 'CPCR-<nnn>, WVR-<nnn>', 'One per request'],
      ['Context Pack', 'Git /ai-context', 'As in section 7.2', 'CP v<major>.<minor> in VERSION']
    ], [2200, 2700, 2800, CW - 7700], { boldCols: [0] })
  ];
}

/* ======================= 11 IMPLEMENTATION ======================= */
function sec11() {
  return [
    H1('11  Implementation'),
    P('The process is introduced in phases so delivery does not stop. Gates start in warning mode and become blocking only after the pilot has tuned them. The implementation deck that accompanies this document explains each step to the team.'),
    H2('11.1  Readiness checklist'),
    checklist([
      'This document approved by the AI Governance Council',
      'Council members named and the weekly slot booked',
      '/ai-context created; every CP file at v1.0 with owner sections completed',
      'AI-INSTRUCTIONS.md and the approved-tool pointer files committed',
      'Approved AI tool list and AI data rules published in CP-40',
      'Templates T01 to T15 published in the document repository',
      'X01 tracker created for each product line',
      'Jira issue types, fields and gate statuses configured',
      'Branch naming and commit-message ID check enabled',
      'Jenkins quality and release stages running in warning mode',
      'Test management tool has REQ-ID and automation-flag fields',
      'Pilot items chosen: one NF, one CR and one SR, covering all three surfaces between them',
      'Team trained: awareness session for all; hands-on session per role'
    ], { title: 'Ready to start the pilot when all are true', evidence: true }),
    H2('11.2  Roll-out phases'),
    table(['Phase', 'Weeks', 'Outcomes', 'Exit criterion'], [
      ['0 Mobilise', '1 – 2', 'Approve this document; form the Council; create /ai-context; publish templates', 'Readiness items 1 to 6 complete'],
      ['1 Foundation', '3 – 4', 'Context Pack v1.0; stage prompts; Jira, Git and Jenkins configured in warning mode; training', 'All readiness items complete'],
      ['2 Pilot', '5 – 8', 'One NF, one CR and one SR through the full process; weekly retrospective; Context Pack v1.1', 'Three pilots closed at G9 with complete evidence'],
      ['3 Enforce', '9 – 12', 'Gates blocking; all new work on the process; first monthly audit', 'Audit shows at least 90% checklist compliance'],
      ['4 Sustain', 'Ongoing', 'Quarterly refresh; metrics reviewed monthly', 'Metrics on target for two consecutive quarters']
    ], [1500, 900, 4600, CW - 7000], { boldCols: [0] }),
    H2('11.3  Jira workflow and gates'),
    table(['Jira status', 'Stage', 'Transition requires'], [
      ['Intake', 'S0', 'Work type, module, requester, severity (issues)'],
      ['Requirements', 'S1', 'G0 record; T04 for CRs; T06 for defects'],
      ['Specification', 'S2', 'G1 record (T10) attached'],
      ['Design', 'S3', 'G2 record; skipped for Minor CR and SR without contract change'],
      ['In development', 'S4', 'G3 record or approved skip'],
      ['In review', 'S5', 'Pull request linked; CI green (G4)'],
      ['Test design', 'S6 (sub-task)', 'Starts at G2; closes with G6 record'],
      ['In test', 'S7', 'G5 and G6 records'],
      ['Release ready', 'S8', 'G7 record; parity report'],
      ['Deployed', 'S9', 'G8 record; release note'],
      ['Closed', '—', 'G9 record; RTM frozen']
    ], [2300, 1600, CW - 3900], { boldCols: [0] })
  ];
}

/* ======================= APPENDICES ======================= */
function appA() {
  const ex = (title, intro, rows) => [H2(title), P(intro), table(['Stage', 'What happened', 'Artifact', 'Mode'], rows.map(r => [r[0], r[1], r[2], [modeRuns(r[3])]]), [800, 5300, 2100, CW - 8200], { centerCols: [0] })];
  return [
    H1('Appendix A  Worked Examples'),
    callout('Illustrative only', ['These examples show how the process is applied. IDs, counts and findings are illustrative, not records of real work.'], { color: COL.slate, fill: 'EEF3F5' }),
    ...ex('A.1  New feature: RFID scanning for physical verification (mobile)', 'Finance Operations want field staff to verify assets with handheld RFID readers instead of barcode scans.', [
      ['S0', 'Classified NF in the LBL module; mobile and verification service affected', 'Jira epic', 'M'],
      ['S1', 'AI drafted 14 requirements from a three-page note. Reconciliation removed 2 invented ones (offline photo upload) and added 1 missed (resume a partial scan). SME confirmed verification statuses.', 'LBL-REQ-101 to 114', 'AI-G → M'],
      ['S2', 'SFVD for six mobile screens. Registry lookup rejected three invented error codes; reuse of the shared scan component confirmed.', 'SFVD-LBL-04 v1.0', 'AI-G → M'],
      ['S3', 'New batch verification endpoint; OpenAPI diff showed an additive change only; offline sync queue approved.', 'T03, contract v1.4', 'AI-G → M'],
      ['S6', '61 cases drafted; 7 duplicates of existing regression removed; SME verified discrepancy rules.', 'T07, T08', 'AI-G → M'],
      ['S4–S5', 'Five pull requests under 400 lines. Reviewer rejected a new date utility that duplicated an existing validator.', 'T09', 'AI-G → M'],
      ['S7–S9', 'Parity: 54 automated + 7 manual = 61 approved. Released, smoke passed, RTM frozen.', 'T12, T13', 'AUTO + M']
    ]),
    ...ex('A.2  Change request: daily pro-rata depreciation for mid-year additions', 'CR-2026-031 changes the written-down-value calculation so additions are depreciated from the day they are put to use.', [
      ['S0–S1', 'AI searched the RTM and code; Architect confirmed impact on DEP-REQ-214, SFVD-DEP-07 section 4.2 and the calculation engine. Classified Major (financial calculation). Finance approved prospective application.', 'T04', 'M + AI-A'],
      ['S2', 'SFVD section 4.2 updated with change marks; v2.0 to v2.1; DEP-REQ-214 revised to .r2.', 'T02 delta', 'AI-G → M'],
      ['S6', 'AI proposed 38 regression cases from the RTM; QA Lead added month-end close. SME hand-calculated three scenarios, including a leap-year addition.', 'T07', 'AI-G + AI-A → M'],
      ['S4–S9', 'Code change reviewed for backward compatibility; regression passed; released as a minor version.', 'T09, T12', 'AI-G → M']
    ]),
    ...ex('A.3  Defect (P2): duplicate depreciation entries for transferred assets', 'BUG-DEP-118: assets transferred mid-month received two depreciation postings.', [
      ['S0', 'Triage reproduced the defect; severity P2 (financial misstatement contained before close).', 'T05', 'M + AI-A'],
      ['S1', 'Manual RCA: the transfer event consumer was not idempotent. Gate missed: S6 had no transfer-within-period case.', 'T06', 'AI-X'],
      ['S4–S5', 'Failing test committed first; fix written manually; two engineers and the Architect reviewed.', 'T09', 'M'],
      ['S8–S9', 'Hotfix release with targeted and regression tests. Preventive actions: idempotency rule added to CP-10, transfer pattern added to CP-30 via T14.', 'T12, T14', 'M']
    ]),
    ...ex('A.4  Service request: correct useful life for 42 assets', 'SR-2026-00412: 42 assets in the class “Computers” were registered with the wrong useful life.', [
      ['S0', 'Classified as a data-correction SR. Changes future depreciation, so it is a financial-value change.', 'T05 Part A', 'M'],
      ['S4', 'Script written manually (AI-X because it changes financial values), with a rollback script.', 'T05 Part C', 'AI-X'],
      ['S5', 'Two reviewers; dry run on a production-like copy; before and after extracts compared.', 'T05 Part D', 'M'],
      ['S9', 'Executed by an authorised admin under a change record; next depreciation run verified with Finance.', 'T05 Part E', 'M']
    ])
  ];
}
function appB() {
  const rows = D.STAGES.map(s => {
    const ai = s.activities.filter(a => a[2] === 'AG' || a[2] === 'AA').map(a => a[0].split(':')[0].replace(/^Generate (the )?/, '')).slice(0, 1).join('');
    return [s.id + ' ' + s.short, ai ? ai.charAt(0).toUpperCase() + ai.slice(1) : '—', s.checklist.slice(0, 3).map(c => new Paragraph({ numbering: { reference: 'bul', level: 0 }, children: [run(c, { size: 18 })], spacing: { after: 20 } })), s.gate + ' · ' + s.raci.A];
  });
  return [
    H1('Appendix B  Quick Reference Card'),
    P('One line per stage: what AI produces, the three checks most often missed, and who signs the gate. Print it and keep it next to the screen.'),
    table(['Stage', 'AI produces', 'Top three human checks', 'Gate · signs'], rows, [1500, 2600, 3900, CW - 8000], { boldCols: [0] })
  ];
}

/* ======================= ASSEMBLE ======================= */
(async () => {
  X.resetFig();
  const hdr = X.header(A.DOC_ID, A.TITLE), ftr = X.footer('Internal · Version 1.0 Draft');
  const hdrL = X.header(A.DOC_ID, A.TITLE, CWL), ftrL = X.footer('Internal · Version 1.0 Draft', CWL);
  const sec = (children, layout = 'portrait', o = {}) => ({ properties: { ...X[layout], ...(o.props || {}) }, headers: o.bare ? undefined : { default: layout === 'landscape' ? hdrL : hdr }, footers: o.bare ? undefined : { default: layout === 'landscape' ? ftrL : ftr }, children });
  const doc = new Document({
    creator: 'Solution Architect', title: A.TITLE, description: 'AI SDLC process definition for the Fixed Assets suite',
    styles: X.styles, numbering: X.numbering, features: { updateFields: true },
    sections: [
      sec(A.cover(), 'portrait', { bare: true }),
      sec([...A.control(), ...A.sec1(), ...A.sec2(), ...A.sec3(), ...B.sec4(), ...B.sec5a()]),
      sec(B.landscapeFig('D4-flow-new-feature', 'New feature swimlane: roles, stages, modes and gates'), 'landscape'),
      sec(B.sec5b()),
      sec(B.landscapeFig('D5-flow-change-request', 'Change request swimlane: impact analysis first, then delta stages'), 'landscape'),
      sec([...B.sec5c(), ...B.sec5d(), ...sec6(), ...sec7(), ...sec8(), ...sec9()]),
      sec([...sec10intro(), ...sec10land()], 'landscape'),
      sec([...sec10b(), ...sec11(), ...appA(), ...appB()])
    ]
  });
  const out = path.join(__dirname, '..', 'AI-SDLC-Process-Definition.docx');
  fs.writeFileSync(out, await X.pack(doc));
  console.log('written', out);
})();
