const X = require('./docx_lib'); const D = require('./process_data'); const A = require('./build_process_doc');
const { d, COL, CW, CWL, run, P, H1, H2, H3, bullets, numbered, spacer, table, checklist, callout } = X;
const { modeRuns, FIG, techName } = A;
const { Paragraph } = d;
const MC = c => X.CODE[c] || c;
const modeArrow = c => c === 'AG' ? 'AI-G → M' : c === 'AA' ? 'AI-A → M' : MC(c);

/* ======================= 4 STAGE DEFINITIONS ======================= */
function stageSection(s, i) {
  const raciRow = [[run('R  ', { bold: true, color: COL.teal }), run(s.raci.R)], [run('A  ', { bold: true, color: COL.rust }), run(s.raci.A)],
    [run('C  ', { bold: true, color: COL.slate }), run(s.raci.C)], [run('I  ', { bold: true, color: COL.muted }), run(s.raci.I)]];
  return [
    H2(`4.${i + 1}  ${s.id}  ${s.name}`, { newPage: i > 0 }),
    P([['Purpose. ', { bold: true, color: COL.ink }], s.purpose]),
    P([['Entry criteria. ', { bold: true, color: COL.ink }], s.entry.join('. ') + '.']),
    H3('Inputs'),
    table(['Input', 'Source / template', 'Prepared by', 'Mode'], s.inputs.map(r => [r[0], r[1], r[2], MC(r[3])]), [4200, 2500, 1900, CW - 8600], { modeCols: [3] }),
    H3('Activities'),
    table(['#', 'Activity', 'Performed by', 'Mode'], s.activities.map((r, k) => [String(k + 1), r[0], r[1], MC(r[2])]), [450, 5700, 2350, CW - 8500], { modeCols: [3], centerCols: [0] }),
    H3('Outputs'),
    table(['Output', 'Template / location', 'Mode', 'Owner'], s.outputs.map(r => [r[0], r[1], [modeRuns(modeArrow(r[2]))], r[3]]), [3900, 2500, 1300, CW - 7700]),
    H3('How the AI output is validated'),
    table(['Level', 'What is applied in this stage'], [
      [[run('L1 Automated', { bold: true, color: COL.slate })], s.auto.join('; ') + '.'],
      [[run('L2 + L3 Techniques', { bold: true, color: COL.teal })], s.techniques.map(t => t + ' ' + techName(t)).join(', ') + ' (section 6.2).'],
      [[run('How to apply', { bold: true, color: COL.rust })], s.validationNote],
      [[run('L4 Sign-off', { bold: true, color: COL.amber })], 'Gate ' + s.gate + ' recorded in T10 by ' + s.raci.A + '.']
    ], [2100, CW - 2100], { zebra: true }),
    H3('Manual review checklist (gate ' + s.gate + ')'),
    checklist(s.checklist, { title: 'Reviewer confirms' }),
    spacer(80),
    callout('Exit gate ' + s.gate, [s.gateText, [run('AI rule: ', { bold: true, color: COL.red }), run(s.aiRule)]]),
    spacer(80),
    table(null, [raciRow], [CW / 4, CW / 4, CW / 4, CW / 4], { zebra: false })
  ];
}
function sec4() {
  return [
    H1('4  Stage Definitions'),
    P('Each stage below follows the same structure: purpose and entry criteria; the inputs AI receives and how each is prepared; the activities with their mode; the outputs and their templates; how AI output is validated at each verification level; the manual review checklist that the gate owner signs in T10; the exit gate and AI rule; and the RACI.'),
    P('The checklists here are reproduced as fillable forms in T10 and as CP-60 in the Context Pack, so AI can self-check against the same list before a person reviews.'),
    ...D.STAGES.flatMap((s, i) => stageSection(s, i))
  ];
}

/* ======================= 5 FLOWS BY WORK TYPE ======================= */
const stepHdr = ['#', 'Stage', 'Activity', 'Who', 'Mode', 'Output', 'Gate'];
const stepW = [400, 650, 3150, 1550, 1250, 1950, CW - 8950];
const steps = rows => table(stepHdr, rows.map((r, i) => [String(i + 1), r[0], r[1], r[2], [modeRuns(r[3])], r[4], r[5] || '']), stepW, { centerCols: [0, 1, 6] });

function sec5a() {
  return [
    H1('5  Process Flows by Work Type'),
    P('This section gives the end-to-end flow for each work type. Figures 4 and 5 are swimlane diagrams: lanes are roles, columns are stages, colours are modes and the amber badges are gates. Figure 6 is a flowchart because the issue and service-request path branches twice.'),
    H2('5.1  New application or new feature (NF)'),
    P([['When. ', { bold: true }], D.WORK_TYPES.NF.when + ' Examples: ' + D.WORK_TYPES.NF.examples.join('; ') + '.']),
    P('All ten stages run in full. The flow diagram is on the next page.')
  ];
}
function landscapeFig(file, caption) { return [...X.figure(FIG(file), caption, CWL, { maxH: 600 })]; }
function sec5b() {
  return [
    H3('Step-by-step: new feature'),
    steps([
      ['S0', 'Raise the need with review points', 'Business', 'M', 'T01 Part A'],
      ['S0', 'Intake and classify as NF; register module prefix if new', 'BA', 'M + AI-A', 'Jira item', 'G0'],
      ['S1', 'Draft register, reconcile, resolve open questions', 'BA', 'AI-G → M', 'T01, T11'],
      ['S1', 'Approve register; freeze REQ-IDs', 'Product Owner', 'M', 'T10', 'G1'],
      ['S2', 'Draft SFVD, verify fields and registry IDs', 'Tech Writer', 'AI-G → M', 'T02, T11', 'G2'],
      ['S3', 'Draft design and contract; architecture, DB and security review', 'Tech Lead, Architect', 'AI-G → M', 'T03', 'G3'],
      ['S6', 'Draft test cases and data; SME verification (starts at G2)', 'QA', 'AI-G → M', 'T07, T08', 'G6'],
      ['S4', 'Generate code and tests; self-review; pull request', 'Developer', 'AI-G → M', 'T09, T11', 'G4'],
      ['S5', 'Independent code review', 'Reviewer', 'M + AI-A', 'Merged PR', 'G5'],
      ['S7', 'Automate and execute; parity check', 'QA, Automation', 'AI-G → M + AUTO', 'Parity report', 'G7'],
      ['S8', 'Package, release notes, runbook', 'Release Manager', 'AI-G → M', 'T12, T13', 'G8'],
      ['S9', 'Deploy, smoke, monitor, business sign-off', 'DevOps, QA, PO', 'M + AUTO', 'T13, T10', 'G9']
    ]),
    H3('Rules specific to new features'),
    ...bullets([
      'A new module gets its prefix registered in CP-00 before S1 starts, so IDs are valid from the first requirement.',
      'The first feature on a new surface or service creates that surface’s golden example (CP-99) during S3 and S4. The Architect reviews it; later features imitate it.',
      'Any new shared component, validator or style class is added to CP-20, CP-21 or CP-23 in the same release, through T14.',
      'Architecture spikes may use AI freely, but spike code is never merged. Findings are recorded in T03.',
      'Non-functional baselines are fixed at S1: asset volumes, depreciation run window, month-end close time, mobile offline duration.'
    ]),
    H2('5.2  Enhancement or change request (CR)', { newPage: true }),
    P([['When. ', { bold: true }], D.WORK_TYPES.CR.when + ' Examples: ' + D.WORK_TYPES.CR.examples.join('; ') + '.']),
    P('A CR starts with an impact analysis (T04) instead of a fresh requirement register. Documents are updated as deltas, and regression testing is selected from the RTM. The flow diagram is on the next page.'),
    H3('CR classification'),
    table(['Class', 'Criteria (any one is enough for Major)', 'Effect on the flow'], [
      ['Minor', 'No contract or schema change; one surface; estimated at five working days or fewer', 'S3 not run; design notes recorded in T04 section 6. S6 and S7 delta.'],
      ['Major', 'Contract or schema change; more than one surface; more than five working days; any change to a financial calculation', 'S3 run in full with contract versioning and migration review. SME re-derivation mandatory at S6.']
    ], [1100, 4300, CW - 5400], { boldCols: [0] })
  ];
}
function sec5c() {
  return [
    H3('Step-by-step: change request'),
    steps([
      ['S0', 'Raise CR; link to the baselined REQ-IDs and SFVD version', 'Requester, BA', 'M + AI-A', 'Jira CR', 'G0'],
      ['S1', 'Impact analysis: AI searches RTM and code; Architect confirms each item', 'Architect, BA', 'M + AI-A', 'T04'],
      ['S1', 'Approve scope, effort, impact and CR class', 'Product Owner', 'M', 'T04, T10', 'G1'],
      ['S2', 'Update affected SFVD sections with change marks; bump version', 'Tech Writer', 'AI-G → M', 'T02 delta, T11', 'G2'],
      ['S3', 'Major CR only: design delta, contract version, migration', 'Tech Lead, Architect', 'AI-G → M', 'T03', 'G3'],
      ['S6', 'New cases + regression selection proposed from RTM; QA Lead confirms', 'QA', 'AI-G + AI-A → M', 'T07, T08', 'G6'],
      ['S4', 'Code change and unit tests', 'Developer', 'AI-G → M', 'T09, T11', 'G4'],
      ['S5', 'Review including backward compatibility', 'Reviewer', 'M + AI-A', 'Merged PR', 'G5'],
      ['S7', 'Execute new and impacted regression; parity', 'QA', 'AI-G → M + AUTO', 'Parity report', 'G7'],
      ['S8', 'Version bump, release notes listing the CR', 'Release Manager', 'AI-G → M', 'T12', 'G8'],
      ['S9', 'Deploy, smoke, business acceptance', 'DevOps, PO', 'M + AUTO', 'T13, T10', 'G9']
    ]),
    H3('Rules specific to change requests'),
    ...bullets([
      'No CR is approved without a completed T04. AI may search the RTM and code for impact, but the Architect confirms every impacted item.',
      'A changed requirement keeps its ID with a revision suffix (DEP-REQ-214.r2). New behaviour gets a new ID. Retired requirements are marked retired, never deleted.',
      'The SFVD is updated in place with change marks and a minor version bump; the revision table lists the CR ID and changed sections.',
      'Regression selection: AI proposes impacted cases from the RTM and the changed files; the QA Lead confirms. The minimum is impacted cases plus smoke plus the critical-path pack (depreciation run, month-end close, label print, verification sync).',
      'Mobile apps in the field cannot all be updated at once. APIs must keep serving the previous mobile release (N-1) until the Council retires it.',
      'For changed financial rules, the PO and Finance decide whether the change is prospective or retrospective. A retrospective change needs Finance approval recorded in T04.'
    ])
  ];
}
function sec5d() {
  const sevW = [1250, 2700, 1350, 2150, 1100, CW - 8550];
  return [
    H2('5.3  Issue fix or service request (SR)', { newPage: true }),
    P([['When. ', { bold: true }], D.WORK_TYPES.SR.when + ' Examples: ' + D.WORK_TYPES.SR.examples.join('; ') + '.']),
    P('Triage (T05) decides whether a code change is needed. If not, the request follows the service-request track: a scripted, reviewed and reversible change. If code is needed it is a defect: the root cause is always analysed manually, and severity decides whether AI may help with the fix.'),
    ...X.figure(FIG('D6-flow-issue-sr'), 'Issue fix and service request flow', CW, { maxH: 860 }),
    H3('Severity and AI permission'),
    table(['Severity', 'Definition', 'Response', 'AI permission', 'Review', 'Release path'], D.SEVERITY, sevW, { boldCols: [0], boldColor: COL.red }),
    H3('Service request types'),
    table(['Type', 'Examples', 'Controls'], D.SR_TYPES, [1900, 3300, CW - 5200], { boldCols: [0] }),
    H3('Step-by-step: defect fix'),
    steps([
      ['S0', 'Triage: reproduce, classify, provisional severity', 'Triage Lead', 'M + AI-A', 'T05', 'G0'],
      ['S4', 'Write the failing test that reproduces the defect', 'Developer', 'M', 'Test in branch'],
      ['S1', 'Root cause analysis: cause, why not caught, gate missed', 'Developer, Tech Lead', 'AI-X', 'T06'],
      ['S1', 'Approve RCA; confirm severity and AI permission', 'Tech Lead (Architect for P1/P2)', 'M', 'T06, T10', 'G1'],
      ['S2', 'Update SFVD only if designed behaviour changes', 'Tech Writer', 'AI-G → M', 'T02 delta'],
      ['S4', 'Fix: P1/P2 manual only; P3/P4 AI-G allowed', 'Developer', 'AI-X / AI-G → M', 'T09, T11', 'G4'],
      ['S5', 'Review: two engineers + Architect for P1/P2', 'Reviewers', 'M', 'Merged PR', 'G5'],
      ['S7', 'Failing test passes; targeted + regression pack', 'QA', 'AUTO + M', 'Report', 'G7'],
      ['S8', 'Hotfix (P1/P2) or scheduled release (P3/P4)', 'Release Manager', 'AI-G → M', 'T12', 'G8'],
      ['S9', 'Deploy, smoke, extended monitoring; close', 'DevOps, QA', 'M + AUTO', 'T13, T10', 'G9']
    ]),
    H3('Step-by-step: service request'),
    steps([
      ['S0', 'Triage and classify SR type', 'Triage Lead', 'M + AI-A', 'T05 Part A', 'G0'],
      ['S4', 'Prepare scripted, reversible change with rollback', 'Developer / Admin', 'M or AI-G → M', 'T05 Part C'],
      ['S5', 'Peer review and dry run in test; before/after evidence', 'Peer reviewer', 'M', 'T05 Part D', 'G5'],
      ['S9', 'Execute under change record', 'Authorised admin', 'M', 'Change record'],
      ['S9', 'Verify with requester; attach evidence; close', 'Requester, Triage Lead', 'M', 'T05 Part E', 'G9']
    ]),
    H3('Rules specific to issues and service requests'),
    ...bullets([
      'Reproduce first. The failing test is committed before the fix and stays in the regression pack.',
      'Root cause analysis is always manual (AI-X). AI may summarise logs to help, but the cause is written by the engineer.',
      'Every RCA names the gate that should have caught the defect. That gate’s checklist, the Context Pack or the regression pack is improved, or a waiver is logged.',
      'Hotfix branches are cut from the release tag and merged back to the main branch after release.',
      'Scripts that change cost, accumulated depreciation or NBV are AI-X, need two reviewers and a dry run on a production-like copy.',
      'Production data and configuration are changed only by an authorised admin under a change record, never directly by a developer.',
      'A service request that needs code, or that reveals a defect, is re-routed as a CR or a defect.'
    ])
  ];
}
module.exports = { sec4, sec5a, sec5b, sec5c, sec5d, landscapeFig };
