
/* =================== IMPLEMENTATION DECK =================== */
const FS = require('fs'); const PATH = require('path'); const PATH_ = PATH;
const DD = require(PATH_.join(__dirname, 'process_data.js'));
const DIAG = n => PATH.join(__dirname, '..', 'diagrams', n + '.png');
const MCOL = { 'M': [P.rust, 'F8E6DF'], 'AI-G': [P.teal, 'DDF0F1'], 'AI-A': [P.plum, 'ECE5F1'], 'AUTO': [P.slate, 'E1EAEE'], 'AI-X': ['8E2424', 'F3DCDC'] };
function img(s, name, x, y, maxW, maxH) {
  const buf = FS.readFileSync(DIAG(name)); const pw = buf.readUInt32BE(16), ph = buf.readUInt32BE(20);
  let w = maxW, h = w * ph / pw; if (h > maxH) { h = maxH; w = h * pw / ph; }
  s.addImage({ path: DIAG(name), x: x + (maxW - w) / 2, y, w, h, altText: name });
  return { w, h, x: x + (maxW - w) / 2 };
}
function tbl(s, head, rows, o = {}) {
  const fs = o.fs || 10.5;
  s.addTable([head.map(h => ({ text: h, options: { bold: true, color: 'FFFFFF', fill: { color: P.ink }, fontSize: o.hs || 11, valign: 'middle' } }))].concat(
    rows.map((r, i) => r.map((c, j) => {
      if (c && typeof c === 'object' && c.text !== undefined) return c;
      const b = (o.boldCols || []).includes(j);
      return { text: String(c), options: { fontSize: fs, bold: b, color: b ? P.ink : '3F5A63', fill: { color: i % 2 ? P.surface2 : P.white }, valign: 'middle', align: (o.center || []).includes(j) ? 'center' : 'left' } };
    }))), { x: o.x ?? M, y: o.y ?? 1.46, w: o.w ?? CW, colW: o.colW, rowH: o.rowH, border: { type: 'solid', color: P.line, pt: 0.5 }, margin: 0.06, autoPage: false });
}
const modeCellP = (code, fs = 10.5) => ({ text: code, options: { bold: true, color: MCOL[code][0], fill: { color: MCOL[code][1] }, align: 'center', valign: 'middle', fontSize: fs } });
function modePill(s, x, y, code, fs = 10) {
  const w = 0.22 + code.length * 0.085;
  s.addShape(SH.roundRect, { x, y, w, h: 0.26, rectRadius: 0.5, fill: { color: MCOL[code][0] }, line: { type: 'none' } });
  txt(s, code, { x, y, w, h: 0.26, fontSize: fs, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
  return w;
}
function gateBadge(s, x, y, g, d = 0.36) {
  s.addShape(SH.ellipse, { x, y, w: d, h: d, fill: { color: P.amberBright }, line: { color: 'FFFFFF', width: 1.5 } });
  txt(s, g, { x, y, w: d, h: d, fontSize: 9.5, bold: true, color: P.ink, align: 'center', valign: 'middle' });
}
function banner(s, y, lead, rest, o = {}) {
  s.addShape(SH.roundRect, { x: M, y, w: CW, h: o.h || 0.62, rectRadius: 0.09, fill: { color: o.fill || P.ink }, line: o.line ? { color: o.line, width: 1 } : { type: 'none' } });
  txt(s, [{ text: lead + '  ', options: { bold: true, color: o.leadColor || P.amberBright } }, { text: rest, options: { color: o.color || 'FFFFFF' } }],
    { x: M + 0.3, y, w: CW - 0.6, h: o.h || 0.62, fontSize: o.fs || 12, valign: 'middle', lineSpacing: 15 });
}

/* ---------- 1 cover ---------- */
function iCover() {
  section('Opening');
  const s = slide('COVER');
  s.addShape(SH.ellipse, { x: 9.6, y: -1.6, w: 5.6, h: 5.6, fill: { color: P.deep }, line: { type: 'none' } });
  s.addShape(SH.ellipse, { x: 11.0, y: 4.6, w: 3.4, h: 3.4, fill: { color: '19505E' }, line: { type: 'none' } });
  txt(s, 'ARCHITECTURE  ·  IMPLEMENTATION BRIEFING', { x: 0.95, y: 1.75, w: 9.0, h: 0.32, fontSize: 11.5, bold: true, charSpacing: 1.6, color: P.amberBright });
  s.addText('AI SDLC Process: How We Will Work', PH.coverTitle);
  s.addText('The stages, what goes in and comes out of each, which work is manual and which is AI, how AI output is proven valid, the templates we fill, and how we roll it out.', PH.coverSub);
  const chips = [['doc', 'Process Definition PD-AISDLC-01'], ['clip', '15 templates + tracker'], ['layers', 'Context Pack /ai-context']];
  let x = 0.95;
  chips.forEach(([ic, label]) => {
    s.addShape(SH.roundRect, { x, y: 5.45, w: 3.4, h: 0.62, rectRadius: 0.1, fill: { color: '17404C' }, line: { type: 'none' } });
    iconCircle(s, x + 0.18, 5.59, 0.34, P.teal, ic);
    txt(s, label, { x: x + 0.66, y: 5.45, w: 2.7, h: 0.62, fontSize: 12, bold: true, color: 'DCE9EC', valign: 'middle' });
    x += 3.6;
  });
  s.addText('Fixed Assets Suite  ·  Web + Microservices  ·  Mobile  ·  Internal Web', PH.coverMeta);
  s.addNotes('Purpose: walk the team through the process definition and agree how we implement it. This builds on the earlier framework session; today is about the concrete process, documents and roll-out.');
}
function iAgenda() {
  const s = content('AGENDA', 'From process to practice in six parts');
  const rows = [
    ['The process in one picture', 'Stages, modes, AI boundaries, stage inputs and outputs', '8 min', P.slate, 'sitemap'],
    ['Three work types, three paths', 'New feature, change request, issue fix and service request', '10 min', P.teal, 'diagram'],
    ['Proving AI output is valid', 'Four levels, ten techniques, the acceptance checklist', '8 min', P.rust, 'shield'],
    ['Documents and templates', 'Which document, at which stage, filled by whom', '6 min', P.amber, 'clip'],
    ['Common context', 'The Context Pack and the standard prompt', '6 min', P.plum, 'layers'],
    ['Implementing it here', 'Jira, Git, Jenkins, roles, roll-out, pilot, first 30 days', '12 min', P.green, 'flag']
  ];
  let y = 1.55;
  rows.forEach(([t, d, time, col, ic], i) => {
    s.addShape(SH.roundRect, { x: M, y, w: CW, h: 0.72, rectRadius: 0.08, fill: { color: i % 2 ? P.surface2 : P.surface }, line: { type: 'none' } });
    iconCircle(s, M + 0.16, y + 0.15, 0.42, col, ic);
    txt(s, t, { x: M + 0.76, y, w: 5.0, h: 0.72, fontSize: 15, bold: true, color: P.ink, valign: 'middle' });
    txt(s, d, { x: M + 5.9, y, w: 4.6, h: 0.72, fontSize: 12, color: P.muted, valign: 'middle' });
    pill(s, 11.55, y + 0.19, 1.0, 0.34, time, P.white, col, 10.5);
    y += 0.8;
  });
  txt(s, 'About 50 minutes plus questions. Every slide maps to a section of the process definition, so you can read the detail afterwards.', { x: M, y: 6.48, w: CW, h: 0.4, fontSize: 12, italic: true, color: P.muted });
  s.addNotes('Set expectation: detailed walkthrough. The document is the reference; this deck is the guided tour plus the implementation plan.');
}
function iPackage() {
  const s = content('WHAT YOU ARE GETTING', 'Four artifacts, generated from one source so they never disagree', true);
  const cards = [
    [P.teal, 'doc', 'PROCESS DEFINITION', 'PD-AISDLC-01  ·  Word  ·  64 pages', ['Ten stages with inputs, activities, outputs and the mode of each', 'Process flows for new feature, CR, issue fix and SR', 'Validation framework, governance and roll-out plan']],
    [P.rust, 'clip', 'TEMPLATES T01 – T15', 'Word  ·  fillable', ['One template per artifact, with guidance and examples', 'Clickable checklists and a sign-off block in each', 'T10 holds the ten gate checklists, one page each']],
    [P.amber, 'table', 'TRACKER X01', 'Excel  ·  9 sheets  ·  live formulas', ['RTM with an automatic coverage check', 'Gate log that flags reviewer = AI operator', 'Parity, waivers, Context Pack log, metrics']],
    [P.plum, 'layers', 'CONTEXT PACK', '/ai-context  ·  27 markdown files', ['AI-INSTRUCTIONS.md plus CP-00 to CP-99 starters', 'Ten stage prompt templates, P-S0 to P-S9', 'Pull request template with both checklists']]
  ];
  cards.forEach(([col, ic, label, sub, items], i) => {
    const x = M + i * 3.07, w = 2.88;
    s.addShape(SH.roundRect, { x, y: 1.5, w, h: 4.6, rectRadius: 0.1, fill: { color: P.white }, line: { color: col, width: 1.25 }, shadow: sh({ opacity: 0.08, blur: 7, offset: 1 }) });
    iconCircle(s, x + 0.22, 1.72, 0.52, col, ic);
    txt(s, label, { x: x + 0.22, y: 2.38, w: w - 0.44, h: 0.36, fontSize: 12.5, bold: true, color: col, charSpacing: 0.6 });
    txt(s, sub, { x: x + 0.22, y: 2.74, w: w - 0.44, h: 0.32, fontSize: 10.5, color: P.muted });
    bullets(s, items, { x: x + 0.22, y: 3.2, w: w - 0.4, h: 2.8, fontSize: 12, lineSpacing: 15, paraSpaceAfter: 8 });
  });
  banner(s, 6.28, 'One source of truth:', 'the stage definitions, checklists, prompts and templates are all generated from the same process data. Change it once and every artifact stays consistent.');
  s.addNotes('Stress that this is a complete kit, not just a document. The single-source point matters: the checklist in the document, in T10, in CP-60 and in the PR template is literally the same list.');
}

/* ---------- section 1 ---------- */
function iMaster() {
  const s = content('THE PROCESS IN ONE PICTURE', 'Ten stages, a gate after each, and two tracks that meet at test execution');
  img(s, 'D1-master-flow', 0.5, 1.4, 6.9, 5.5);
  s.addShape(SH.roundRect, { x: 7.6, y: 1.45, w: 5.1, h: 5.35, rectRadius: 0.1, fill: { color: P.surface }, line: { type: 'none' } });
  txt(s, 'HOW TO READ IT', { x: 7.85, y: 1.6, w: 4.6, h: 0.3, fontSize: 11.5, bold: true, color: P.teal, charSpacing: 0.8 });
  bullets(s, [
    { text: 'Define (S0–S2) is sequential: intake, requirements, SFVD.', options: {} },
    'Build (S3–S5) and test design (S6) run in parallel from the moment the SFVD is baselined at G2.',
    'Prove and ship (S7–S9) starts when code is merged (G5) and tests are approved (G6).',
    'Every stage ends at a gate. No output is the next input until its gate is recorded in T10.',
    'The Context Pack feeds every AI step; the RTM links every artifact by ID.',
    'Defects and changes re-enter at intake, never mid-stream.'
  ], { x: 7.85, y: 2.0, w: 4.65, h: 3.9, fontSize: 12.5, lineSpacing: 15, paraSpaceAfter: 8 });
  let px = 7.85; ['M', 'AI-G', 'AI-A', 'AUTO', 'AI-X'].forEach(c => { px += modePill(s, px, 6.3, c) + 0.1; });
  s.addNotes('Spend time here. Point at S6 running in parallel: this is a change from our old flow, where testers waited for code.');
}
function iModes() {
  const s = content('THE PROCESS IN ONE PICTURE', 'Five modes tell you who produces each thing and how hard to check it', true);
  const ver = { 'M': 'Role checklist and gate (L2, L4)', 'AI-G': 'All four levels plus the universal checklist', 'AI-A': 'The person confirms every AI suggestion', 'AUTO': 'Result attached to the gate as evidence', 'AI-X': 'Not applicable: AI must not be used' };
  Object.values(DD.MODES).forEach((m, i) => {
    const y = 1.5 + i * 1.02;
    s.addShape(SH.roundRect, { x: M, y, w: CW, h: 0.9, rectRadius: 0.08, fill: { color: P.white }, line: { color: MCOL[m.code][0], width: 1.25 } });
    s.addShape(SH.roundRect, { x: M + 0.22, y: y + 0.22, w: 1.0, h: 0.46, rectRadius: 0.5, fill: { color: MCOL[m.code][0] }, line: { type: 'none' } });
    txt(s, m.code, { x: M + 0.22, y: y + 0.22, w: 1.0, h: 0.46, fontSize: 14, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
    txt(s, m.name, { x: M + 1.42, y, w: 2.1, h: 0.9, fontSize: 14, bold: true, color: MCOL[m.code][0], valign: 'middle' });
    txt(s, m.desc, { x: M + 3.55, y, w: 5.3, h: 0.9, fontSize: 11.5, color: '3F5A63', valign: 'middle', lineSpacing: 14 });
    s.addShape(SH.roundRect, { x: M + 9.05, y: y + 0.14, w: 2.85, h: 0.62, rectRadius: 0.06, fill: { color: MCOL[m.code][1] }, line: { type: 'none' } });
    txt(s, ver[m.code], { x: M + 9.15, y: y + 0.14, w: 2.65, h: 0.62, fontSize: 10.5, bold: true, color: P.ink, valign: 'middle', lineSpacing: 12 });
  });
  txt(s, 'A combined tag such as “AI-G → M” means AI drafts and a person validates, completes and owns the result.', { x: M, y: 6.6, w: CW, h: 0.32, fontSize: 12, italic: true, color: P.muted });
  s.addNotes('Every row in every stage table of the document carries one of these tags. That is how you answer “which parts are manual and which are AI” for any stage.');
}
function iBoundaries() {
  const s = content('THE PROCESS IN ONE PICTURE', 'AI boundaries: generate and validate, assist only, or not at all');
  const cols = [['AI-G', 'AI-GENERATED, THEN VALIDATED', DD.AI_PERMISSIONS.AG, 'robot'], ['AI-A', 'AI-ASSISTED ONLY', DD.AI_PERMISSIONS.AA, 'search'], ['AI-X', 'AI NOT PERMITTED', DD.AI_PERMISSIONS.NA, 'ban']];
  cols.forEach(([c, label, items, ic], i) => {
    const x = M + i * 4.18, w = 3.94;
    s.addShape(SH.roundRect, { x, y: 1.46, w, h: 5.45, rectRadius: 0.1, fill: { color: MCOL[c][1] }, line: { type: 'none' } });
    iconCircle(s, x + 0.2, 1.62, 0.44, MCOL[c][0], ic);
    txt(s, label, { x: x + 0.74, y: 1.62, w: w - 0.9, h: 0.44, fontSize: 11.5, bold: true, color: MCOL[c][0], valign: 'middle', charSpacing: 0.5 });
    bullets(s, items, { x: x + 0.22, y: 2.22, w: w - 0.4, h: 4.6, fontSize: 12, lineSpacing: 14.5, paraSpaceAfter: 7, color: P.ink });
  });
  s.addNotes('The right-hand column is non-negotiable. Note especially: RCA is always manual, P1/P2 fixes are manual, and scripts that change financial values are manual.');
}
function iAnatomy() {
  const s = content('THE PROCESS IN ONE PICTURE', 'Every stage runs the same loop: input, prompt, draft, validate, gate', true);
  img(s, 'D2-stage-anatomy', 0.5, 1.45, 8.5, 4.4);
  const lv = [['L1', 'Automated checks', P.slate], ['L2', 'Role checklist', P.teal], ['L3', 'Independent review', P.rust], ['L4', 'Recorded sign-off', P.amber]];
  txt(s, 'VALIDATE = FOUR LEVELS', { x: 9.3, y: 1.55, w: 3.4, h: 0.3, fontSize: 11.5, bold: true, color: P.rust, charSpacing: 0.6 });
  lv.forEach(([id, t, c], i) => {
    const y = 2.0 + i * 0.85;
    s.addShape(SH.roundRect, { x: 9.3, y, w: 3.4, h: 0.72, rectRadius: 0.08, fill: { color: P.white }, line: { color: c, width: 1.25 } });
    s.addShape(SH.roundRect, { x: 9.45, y: y + 0.14, w: 0.55, h: 0.44, rectRadius: 0.08, fill: { color: c }, line: { type: 'none' } });
    txt(s, id, { x: 9.45, y: y + 0.14, w: 0.55, h: 0.44, fontSize: 12, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
    txt(s, t, { x: 10.15, y, w: 2.45, h: 0.72, fontSize: 12.5, bold: true, color: P.ink, valign: 'middle' });
  });
  banner(s, 6.1, 'Rejected?', 'Record the reason and regenerate. If the cause was missing context, raise T14 so the Context Pack is fixed for every developer, not just you.', { h: 0.72 });
  s.addNotes('This loop is the same in all ten stages. Learn it once.');
}
function iStageIO() {
  const s = content('THE PROCESS IN ONE PICTURE', 'Inputs, AI outputs and the human check for every stage');
  const rows = [
    ['S0 Intake', 'Request, logs, current RTM', 'Intake summary, duplicate list (AI-A)', 'Nothing added or lost; person classifies', 'G0 · Delivery Mgr'],
    ['S1 Requirements', 'Requirement note, glossary CP-00', 'Register with REQ-IDs, criteria, questions', 'Every line traced; questions answered by business', 'G1 · Product Owner'],
    ['S2 SFVD', 'Register, data dictionary, CP-21/23', 'Screens, fields, validations, flows', 'No invented field, validation or error code', 'G2 · BA Lead'],
    ['S3 Design', 'SFVD, OpenAPI specs, CP-20/22', 'Design note, contract, migration draft', 'Boundaries, reuse, compatibility, rollback', 'G3 · Architect'],
    ['S4 Development', 'SFVD, contract, CP-10/11/12/99', 'Code, unit tests, config', 'Reuse searched; dev can explain every line', 'G4 · Tech Lead'],
    ['S5 Code review', 'PR diff, Sonar, contract diff', 'Review aid only (AI-A)', 'Independent reviewer reads logic vs SFVD', 'G5 · Tech Lead'],
    ['S6 Test design', 'SFVD, contract, CP-30/31', 'Test cases and test data', 'Coverage counted; SME re-derives values', 'G6 · QA Lead'],
    ['S7 Test execution', 'Approved suite, seed script', 'Automation scripts, defect drafts', '1:1 with cases; deliberate-fail check', 'G7 · QA Lead'],
    ['S8 Release', 'Merged code, Jira scope, RTM', 'Release notes, runbook draft', 'Scope = notes = RTM; dry run passed', 'G8 · Delivery Mgr'],
    ['S9 Deploy', 'Signed package, runbook', 'Log and metric summary (AI-A)', 'Smoke by QA; monitoring window clean', 'G9 · Delivery Mgr']
  ];
  tbl(s, ['Stage', 'AI is given', 'AI produces', 'A person must check', 'Gate · signs'], rows, { colW: [1.75, 2.75, 2.85, 3.1, 1.65], fs: 10.5, boldCols: [0], rowH: 0.44 });
  s.addNotes('This is the one-slide answer to “inputs, outputs, manual versus AI”. Full detail per stage is in section 4 of the document, each with its own checklist.');
}

/* ---------- section 2 ---------- */
function iRouting() {
  const s = content('THREE WORK TYPES, THREE PATHS', 'Classify every item at intake; the work type decides the path');
  img(s, 'D3-work-type-routing', 0.5, 1.4, 6.4, 5.55);
  const rules = [['Capability does not exist yet', 'NF'], ['Baselined behaviour must change on purpose', 'CR'], ['Product differs from the baselined SFVD', 'SR · defect'], ['Data, configuration or access change, no code', 'SR · service'], ['Matches SFVD but business wants different', '→ CR'], ['“Service request” that needs code', '→ CR or defect']];
  txt(s, 'CLASSIFICATION RULES', { x: 7.2, y: 1.5, w: 5.5, h: 0.3, fontSize: 11.5, bold: true, color: P.teal, charSpacing: 0.6 });
  rules.forEach(([q, a], i) => {
    const y = 1.92 + i * 0.66;
    s.addShape(SH.roundRect, { x: 7.2, y, w: 5.5, h: 0.56, rectRadius: 0.06, fill: { color: i % 2 ? P.surface2 : P.surface }, line: { type: 'none' } });
    txt(s, q, { x: 7.35, y, w: 3.85, h: 0.56, fontSize: 11.5, color: P.ink, valign: 'middle' });
    txt(s, a, { x: 11.2, y, w: 1.4, h: 0.56, fontSize: 12, bold: true, color: P.teal, valign: 'middle', align: 'right' });
  });
  banner(s, 6.0, 'Unsure?', 'The Architect decides within one working day. Default to the stricter path. AI may summarise a request but never classifies it.', { h: 0.8, fs: 12 });
  s.addNotes('Misclassification is the most common way process gets skipped: calling a CR a bug avoids impact analysis. That is why classification is manual and disputes go to the Architect.');
}
function iFlowNF() {
  const s = content('THREE WORK TYPES, THREE PATHS', 'New application or feature: all ten stages in full', true);
  const r = img(s, 'D4-flow-new-feature', 0.45, 1.4, 9.35, 5.6);
  s.addShape(SH.roundRect, { x: 9.95, y: 1.45, w: 2.9, h: 5.4, rectRadius: 0.1, fill: { color: P.white }, line: { color: P.teal, width: 1.25 } });
  txt(s, 'NEW-FEATURE RULES', { x: 10.1, y: 1.58, w: 2.6, h: 0.3, fontSize: 11, bold: true, color: P.teal, charSpacing: 0.5 });
  bullets(s, ['New module: register its prefix in CP-00 before S1', 'First feature on a new surface creates its golden example (CP-99)', 'New shared components go into CP-20 / 21 / 23 via T14 in the same release', 'Spikes may use AI freely; spike code never merges', 'NFR baselines fixed at S1'],
    { x: 10.1, y: 1.98, w: 2.65, h: 4.8, fontSize: 11, lineSpacing: 13.5, paraSpaceAfter: 7 });
  s.addNotes('Walk one requirement through the lanes. Note test design (S6) sitting under design and development, fed directly from the SFVD.');
}
function iFlowCR() {
  const s = content('THREE WORK TYPES, THREE PATHS', 'Change request: impact analysis first, then delta stages');
  img(s, 'D5-flow-change-request', 0.45, 1.4, 9.35, 5.6);
  s.addShape(SH.roundRect, { x: 9.95, y: 1.45, w: 2.9, h: 5.4, rectRadius: 0.1, fill: { color: P.white }, line: { color: P.plum, width: 1.25 } });
  txt(s, 'WHAT IS DIFFERENT', { x: 10.1, y: 1.58, w: 2.6, h: 0.3, fontSize: 11, bold: true, color: P.plum, charSpacing: 0.5 });
  bullets(s, ['T04 impact analysis before approval; Architect confirms every AI-suggested impact', 'Minor vs Major: contract, schema, multi-surface, > 5 days or financial calc = Major', 'Changed REQ keeps its ID: DEP-REQ-214.r2', 'SFVD updated in place, change-marked', 'Regression chosen from the RTM; QA Lead confirms', 'Mobile N-1 must keep working', 'Financial rules: Finance decides prospective or retrospective'],
    { x: 10.1, y: 1.98, w: 2.65, h: 4.8, fontSize: 10.5, lineSpacing: 13, paraSpaceAfter: 5 });
  s.addNotes('The CR path is where we lost the most discipline: changes went straight to code. T04 is the control.');
}
function iFlowSR() {
  const s = content('THREE WORK TYPES, THREE PATHS', 'Issues and service requests: triage decides; root cause is manual', true);
  const box = (x, y, w, h, t, sub, modes, g, fill) => {
    const m0 = MCOL[modes[0]];
    s.addShape(SH.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: fill || m0[1] }, line: { color: m0[0], width: 1.25 } });
    txt(s, t, { x: x + 0.1, y: y + 0.06, w: w - 0.2, h: sub ? h * 0.45 : h - 0.36, fontSize: 11.5, bold: true, color: P.ink, valign: sub ? 'bottom' : 'middle', align: 'center' });
    if (sub) txt(s, sub, { x: x + 0.1, y: y + h * 0.48, w: w - 0.2, h: 0.28, fontSize: 9.5, color: P.muted, align: 'center', valign: 'top' });
    let tw = modes.reduce((a, c) => a + 0.22 + c.length * 0.085 + 0.06, 0), px = x + (w - tw) / 2;
    modes.forEach(c => { px += modePill(s, px, y + h - 0.32, c, 9) + 0.06; });
    if (g) gateBadge(s, x + w - 0.24, y - 0.12, g, 0.34);
  };
  const ln = (x, y, w, h, head) => s.addShape(SH.line, { x, y, w, h, line: { color: P.slate, width: 1.75, endArrowType: head ? 'triangle' : undefined } });
  box(M, 1.45, 2.05, 0.7, 'Ticket raised', null, ['M']);
  ln(M + 1.02, 2.15, 0, 0.22, true);
  box(M, 2.4, 2.05, 1.05, 'Triage (T05)', 'reproduce, classify, severity', ['M', 'AI-A'], 'G0');
  ln(M + 1.02, 3.45, 0, 0.22, true);
  s.addShape(SH.diamond, { x: M, y: 3.7, w: 2.05, h: 1.1, fill: { color: 'FDF6E6' }, line: { color: P.amber, width: 1.5 } });
  txt(s, 'Code change?', { x: M, y: 3.7, w: 2.05, h: 1.1, fontSize: 11, bold: true, color: P.ink, align: 'center', valign: 'middle' });
  ln(2.65, 4.25, 0.25, 0); ln(2.9, 2.3, 0, 1.95); ln(2.9, 2.3, 0.2, 0, true); ln(2.9, 3.95, 0.2, 0, true);
  txt(s, 'No', { x: 2.92, y: 2.0, w: 0.4, h: 0.26, fontSize: 10.5, bold: true, color: P.ink });
  txt(s, 'Yes', { x: 2.92, y: 3.62, w: 0.45, h: 0.26, fontSize: 10.5, bold: true, color: P.ink });
  txt(s, 'SERVICE REQUEST  ·  no code', { x: 3.15, y: 1.42, w: 5, h: 0.28, fontSize: 10.5, bold: true, color: P.slate, charSpacing: 0.5 });
  const sr = [['Classify SR type', 'data · config · access · report', ['M']], ['Scripted, reversible change', 'AI-X if it changes values', ['M', 'AI-G']], ['Peer review + dry run', 'before / after evidence', ['M'], 'G5'], ['Execute + verify', 'change record; requester confirms', ['M'], 'G9']];
  sr.forEach(([t, sub, m, g], i) => { const x = 3.15 + i * 2.42; box(x, 1.8, 2.22, 1.0, t, sub, m, g); if (i < 3) ln(x + 2.22, 2.3, 0.2, 0, true); });
  txt(s, 'DEFECT FIX  ·  code change', { x: 3.15, y: 3.07, w: 5, h: 0.28, fontSize: 10.5, bold: true, color: P.rust, charSpacing: 0.5 });
  const df = [['Failing test first', 'reproduces the defect', ['M']], ['Root cause (T06)', 'written by the engineer', ['AI-X']], ['Approve RCA', 'Architect for P1 / P2', ['M'], 'G1'], ['Severity decides', 'whether AI may help', ['M']]];
  df.forEach(([t, sub, m, g], i) => { const x = 3.15 + i * 2.42; box(x, 3.45, 2.22, 1.0, t, sub, m, g); if (i < 3) ln(x + 2.22, 3.95, 0.2, 0, true); });
  ln(12.43, 4.45, 0, 1.38); 
  s.addShape(SH.roundRect, { x: 3.15, y: 4.62, w: 9.06, h: 0.56, rectRadius: 0.06, fill: { color: 'F3DCDC' }, line: { color: '8E2424', width: 1 } });
  txt(s, [{ text: 'P1 / P2   ', options: { bold: true, color: '8E2424' } }, { text: 'Manual fix only (AI-X)  →  two engineers + Architect review (G5)  →  targeted + regression (G7)  →  hotfix release (G8)', options: { color: P.ink } }], { x: 3.3, y: 4.62, w: 8.8, h: 0.56, fontSize: 11, valign: 'middle' });
  s.addShape(SH.roundRect, { x: 3.15, y: 5.3, w: 9.06, h: 0.56, rectRadius: 0.06, fill: { color: 'DDF0F1' }, line: { color: P.teal, width: 1 } });
  txt(s, [{ text: 'P3 / P4   ', options: { bold: true, color: P.teal } }, { text: 'AI-G fix allowed after RCA approval  →  independent review (G5)  →  regression pack (G7)  →  scheduled release (G8)', options: { color: P.ink } }], { x: 3.3, y: 5.3, w: 8.8, h: 0.56, fontSize: 11, valign: 'middle' });
  [4.9, 5.58].forEach(yy => s.addShape(SH.line, { x: 12.23, y: yy, w: 0.2, h: 0, line: { color: P.slate, width: 1.75, beginArrowType: 'triangle' } }));
  banner(s, 6.1, 'Every path ends at G9:', 'deploy, smoke, extended monitoring (T13), then close — RTM and SFVD updated, the missed gate improved, context gaps raised on T14.', { h: 0.72, fs: 11.5 });
  s.addNotes('Two key rules: the failing test comes before the fix, and the RCA names the gate that should have caught the defect. That is how the process learns.');
}
function iSeverity() {
  const s = content('THREE WORK TYPES, THREE PATHS', 'Severity sets the AI permission; service requests have their own controls');
  tbl(s, ['Severity', 'Definition', 'Response', 'AI permission', 'Review', 'Release'], DD.SEVERITY.map(r => [r[0], r[1], r[2], r[3], r[4], r[5]]),
    { y: 1.45, colW: [1.25, 3.6, 1.45, 2.85, 1.6, 1.35], fs: 10.5, boldCols: [0], rowH: 0.5 });
  tbl(s, ['Service request type', 'Examples', 'Controls'], DD.SR_TYPES, { y: 4.15, colW: [2.1, 3.9, 6.1], fs: 10, boldCols: [0], rowH: 0.48 });
  s.addNotes('A wrong depreciation posting is P1 even if the system is up: financial misstatement is the trigger.');
}
function iTailor() {
  const s = content('THREE WORK TYPES, THREE PATHS', 'Every stage exists for every work type; only the depth changes', true);
  const tint = { F: ['DDF0F1', P.teal], D: ['ECE5F1', P.plum], C: ['FDF6E6', P.amber], L: ['E1EAEE', P.slate] };
  const cellT = k => ({ text: DD.TAILOR_KEY[k], options: { bold: true, color: tint[k][1], fill: { color: tint[k][0] }, align: 'center', valign: 'middle', fontSize: 10.5 } });
  const rows = DD.TAILORING.map(r => [r[0] + ' ' + DD.STAGES.find(x => x.id === r[0]).short, cellT(r[1]), cellT(r[2]), cellT(r[3]), r[5], r[6]]);
  tbl(s, ['Stage', 'New feature', 'Change req.', 'Issue / SR', 'For a change request', 'For an issue or SR'], rows, { colW: [1.8, 1.2, 1.2, 1.2, 3.35, 3.35], fs: 10.5, boldCols: [0], rowH: 0.46 });
  s.addNotes('Full, delta, conditional, light. “Conditional” always has a stated trigger — for example S3 runs for a CR only if a contract, schema or cross-service change is involved.');
}
