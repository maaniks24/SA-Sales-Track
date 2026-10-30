/* Builds AI-SDLC-Process-Definition.docx */
const fs = require('fs'); const path = require('path');
const X = require('./docx_lib'); const D = require('./process_data');
const { d, COL, CW, CWL, run, runs, P, H1, H2, H3, bullets, numbered, spacer, table, checklist, callout, formGrid, signoff, figure, placeholder } = X;
const { Paragraph, AlignmentType, TableOfContents } = d;
const FIG = n => path.join(__dirname, '..', 'diagrams', n + '.png');
const DOC_ID = 'PD-AISDLC-01', TITLE = 'AI-Augmented SDLC Process Definition';

/* colour each mode code inside a string such as "AI-G → M" */
function modeRuns(s, size = 19) {
  return s.split(/(AI-G\*?|AI-A|AI-X|AUTO|\bM\b)/).filter(Boolean).map(t => {
    const m = X.MODE[t.replace('*', '')]; return m ? run(t, { bold: true, color: m[0], size }) : run(t, { size, color: COL.text });
  });
}
const tag = code => { const c = X.CODE[code] || code; const m = X.MODE[c]; return run(c, { bold: true, color: m[0] }); };
const techName = id => D.TECHNIQUES.find(t => t[0] === id)[1];

/* ======================= COVER + CONTROL ======================= */
function cover() {
  return [
    spacer(1600),
    P([['AI-AUGMENTED SDLC', { bold: true, color: COL.teal, size: 24, characterSpacing: 40 }]], { spacing: { after: 120 } }),
    P([['Process Definition', { font: 'Cambria', bold: true, size: 64, color: COL.ink }]], { spacing: { after: 160 } }),
    P([['Stages, inputs and outputs, manual and AI responsibilities, validation of AI output, and the process flows for new features, change requests, and issue fixes and service requests.', { size: 24, color: COL.muted }]], { spacing: { after: 600 } }),
    formGrid([
      ['Document ID', DOC_ID], ['Version', '1.0 — Draft for review'], ['Product', 'Fixed Assets Suite: web application with microservices, mobile application, internal web applications'],
      ['Modules', 'Asset master, depreciation, labelling and tracking, data validation and audit'], ['Owner', 'Solution Architect'],
      ['Approval body', 'AI Governance Council'], ['Status', 'Draft — pending Council approval'], ['Date', '30 October 2026'], ['Classification', 'Internal']
    ]),
    spacer(400),
    callout('How to read this document', [
      'Sections 1 to 3 explain the principles and the overall flow. Section 4 defines each stage in detail. Section 5 gives the three process flows by work type. Sections 6 to 8 describe how AI output is validated, the shared Context Pack and traceability. Sections 9 to 11 cover roles, governance, the templates and how to implement the process.'
    ], { color: COL.teal, fill: 'EAF5F6' })
  ];
}
function control() {
  return [
    H1('Document control', { newPage: false }),
    H3('Version history'),
    table(['Version', 'Date', 'Author', 'Summary of change'], [['0.1', '16 Oct 2026', 'Solution Architect', 'Framework outline presented to the team'], ['1.0', '30 Oct 2026', 'Solution Architect', 'Full process definition, templates and Context Pack structure'], ['', '', '', ''], ['', '', '', '']], [1300, 1700, 2200, CW - 5200]),
    spacer(), H3('Approvals'),
    signoff(['Solution Architect (owner)', 'QA Lead', 'Delivery Manager', 'Security Lead', 'Product Owner']),
    spacer(), H3('Related documents'),
    table(['ID', 'Document', 'Relationship'], [
      ['T01 – T15', 'Process templates (templates folder)', 'Filled in at the stages defined in section 4'],
      ['X01', 'AI SDLC Tracker Workbook', 'RTM, gate log, AI usage log, waiver register'],
      ['/ai-context', 'Common Context Pack (CP-00 to CP-99)', 'Loaded by every AI step; section 7'],
      ['Session deck', 'AI-SDLC Implementation deck', 'Explains this process and its roll-out to the team']
    ], [1500, 3800, CW - 5300]),
    new Paragraph({ children: [], pageBreakBefore: true }),
    P([['Contents', { font: 'Cambria', bold: true, size: 34, color: COL.ink }]], { spacing: { after: 160 } }),
    new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-2' }),
    P([['If the contents list is empty, right-click it in Word and choose Update Field.', { italics: true, size: 17, color: COL.muted }]], { spacing: { before: 120 } })
  ];
}

/* ======================= 1 INTRODUCTION ======================= */
function sec1() {
  return [
    H1('1  Introduction'),
    H2('1.1  Purpose'),
    P('Developers across the Fixed Assets suite now use AI to draft requirements, documents, code, tests and release material. AI makes first drafts fast, but it also makes it easy to skip the steps that kept the product consistent: signed requirement documents, coding and naming standards checked by PMD and Sonar, a fixed project structure with shared base classes, written test scenarios, Jira traceability and Jenkins-controlled releases.'),
    P('This document defines one process that keeps the speed and restores the discipline. For every stage it states what goes in, what comes out, which work is manual and which is AI-generated or AI-assisted, how AI output is proven valid, and who signs the gate before the output becomes the next stage’s input.'),
    H2('1.2  Scope'),
    table(['In scope', 'Out of scope'], [
      [[run('All three product surfaces: web application with microservices, mobile application, internal web applications')], [run('Selection and procurement of AI tools (owned by the Council and IT, recorded in CP-40)')]],
      [[run('All work types: new applications and features, enhancements and change requests, issue fixes and service requests')], [run('Infrastructure provisioning and platform operations not delivered through the product pipeline')]],
      [[run('All SDLC stages from intake to production closure, and the feedback loop')], [run('Commercial, contractual and HR processes')]],
      [[run('Every person who creates, reviews or approves a product artifact, whether or not they use AI')], [run('Personal productivity use of AI that produces no product artifact')]]
    ], [CW / 2, CW / 2]),
    H2('1.3  Audience and how to use this document'),
    table(['If you are…', 'Read first', 'Then use'], [
      ['Product Owner or Business Analyst', 'Sections 2, 3, 4.1 to 4.3, 5', 'T01, T04, T10, T11'],
      ['Technical Writer', 'Sections 2, 4.3, 6, 7', 'T02, T10, T11'],
      ['Architect or Tech Lead', 'All sections; you own sections 3, 7 and 9', 'T03, T04, T09, T10, T14'],
      ['Developer', 'Sections 2, 4.5, 4.6, 5.3, 6, 7, 8', 'T09, T11, Context Pack'],
      ['QA or Automation Engineer', 'Sections 2, 4.7, 4.8, 6', 'T07, T08, T10, T11'],
      ['Release Manager or DevOps', 'Sections 4.9, 4.10, 5.3', 'T12, T13, T10'],
      ['Delivery Manager or Council member', 'Sections 2, 3, 9, 10, 11', 'X01, T15']
    ], [3000, 3600, CW - 6600], { boldCols: [0] }),
    H2('1.4  Definitions and abbreviations'),
    table(['Term', 'Meaning'], [
      ['AI operator', 'The person who runs an AI prompt and is accountable for its output until it is reviewed.'],
      ['AI-G / AI-A / AI-X', 'AI-Generated, AI-Assisted, AI Not Permitted. See section 2.2.'],
      ['Context Pack (CP)', 'The versioned folder /ai-context holding the standards, registries, templates and examples that every AI prompt loads. Section 7.'],
      ['CR', 'Change Request: a change to behaviour that is already baselined.'],
      ['Gate (G0 to G9)', 'The recorded decision that closes a stage. A stage output becomes the next stage input only after its gate.'],
      ['Golden example', 'A reviewed reference implementation for a surface that AI is told to imitate (CP-99).'],
      ['NBV, SLM, WDV, CWIP', 'Net book value; straight-line method; written-down value; capital work in progress.'],
      ['NF', 'New application or new feature.'],
      ['Parity check', 'The automated comparison that approved test cases equal executed plus automated plus formally deferred cases.'],
      ['RCA', 'Root Cause Analysis (T06).'],
      ['RTM', 'Requirement Traceability Matrix, held in X01.'],
      ['SFVD', 'The screens, fields, validations and data document (T02) that development and testing both work from.'],
      ['SME', 'Subject-matter expert, here usually a fixed-asset accounting expert.'],
      ['SR', 'Issue fix or service request: a defect, or an operational change to data, configuration or access.']
    ], [2600, CW - 2600], { boldCols: [0] })
  ];
}

/* ======================= 2 PRINCIPLES / MODES / PERMISSIONS ======================= */
function sec2() {
  return [
    H1('2  Principles, Process Modes and AI Permissions'),
    H2('2.1  Principles'),
    ...numbered([
      [['AI drafts, a person decides, the gate records. ', { bold: true }], 'AI output is never a deliverable as generated. It becomes one only when a named reviewer accepts it and the gate is recorded in T10.'],
      [['Context is shared, never personal. ', { bold: true }], 'Standards, structure, shared libraries, style classes, registries and test data live in one versioned Context Pack that every prompt loads.'],
      [['Nothing moves without an ID. ', { bold: true }], 'Every artifact, commit, test case and defect carries its requirement, CR or SR ID. If it is not linked it does not ship.'],
      [['Reuse before create. ', { bold: true }], 'A new utility, base method, style class, validation ID or service is justified in writing, or it is not created.'],
      [['Evidence or it did not happen. ', { bold: true }], 'A gate passes only with a recorded artifact: checklist, scan result, approval. Verbal sign-off is not a gate.']
    ]),
    H2('2.2  Process modes'),
    P('Every input, activity and output in this document is tagged with one mode. The tag tells you who produces it and how much verification it needs.'),
    table(['Mode', 'Name', 'Meaning', 'Verification required'], Object.values(D.MODES).map(m => [m.code, m.name, m.desc,
      { 'M': 'Role checklist and gate (L2, L4)', 'AI-G': 'All four levels (L1 to L4) and the universal checklist in 6.3', 'AI-A': 'The person confirms every AI suggestion before acting on it', 'AUTO': 'Result attached to the gate as evidence', 'AI-X': 'Not applicable: AI must not be used' }[m.code]]),
      [900, 1500, 4300, CW - 6700], { modeCols: [0], boldCols: [1] }),
    spacer(),
    callout('A combined tag such as “AI-G → M”', ['means AI generates the draft and a person then validates, completes and owns it. The output is only usable after the person’s step.'], { color: COL.teal, fill: 'EAF5F6' }),
    H2('2.3  What AI may and may not do'),
    table(['AI-Generated, then validated (AI-G)', 'AI-Assisted only (AI-A)', 'AI not permitted (AI-X)'],
      [[bulletsCell(D.AI_PERMISSIONS.AG), bulletsCell(D.AI_PERMISSIONS.AA), bulletsCell(D.AI_PERMISSIONS.NA)]], [3100, 3000, CW - 6100], { zebra: false,
        fills: [[X.MODE['AI-G'][1], X.MODE['AI-A'][1], X.MODE['AI-X'][1]]] }),
    H2('2.4  Rules for every AI interaction'),
    ...bullets([
      'Use only AI tools on the approved list in CP-40, through company accounts.',
      'Never put production personal data, financial records, credentials or secrets into a prompt. Use seed data from CP-31.',
      'Start from the approved, versioned input of the previous stage, never from memory or an unapproved draft.',
      'Use the stage prompt template from CP-50. Do not combine two stages in one prompt.',
      'Record every AI-G use in T11: tool, prompt template and version, Context Pack version, sections generated, assumptions.',
      'You own what AI produces for you. “The AI generated it” is not accepted at review.',
      'If AI repeatedly gets something wrong, raise a Context Pack change (T14); do not just fix your own copy.'
    ])
  ];
}
function bulletsCell(items) { return items.map(t => new Paragraph({ numbering: { reference: 'bul', level: 0 }, children: [run(t, { size: 19 })], spacing: { after: 40 } })); }

/* ======================= 3 PROCESS OVERVIEW ======================= */
function sec3() {
  const sum = D.STAGES.map(s => {
    const out = s.outputs[0]; return [s.id + '  ' + s.name, s.inputs[0][0], out[0] + ' (' + out[1] + ')', [modeRuns((X.CODE[out[2]] || out[2]) + (out[2] === 'AG' ? ' → M' : ''))], s.gate, s.raci.A];
  });
  const rules = [
    ['Does the capability exist in the baselined product?', 'No', 'NF: new feature or application'],
    ['Does baselined behaviour, a rule, a screen, a report or an interface need to change on purpose?', 'Yes', 'CR: change request'],
    ['Does the product behave differently from the baselined SFVD or requirement?', 'Yes', 'SR: defect fix'],
    ['Is the request to change data, configuration or access with no code change?', 'Yes', 'SR: service request'],
    ['A “defect” where the product matches the SFVD but the business now wants something else', '—', 'Re-route as CR'],
    ['A “service request” that turns out to need code', '—', 'Re-route as CR or defect']
  ];
  return [
    H1('3  Process Overview'),
    H2('3.1  The master flow'),
    P('Ten stages take every piece of work from intake to a closed, audited release. Requirements, SFVD and design are sequential; test design (S6) runs in parallel with design and development from the moment the SFVD is baselined; both tracks converge at test execution (S7).'),
    ...figure(FIG('D1-master-flow'), 'Master AI SDLC flow: stages, gates and modes', CW, { maxH: 620 }),
    H2('3.2  Anatomy of a stage'),
    P('Every stage runs the same loop. Learning this loop once is enough to work in any stage.'),
    ...figure(FIG('D2-stage-anatomy'), 'The loop every stage follows, including rejection and context-gap handling', CW),
    ...numbered([
      [['Approved input. ', { bold: true }], 'Only the signed output of the previous gate, identified by ID and version.'],
      [['Context and prompt. ', { bold: true }], 'The current Context Pack version and the stage prompt template from CP-50.'],
      [['AI draft. ', { bold: true }], 'AI produces the output in the standard template and lists every assumption and open question.'],
      [['Validate. ', { bold: true }], 'L1 automated checks, L2 role checklist, L3 independent review (section 6).'],
      [['Gate sign-off. ', { bold: true }], 'L4: the gate owner records the decision in T10. The output is baselined and released to the next stage.']
    ]),
    P('If the output is rejected, the reason is recorded and the stage repeats. If the cause is missing or wrong context, the AI operator also raises a Context Pack change (T14) so the same error is not generated for anyone else.'),
    H2('3.3  Stage summary'),
    table(['Stage', 'Key input', 'Key output', 'Output mode', 'Gate', 'Accountable'], sum, [2050, 2000, 2350, 1150, 650, CW - 8200], { boldCols: [0] }),
    H2('3.4  Work-type classification and routing'),
    P('Every work item is classified at intake (S0) into one of three work types. The work type decides which stages apply and in what depth. Classification is a manual decision: AI may summarise the request but must not classify it.'),
    ...figure(FIG('D3-work-type-routing'), 'Classifying a work item and routing it to its process path', CW, { maxH: 560 }),
    table(['Question asked at intake', 'Answer', 'Classify as'], rules, [5200, 1000, CW - 6200], { boldCols: [2], boldColor: COL.teal }),
    H2('3.5  Tailoring by work type'),
    P('All stages exist for all work types, but the depth differs. Full means the stage runs as defined in section 4. Delta means only the affected parts are produced or updated. Conditional means the stage runs only when the stated trigger applies. Light means a reduced form defined in section 5.'),
    table(['Stage', 'New feature', 'Change request', 'Issue / SR', 'Notes for CR', 'Notes for Issue / SR'],
      D.TAILORING.map(r => [r[0] + ' ' + D.STAGES.find(s => s.id === r[0]).short, D.TAILOR_KEY[r[1]], D.TAILOR_KEY[r[2]], D.TAILOR_KEY[r[3]], r[5], r[6]]),
      [1500, 1100, 1150, 1050, 2400, CW - 7200], { boldCols: [0], centerCols: [1, 2, 3] })
  ];
}
module.exports = { cover, control, sec1, sec2, sec3, modeRuns, tag, techName, bulletsCell, FIG, DOC_ID, TITLE };
