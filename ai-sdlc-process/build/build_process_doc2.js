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
    steps(D.STEPS_NF),
    H3('Rules specific to new features'),
    ...bullets(D.RULES_NF),
    H2('5.2  Enhancement or change request (CR)', { newPage: true }),
    P([['When. ', { bold: true }], D.WORK_TYPES.CR.when + ' Examples: ' + D.WORK_TYPES.CR.examples.join('; ') + '.']),
    P('A CR starts with an impact analysis (T04) instead of a fresh requirement register. Documents are updated as deltas, and regression testing is selected from the RTM. The flow diagram is on the next page.'),
    H3('CR classification'),
    table(['Class', 'Criteria (any one is enough for Major)', 'Effect on the flow'], D.CR_CLASS, [1100, 4300, CW - 5400], { boldCols: [0] })
  ];
}
function sec5c() {
  return [
    H3('Step-by-step: change request'),
    steps(D.STEPS_CR),
    H3('Rules specific to change requests'),
    ...bullets(D.RULES_CR)
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
    steps(D.STEPS_DEFECT),
    H3('Step-by-step: service request'),
    steps(D.STEPS_SERVICE),
    H3('Rules specific to issues and service requests'),
    ...bullets(D.RULES_SR)
  ];
}
module.exports = { sec4, sec5a, sec5b, sec5c, sec5d, landscapeFig };
