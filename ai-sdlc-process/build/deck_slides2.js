
/* ---------- section 3: validation ---------- */
function iLevels() {
  const s = content('PROVING AI OUTPUT IS VALID', 'Four levels close every gate; three out of four is not a gate');
  img(s, 'D7-validation-levels', 0.5, 1.45, 7.6, 4.3);
  s.addShape(SH.roundRect, { x: 8.35, y: 1.45, w: 4.35, h: 4.3, rectRadius: 0.1, fill: { color: P.surface }, line: { type: 'none' } });
  txt(s, 'WHERE EACH LEVEL IS RECORDED', { x: 8.55, y: 1.6, w: 4, h: 0.3, fontSize: 11, bold: true, color: P.teal, charSpacing: 0.5 });
  [['L1', 'Jenkins result linked in T10', P.slate], ['L2', 'Ticked checklist in T10', P.teal], ['L3', 'Reviewer name in T10; must differ from the AI operator (X01 flags it)', P.rust], ['L4', 'Decision in T10 and a row in the X01 Gate Log', P.amber]].forEach(([id, t, c], i) => {
    const y = 2.05 + i * 0.9;
    s.addShape(SH.roundRect, { x: 8.55, y: y + 0.1, w: 0.55, h: 0.44, rectRadius: 0.08, fill: { color: c }, line: { type: 'none' } });
    txt(s, id, { x: 8.55, y: y + 0.1, w: 0.55, h: 0.44, fontSize: 12, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
    txt(s, t, { x: 9.25, y, w: 3.3, h: 0.66, fontSize: 11.5, color: P.ink, valign: 'middle', lineSpacing: 13.5 });
  });
  banner(s, 6.0, 'Verification is standardised:', 'the same four levels in all ten stages. Only the checklist contents change by stage, and those are fixed in T10 and CP-60.', { h: 0.8 });
  s.addNotes('If anyone asks “how do we know the AI output is right?”, the answer is these four levels, recorded.');
}
function iTechniques() {
  const s = content('PROVING AI OUTPUT IS VALID', 'Ten techniques, each aimed at one way AI output goes wrong', true);
  DD.TECHNIQUES.forEach(([id, name, catches, how, stages], i) => {
    const x = M + (i % 5) * 2.45, y = 1.45 + Math.floor(i / 5) * 2.65, w = 2.3, h = 2.5;
    s.addShape(SH.roundRect, { x, y, w, h, rectRadius: 0.09, fill: { color: P.white }, line: { color: P.line, width: 0.75 }, shadow: sh({ opacity: 0.07, blur: 6, offset: 1 }) });
    s.addShape(SH.roundRect, { x: x + 0.16, y: y + 0.16, w: 0.62, h: 0.38, rectRadius: 0.08, fill: { color: P.rust }, line: { type: 'none' } });
    txt(s, id, { x: x + 0.16, y: y + 0.16, w: 0.62, h: 0.38, fontSize: 12, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
    txt(s, name, { x: x + 0.16, y: y + 0.62, w: w - 0.3, h: 0.56, fontSize: 12.5, bold: true, color: P.ink, valign: 'top', lineSpacing: 14 });
    txt(s, [{ text: 'Catches: ', options: { bold: true, color: P.rust } }, { text: catches, options: { color: '3F5A63' } }], { x: x + 0.16, y: y + 1.2, w: w - 0.3, h: 0.7, fontSize: 10.5, lineSpacing: 12.5 });
    txt(s, stages, { x: x + 0.16, y: y + h - 0.42, w: w - 0.3, h: 0.3, fontSize: 9.5, italic: true, color: P.muted });
  });
  txt(s, 'How to apply each one is in section 6.2 of the process definition; every stage names the techniques its reviewer uses.', { x: M, y: 6.75, w: CW, h: 0.26, fontSize: 10.5, italic: true, color: P.muted });
  s.addNotes('V2, assumption review, and V3, registry lookup, catch most AI errors in documents. V8, the deliberate-fail check, catches automation scripts that assert nothing.');
}
function iUniversal() {
  const s = content('PROVING AI OUTPUT IS VALID', 'The universal checklist applied to every AI-generated artifact');
  const items = DD.UNIVERSAL_CHECKLIST;
  items.forEach((t, i) => {
    const col = i < 6 ? 0 : 1, row = i < 6 ? i : i - 6, x = M + col * 6.2, y = 1.5 + row * 0.8;
    s.addShape(SH.roundRect, { x, y, w: 5.9, h: 0.68, rectRadius: 0.08, fill: { color: row % 2 ? P.surface2 : P.surface }, line: { type: 'none' } });
    iconCircle(s, x + 0.14, y + 0.14, 0.4, P.teal, 'check');
    txt(s, t, { x: x + 0.7, y, w: 5.05, h: 0.68, fontSize: 11.5, color: P.ink, valign: 'middle', lineSpacing: 13 });
  });
  s.addShape(SH.roundRect, { x: 6.81, y: 5.5, w: 5.9, h: 0.68, rectRadius: 0.08, fill: { color: 'FDF6E6' }, line: { color: 'E8D2A0', width: 1 } });
  txt(s, 'Recorded in T11 with the assumption register. Undeclared AI content fails the gate.', { x: 6.95, y: 5.5, w: 5.65, h: 0.68, fontSize: 11.5, bold: true, color: P.amber, valign: 'middle' });
  banner(s, 6.32, 'Block 8 of every prompt makes this possible:', 'AI must list its assumptions and open questions, so the reviewer checks written claims instead of hunting for hidden ones.');
  s.addNotes('Read three of these aloud: no invented identifiers, reuse verified, reviewer is not the operator.');
}
function iDomain() {
  const s = content('PROVING AI OUTPUT IS VALID', 'Fixed-asset rules: where AI output looks right and is wrong', true);
  DD.DOMAIN_CHECKS.forEach(([area, what], i) => {
    const x = M + (i % 2) * 6.2, y = 1.45 + Math.floor(i / 2) * 0.92;
    s.addShape(SH.roundRect, { x, y, w: 5.9, h: 0.8, rectRadius: 0.08, fill: { color: P.white }, line: { color: P.line, width: 0.75 } });
    txt(s, area, { x: x + 0.18, y, w: 1.9, h: 0.8, fontSize: 12, bold: true, color: P.rust, valign: 'middle', lineSpacing: 13 });
    txt(s, what, { x: x + 2.15, y, w: 3.6, h: 0.8, fontSize: 10.5, color: '3F5A63', valign: 'middle', lineSpacing: 12.5 });
  });
  banner(s, 6.2, 'Technique V7:', 'a domain SME calculates at least two scenarios without looking at the AI output, then compares. Mandatory for any change to a financial calculation.', { h: 0.72 });
  s.addNotes('These come straight from our domain. A WDV calculation with a pro-rata addition is exactly the kind of thing AI produces confidently and gets subtly wrong.');
}

/* ---------- section 4: documents ---------- */
function iDocMap() {
  const s = content('DOCUMENTS AND TEMPLATES', 'Which document is produced, used and signed at each stage');
  img(s, 'D10-document-map', 0.45, 1.4, 12.4, 5.55);
  s.addNotes('Read one row across: T02 SFVD is produced at S2 and used by design, development, review and test design. Read one column down: everything S6 needs.');
}
function iCatalogue() {
  const s = content('DOCUMENTS AND TEMPLATES', 'Fifteen templates and one tracker: what each is for and who fills it', true);
  const primary = t => /AI-X|Manual only/.test(t[6]) ? (t[6].includes('AI-X') ? 'AI-X' : 'M') : /AI-G/.test(t[6]) ? 'AI-G' : /AI-A/.test(t[6]) ? 'AI-A' : 'M';
  DD.TEMPLATES.forEach((t, i) => {
    const x = M + (i % 4) * 3.07, y = 1.45 + Math.floor(i / 4) * 1.36, w = 2.9, h = 1.24, m = primary(t);
    s.addShape(SH.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: P.white }, line: { color: P.line, width: 0.75 }, shadow: sh({ opacity: 0.06, blur: 5, offset: 1 }) });
    s.addShape(SH.roundRect, { x: x + 0.14, y: y + 0.14, w: 0.64, h: 0.36, rectRadius: 0.08, fill: { color: MCOL[m][0] }, line: { type: 'none' } });
    txt(s, t[0], { x: x + 0.14, y: y + 0.14, w: 0.64, h: 0.36, fontSize: 11.5, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
    txt(s, t[1], { x: x + 0.88, y: y + 0.08, w: w - 0.98, h: 0.5, fontSize: 11, bold: true, color: P.ink, valign: 'middle', lineSpacing: 12.5 });
    txt(s, 'Stage ' + t[3], { x: x + 0.14, y: y + 0.6, w: w - 0.28, h: 0.26, fontSize: 10, color: P.muted });
    txt(s, t[5], { x: x + 0.14, y: y + 0.86, w: w - 0.28, h: 0.28, fontSize: 10, bold: true, color: P.slate });
  });
  s.addNotes('Tile colour shows how the template is mainly filled: teal AI-drafted then verified, rust manual, purple AI-assisted, dark red no AI at all (T06 root cause analysis).');
}
function iTracker() {
  const s = content('DOCUMENTS AND TEMPLATES', 'X01 tracker: eight working sheets that flag problems automatically');
  const sheets = [['table', 'RTM', 'Requirement → SFVD → API → PR → tests → release', 'GAP when a requirement has no PR, no test or no pass'],
    ['stamp', 'Gate Log', 'One row per gate per work item', 'NO when the reviewer ran the AI prompt'],
    ['robot', 'AI Usage Log', 'One row per T11 declaration', 'Missing when AI output has no declaration'],
    ['check', 'Parity', 'Approved = manual + automated + deferred', 'Cases missing when the count does not reconcile'],
    ['lock', 'Waivers', 'T15 register with expiry', 'EXPIRED, or NO when longer than 90 days'],
    ['layers', 'CP Versions', 'Context Pack releases and T14s closed', 'Lead time in working days'],
    ['bug', 'Defect to Gate', 'Which gate missed each defect', 'Open preventive actions'],
    ['chart', 'Metrics', 'Live Council metrics', 'On target / Action needed']];
  sheets.forEach(([ic, name, what, flag], i) => {
    const x = M + (i % 4) * 3.07, y = 1.5 + Math.floor(i / 4) * 2.35, w = 2.9, h = 2.15;
    s.addShape(SH.roundRect, { x, y, w, h, rectRadius: 0.09, fill: { color: P.surface }, line: { type: 'none' } });
    iconCircle(s, x + 0.18, y + 0.18, 0.44, P.amber, ic);
    txt(s, name, { x: x + 0.72, y: y + 0.18, w: w - 0.85, h: 0.44, fontSize: 14, bold: true, color: P.ink, valign: 'middle' });
    txt(s, what, { x: x + 0.18, y: y + 0.75, w: w - 0.36, h: 0.66, fontSize: 11, color: '3F5A63', lineSpacing: 13 });
    s.addShape(SH.roundRect, { x: x + 0.14, y: y + 1.45, w: w - 0.28, h: 0.56, rectRadius: 0.06, fill: { color: 'F3DCDC' }, line: { type: 'none' } });
    txt(s, flag, { x: x + 0.22, y: y + 1.45, w: w - 0.44, h: 0.56, fontSize: 10, bold: true, color: '8E2424', valign: 'middle', lineSpacing: 11.5 });
  });
  banner(s, 6.3, 'Grey cells are formulas.', 'Enter data only in white cells; row 5 of each sheet is an example. A nightly job can later feed the RTM from Jira, Git and the test tool.');
  s.addNotes('Red boxes show what each sheet flags on its own, without anyone having to look for it.');
}

/* ---------- section 5: context ---------- */
function iContext() {
  const s = content('COMMON CONTEXT', 'One Context Pack, loaded the same way by every approved AI tool', true);
  img(s, 'D9-context-layers', 0.5, 1.45, 7.4, 3.7);
  const steps = [['folder', '/ai-context in the repository', 'Versioned and reviewed like code'], ['doc', 'AI-INSTRUCTIONS.md at the root', 'The binding rules, in one place'], ['plug', 'One pointer file per approved tool', 'Each tool loads the same rules'], ['robot', 'Every prompt', 'Stamps the CP version into T11 and the PR']];
  txt(s, 'HOW IT IS LOADED', { x: 8.25, y: 1.5, w: 4.4, h: 0.3, fontSize: 11.5, bold: true, color: P.plum, charSpacing: 0.6 });
  steps.forEach(([ic, t, d], i) => {
    const y = 1.95 + i * 0.95;
    iconCircle(s, 8.25, y + 0.06, 0.48, P.plum, ic);
    txt(s, t, { x: 8.9, y, w: 3.8, h: 0.34, fontSize: 12.5, bold: true, color: P.ink });
    txt(s, d, { x: 8.9, y: y + 0.34, w: 3.8, h: 0.32, fontSize: 11, color: P.muted });
    if (i < 3) s.addShape(SH.line, { x: 8.49, y: y + 0.58, w: 0, h: 0.4, line: { color: P.plum, width: 1.5, dashType: 'dash' } });
  });
  banner(s, 5.55, 'Starter files are ready:', '15 Context Pack files with “OWNER TO COMPLETE” blocks, 10 stage prompts and the PR template. Owners complete them in weeks 3 and 4.', { h: 0.72 });
  txt(s, 'Changes go through T14: pull request, two approvals, version bump, same-day note to all three surface teams.', { x: M, y: 6.42, w: CW, h: 0.4, fontSize: 12, italic: true, color: P.muted });
  s.addNotes('The pointer-file approach means we are not locked into one AI tool. Whatever is on the approved list reads the same rules.');
}
function iCPFiles() {
  const s = content('COMMON CONTEXT', 'Fifteen files, each with a named owner');
  tbl(s, ['File', 'What it pins down', 'Owner'], DD.CONTEXT_PACK.map(r => [r[0], r[1], r[2]]), { colW: [3.3, 7.0, 1.8], fs: 10, boldCols: [0], rowH: 0.34 });
  s.addNotes('Owners: Architect for standards and API rules, Tech Leads for the shared library and golden examples, QA Lead for test standards and data, Security for CP-40.');
}
function iPrompt() {
  const s = content('COMMON CONTEXT', 'The standard prompt: same eight blocks for everyone, every stage', true);
  const blocks = [['ROLE', 'perspective + surface'], ['CONTEXT', 'CP version, binding'], ['INPUT', 'approved IDs + versions'], ['TASK', 'one deliverable only'], ['CONSTRAINTS', 'reuse; never invent'], ['OUTPUT', 'the template to fill'], ['TRACEABILITY', 'IDs on every item'], ['SELF-CHECK', 'assumptions + questions']];
  blocks.forEach(([b, d], i) => {
    const y = 1.5 + i * 0.6;
    s.addShape(SH.roundRect, { x: M, y, w: 4.6, h: 0.5, rectRadius: 0.06, fill: { color: i === 7 ? 'FBF0EC' : P.white }, line: { color: P.line, width: 0.75 } });
    txt(s, String(i + 1), { x: M + 0.1, y, w: 0.35, h: 0.5, fontSize: 12, bold: true, color: P.teal, valign: 'middle', align: 'center' });
    txt(s, b, { x: M + 0.5, y, w: 1.75, h: 0.5, fontSize: 11.5, bold: true, color: i === 7 ? P.rust : P.ink, valign: 'middle' });
    txt(s, d, { x: M + 2.25, y, w: 2.3, h: 0.5, fontSize: 11, color: P.muted, valign: 'middle' });
  });
  const code = ['ROLE:   Senior technical writer, Fixed Assets suite', '        (profile: internal web)', 'CONTEXT: Load /ai-context at CP v1.3. Binding.', 'INPUT:  Register DEP-RR v1.0, DEP-REQ-210..218', 'TASK:   SFVD sections for these screens only', 'CONSTRAINTS: Only data-dictionary fields, CP-23 IDs,', '        CP-21 classes. Missing? List it. Never invent.', 'OUTPUT: Template T02 sections 3 to 7', 'TRACE:  REQ-ID on every screen, field, validation', 'SELF-CHECK: standards, reuse, ASSUMPTIONS,', '        OPEN QUESTIONS. Never answer your own.'];
  s.addShape(SH.roundRect, { x: 5.55, y: 1.5, w: 7.15, h: 4.7, rectRadius: 0.08, fill: { color: P.ink }, line: { type: 'none' } });
  txt(s, 'Example — P-S2 (SFVD)', { x: 5.8, y: 1.62, w: 6.7, h: 0.3, fontSize: 11, bold: true, color: P.amberBright });
  txt(s, code.map((l, i) => ({ text: l, options: { breakLine: i < code.length - 1 } })), { x: 5.8, y: 2.0, w: 6.75, h: 4.05, fontFace: 'Courier New', fontSize: 11.5, color: 'DCE9EC', valign: 'top', lineSpacing: 16.5 });
  banner(s, 6.4, 'All ten stage prompts are written:', 'ai-context/CP-50-prompt-templates/P-S0.md to P-S9.md. Copy, fill the angle brackets, run.', { h: 0.55, fs: 11.5 });
  s.addNotes('Demo suggestion: run the same requirement with and without blocks 2, 5 and 8 and compare the output live.');
}

/* ---------- section 6: implementation ---------- */
function iTools() {
  const s = content('IMPLEMENTING IT HERE', 'Five tools to configure so the process is enforced, not just written');
  const cards = [
    ['jira', 'JIRA', P.teal, ['Issue types: Epic (NF), Change Request, Service Request, Bug', 'Fields: Work Type, Module, Severity, AI Usage, CP Version', 'Statuses mirror the gates; each transition needs a T10']],
    ['git', 'GIT', P.plum, ['Branch: <type>/<ID>-<desc>', 'Commit: [ID] summary — hook rejects missing IDs', 'PR template = T09 with AI usage block', '≤ 400 lines per PR']],
    ['jenkins', 'JENKINS', P.slate, ['PR pipeline: PMD, Sonar gate, coverage, duplication, OpenAPI diff, secret scan, ID check', 'Release pipeline: RTM link check, parity check', 'Warning mode until day 60']],
    ['vial', 'TEST TOOL', P.amber, ['REQ-ID link on every case', 'Automation flag and regression tag', 'Export feeds X01 parity and RTM']],
    ['folder', 'DOC REPOSITORY', P.green, ['/AI-SDLC/templates holds T01–T15', '/<module>/<release>/ per baseline', 'File names carry ID, template and version']]
  ];
  cards.forEach(([ic, label, col, items], i) => {
    const x = M + i * 2.45, w = 2.3;
    s.addShape(SH.roundRect, { x, y: 1.5, w, h: 4.75, rectRadius: 0.1, fill: { color: P.white }, line: { color: col, width: 1.25 } });
    iconCircle(s, x + 0.18, 1.68, 0.48, col, ic === 'vial' ? 'test' : ic);
    txt(s, label, { x: x + 0.18, y: 2.26, w: w - 0.3, h: 0.32, fontSize: 12, bold: true, color: col, charSpacing: 0.6 });
    bullets(s, items, { x: x + 0.18, y: 2.7, w: w - 0.3, h: 3.45, fontSize: 12, lineSpacing: 15, paraSpaceAfter: 10 });
  });
  banner(s, 6.38, 'Owners:', 'Jira admin and Delivery Manager · Tech Leads for Git hooks · DevOps for Jenkins · QA Lead for the test tool · Architect for the document repository.', { h: 0.55, fs: 11.5 });
  s.addNotes('This is where the process stops being a document. Every one of these is a small configuration change; together they make skipping a step visible.');
}
function iJira() {
  const s = content('IMPLEMENTING IT HERE', 'Jira workflow: each status change is a gate with a T10 attached', true);
  const st = [['Intake', 'G0'], ['Requirements', 'G1'], ['Specification', 'G2'], ['Design', 'G3'], ['In development', 'G4'], ['In review', 'G5'], ['In test', 'G6 + G7'], ['Release ready', 'G8'], ['Deployed', 'G9'], ['Closed', 'RTM frozen']];
  st.forEach(([name, g], i) => {
    const row = Math.floor(i / 5), col = i % 5, x = M + col * 2.45, y = 1.6 + row * 1.55;
    s.addShape(SH.chevron, { x, y, w: 2.5, h: 0.95, fill: { color: row ? P.teal : P.slate }, line: { color: 'FFFFFF', width: 1 } });
    txt(s, name, { x: x + 0.35, y, w: 1.85, h: 0.95, fontSize: 12, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
    pill(s, x + 0.55, y + 1.02, 1.3, 0.3, g, P.ink, P.amberBright, 10);
  });
  tbl(s, ['Rule', 'Detail'], [
    ['Transition condition', 'The target status cannot be entered until the T10 record for the previous gate is attached'],
    ['Skips', 'Design may be skipped only for a Minor CR or an SR without contract change; the skip is recorded on the issue'],
    ['Test design', 'A sub-task that opens at G2 and closes at G6, so it runs in parallel with design and development'],
    ['Reporting', 'Gate transitions export to the X01 Gate Log; the Council reviews it monthly']
  ], { y: 4.85, colW: [2.4, 9.7], fs: 11, boldCols: [0], rowH: 0.4 });
  s.addNotes('Ten statuses, ten gates. If the Jira admin can only do one thing in week 1, it is this workflow.');
}
function iJenkins() {
  const s = content('IMPLEMENTING IT HERE', 'Jenkins: deterministic checks that run on every pull request and release');
  const pr = ['Build + unit tests', 'PMD / Checkstyle', 'Sonar quality gate', 'Coverage + duplication', 'OpenAPI diff', 'Secret scan', 'ID check'];
  const rel = ['RTM link check', 'Parity check', 'Version + checksum', 'Promote (after G8)'];
  const row = (label, items, y, col) => {
    txt(s, label, { x: M, y, w: 2.0, h: 0.85, fontSize: 12, bold: true, color: col, valign: 'middle' });
    const w = (CW - 2.1 - (items.length - 1) * 0.12) / items.length;
    items.forEach((t, i) => {
      const x = M + 2.1 + i * (w + 0.12);
      s.addShape(SH.roundRect, { x, y, w, h: 0.85, rectRadius: 0.08, fill: { color: col }, line: { type: 'none' } });
      txt(s, t, { x: x + 0.05, y, w: w - 0.1, h: 0.85, fontSize: 11, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', lineSpacing: 12.5 });
    });
  };
  row('Pull request pipeline', pr, 1.6, P.slate);
  row('Release pipeline', rel, 2.75, P.teal);
  tbl(s, ['Check', 'Threshold', 'Mode until day 60', 'From day 60'], [
    ['Standards and naming', 'Zero violations in new code', 'Warn', 'Block merge'],
    ['Sonar quality gate', 'Zero blocker or critical', 'Warn', 'Block merge'],
    ['Coverage and duplication on new code', 'Agreed by the Council at kick-off', 'Warn', 'Block merge'],
    ['OpenAPI diff', 'No breaking change without version bump', 'Warn', 'Block merge'],
    ['Commit and PR IDs', 'Every commit carries a valid ID', 'Block from day 1', 'Block merge'],
    ['RTM link and parity', 'All in-scope REQs passed; parity reconciles', 'Warn', 'Block release']
  ], { y: 3.95, colW: [3.4, 4.3, 2.2, 2.2], fs: 10.5, boldCols: [0], rowH: 0.42 });
  s.addNotes('Starting in warning mode is deliberate: the pilot tunes thresholds against real code before anything blocks. The one exception is the ID check, which is cheap and blocks from day one.');
}
function iRoles() {
  const s = content('IMPLEMENTING IT HERE', 'What changes for each role from the first pilot sprint', true);
  tbl(s, ['Role', 'Start doing', 'Stop doing', 'Templates'], [
    ['Business Analyst', 'Run the S1 prompt; reconcile every line; get business answers to AI questions', 'Pasting requirements into a free-form prompt', 'T01, T04, T11'],
    ['Technical Writer', 'Look up every field and ID in the dictionary and CP-23', 'Accepting new error codes from AI', 'T02, T11'],
    ['Architect / Tech Lead', 'Merge the contract before code; own CP files; decide classifications', 'Approving designs without a reuse check', 'T03, T04, T10, T14'],
    ['Developer', 'Use P-S4; search CP-20 first; declare AI use in the PR', 'Merging code you cannot explain', 'T09, T11'],
    ['Reviewer', 'Review only work you did not generate; enforce reuse', 'Approving on a green pipeline alone', 'T09, T10'],
    ['QA / Automation', 'Start test design at G2; reconcile counts; deliberate-fail check', 'Waiting for code before designing tests', 'T07, T08, T10'],
    ['Release / DevOps', 'Reconcile scope = notes = RTM; smoke by QA', 'Deploying without a named rollback owner', 'T12, T13']
  ], { colW: [2.05, 4.45, 3.6, 2.0], fs: 10.5, boldCols: [0], rowH: 0.62 });
  s.addNotes('Ask each role in the room to read their own row. This is the practical behaviour change.');
}
function iGovern() {
  const s = content('IMPLEMENTING IT HERE', 'Governance and the numbers we will watch');
  card(s, { x: M, y: 1.46, w: 5.2, h: 4.8, label: 'AI GOVERNANCE COUNCIL', icon: 'users', accent: P.plum, fill: P.surface, bodySize: 11.5,
    items: ['Architect (chair), QA Lead, Delivery Manager, Security Lead', 'Weekly, 30 minutes: open T14 and T15 items, gate exceptions, pilot feedback', 'Monthly: 10% audit of AI-assisted merges against T10; metrics review', 'Quarterly: refresh golden examples and prompts; review thresholds', 'Waivers via T15 only, maximum 90 days, never for schedule pressure alone'] });
  const m = [['RTM completeness', '100%'], ['Automation parity', '100%'], ['Gates with evidence', '100%'], ['AI use declared (T11)', '100%'], ['Unresolved assumptions at a gate', '0'], ['Reviewer = AI operator', '0'], ['Review findings per AI PR', 'Falling'], ['Escaped defects per release', 'Falling'], ['Context Pack lead time', '≤ 5 days']];
  txt(s, 'METRICS (LIVE IN X01)', { x: 6.1, y: 1.5, w: 6.6, h: 0.3, fontSize: 11.5, bold: true, color: P.amber, charSpacing: 0.6 });
  m.forEach(([n, t], i) => {
    const y = 1.92 + i * 0.48;
    s.addShape(SH.roundRect, { x: 6.1, y, w: 6.6, h: 0.42, rectRadius: 0.06, fill: { color: i % 2 ? P.surface2 : P.surface }, line: { type: 'none' } });
    txt(s, n, { x: 6.25, y, w: 4.6, h: 0.42, fontSize: 11.5, color: P.ink, valign: 'middle' });
    txt(s, t, { x: 10.9, y, w: 1.65, h: 0.42, fontSize: 12, bold: true, color: P.teal, valign: 'middle', align: 'right' });
  });
  banner(s, 6.4, 'Baselines are measured in the pilot month.', 'Targets marked “Falling” are judged on direction, not an absolute number.', { h: 0.52, fs: 11.5 });
  s.addNotes('The Metrics sheet in X01 calculates these live from the other sheets; nobody builds a report by hand.');
}
function iRollout() {
  const s = content('IMPLEMENTING IT HERE', 'Roll-out: twelve weeks to an enforced process, delivery never stops', true);
  const ph = [['0', 'Mobilise', 'Weeks 1–2', P.slate, ['Approve PD-AISDLC-01', 'Name the Council', 'Create /ai-context', 'Publish templates'], 'Readiness items 1–6 done'],
    ['1', 'Foundation', 'Weeks 3–4', P.plum, ['Owners complete CP v1.0', 'Jira, Git, Jenkins configured (warn)', 'X01 set up per product line', 'Role training'], 'All readiness items done'],
    ['2', 'Pilot', 'Weeks 5–8', P.teal, ['One NF, one CR, one SR end to end', 'Weekly retrospective', 'Tune thresholds and prompts', 'CP v1.1'], 'Three pilots closed at G9 with full evidence'],
    ['3', 'Enforce', 'Weeks 9–12', P.amber, ['Gates blocking', 'All new work on the process', 'First monthly audit'], 'Audit ≥ 90% checklist compliance'],
    ['4', 'Sustain', 'Ongoing', P.green, ['Quarterly refresh', 'Monthly metrics', 'Existing modules adopt as touched'], 'Metrics on target two quarters']];
  s.addShape(SH.line, { x: 1.0, y: 1.82, w: 11.3, h: 0, line: { color: P.line, width: 2.5 } });
  ph.forEach(([n, t, when, col, items, exit], i) => {
    const x = M + i * 2.45, w = 2.3;
    s.addShape(SH.ellipse, { x: x + w / 2 - 0.22, y: 1.6, w: 0.44, h: 0.44, fill: { color: col }, line: { color: 'FFFFFF', width: 2 } });
    txt(s, n, { x: x + w / 2 - 0.22, y: 1.6, w: 0.44, h: 0.44, fontSize: 12, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
    s.addShape(SH.roundRect, { x, y: 2.2, w, h: 4.05, rectRadius: 0.09, fill: { color: P.white }, line: { color: col, width: 1.25 } });
    txt(s, t, { x: x + 0.15, y: 2.3, w: w - 0.3, h: 0.36, fontSize: 14, bold: true, color: col });
    txt(s, when, { x: x + 0.15, y: 2.66, w: w - 0.3, h: 0.28, fontSize: 10.5, color: P.muted });
    bullets(s, items, { x: x + 0.15, y: 3.02, w: w - 0.28, h: 2.2, fontSize: 11, lineSpacing: 13, paraSpaceAfter: 5 });
    s.addShape(SH.roundRect, { x: x + 0.1, y: 5.3, w: w - 0.2, h: 0.82, rectRadius: 0.06, fill: { color: P.surface }, line: { type: 'none' } });
    txt(s, [{ text: 'Exit: ', options: { bold: true, color: col } }, { text: exit, options: { color: P.ink } }], { x: x + 0.18, y: 5.3, w: w - 0.36, h: 0.82, fontSize: 10.5, valign: 'middle', lineSpacing: 12.5 });
  });
  banner(s, 6.4, 'Delivery continues throughout.', 'New work adopts the process from the pilot; existing modules adopt it as they are touched.', { h: 0.52, fs: 11.5 });
  s.addNotes('The only hard stop is the move to blocking gates at week 9, and only after the pilot has tuned them.');
}
function iPilot() {
  const s = content('IMPLEMENTING IT HERE', 'The pilot: three real work items, one per work type');
  const p = [['NF', 'New feature', P.teal, 'A small feature on a surface without a golden example yet, so the pilot also produces CP-99 for it', ['All ten stages', 'Golden example created', 'Cycle time per stage baselined']],
    ['CR', 'Change request', P.plum, 'A Major CR that touches a calculation or contract, to exercise T04, delta SFVD and regression selection', ['T04 completed before approval', 'SME re-derivation done', 'Mobile N-1 verified']],
    ['SR', 'Issue or SR', P.rust, 'One P3 defect and one data-correction SR, to exercise manual RCA and scripted change', ['Failing test before fix', 'RCA names a missed gate', 'Before / after evidence']]];
  p.forEach(([code, t, col, sel, measure], i) => {
    const x = M + i * 4.18, w = 3.94;
    s.addShape(SH.roundRect, { x, y: 1.5, w, h: 4.7, rectRadius: 0.1, fill: { color: P.white }, line: { color: col, width: 1.5 }, shadow: sh({ opacity: 0.08, blur: 7, offset: 1 }) });
    s.addShape(SH.roundRect, { x: x + 0.22, y: 1.72, w: 0.8, h: 0.48, rectRadius: 0.1, fill: { color: col }, line: { type: 'none' } });
    txt(s, code, { x: x + 0.22, y: 1.72, w: 0.8, h: 0.48, fontSize: 15, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
    txt(s, t, { x: x + 1.15, y: 1.72, w: w - 1.3, h: 0.48, fontSize: 15, bold: true, color: P.ink, valign: 'middle' });
    txt(s, 'Choose', { x: x + 0.22, y: 2.38, w: w - 0.44, h: 0.28, fontSize: 11, bold: true, color: col });
    txt(s, sel, { x: x + 0.22, y: 2.66, w: w - 0.44, h: 1.2, fontSize: 11.5, color: '3F5A63', lineSpacing: 14 });
    txt(s, 'Success looks like', { x: x + 0.22, y: 3.95, w: w - 0.44, h: 0.28, fontSize: 11, bold: true, color: col });
    bullets(s, measure, { x: x + 0.22, y: 4.28, w: w - 0.44, h: 1.8, fontSize: 11.5, lineSpacing: 14, paraSpaceAfter: 6 });
  });
  banner(s, 6.38, 'Weekly pilot retro:', 'every rejection, waiver and context gap becomes a change to the Context Pack, a prompt or a checklist before week 9.', { h: 0.55, fs: 11.5 });
  s.addNotes('Between them, the three pilots must touch all three surfaces: microservices, mobile and internal web.');
}
function iFirst30() {
  const s = content('IMPLEMENTING IT HERE', 'The first 30 days: owners and dates', true);
  tbl(s, ['#', 'Action', 'Owner', 'By'], [
    ['1', 'Approve PD-AISDLC-01 and name the four Council members', 'Architect, Delivery Manager', 'Week 1'],
    ['2', 'Create /ai-context and copy the starter pack; commit AI-INSTRUCTIONS.md', 'Architect', 'Week 1'],
    ['3', 'Publish T01–T15 and X01 in the document repository', 'Architect', 'Week 1'],
    ['4', 'Configure Jira issue types, fields and gate statuses', 'Jira admin, Delivery Manager', 'Week 2'],
    ['5', 'Enable branch naming and the commit-message ID check; install the PR template', 'Tech Leads', 'Week 2'],
    ['6', 'Approved AI tool list and AI data rules in CP-40', 'Security Lead', 'Week 2'],
    ['7', 'Complete CP-10, CP-11, CP-12, CP-22, CP-23', 'Architect', 'Week 3'],
    ['8', 'Complete CP-20 shared library index and CP-21 style guide', 'Tech Leads, UI Lead', 'Week 3'],
    ['9', 'Complete CP-30 and CP-31; seed fixtures scripted', 'QA Lead', 'Week 4'],
    ['10', 'Add Jenkins quality and release stages in warning mode', 'DevOps', 'Week 4'],
    ['11', 'Role-based hands-on training (one session per role)', 'Architect, QA Lead', 'Week 4'],
    ['12', 'Select the three pilot items and agree success criteria', 'Product Owner, Council', 'Week 4']
  ], { colW: [0.5, 7.0, 3.1, 1.5], fs: 11, boldCols: [], center: [0, 3], rowH: 0.42 });
  s.addNotes('Every line has one owner. This table is the readiness checklist from section 11.1, put into a calendar.');
}
function iClose() {
  const s = slide('CLOSING');
  s.addText('CLOSING', PH.closeKick);
  s.addText('What we need from you this week', PH.closeTitle);
  s.addShape(SH.ellipse, { x: 10.4, y: 5.2, w: 4.0, h: 4.0, fill: { color: P.deep }, line: { type: 'none' } });
  const asks = [['1', 'Read your role’s sections of PD-AISDLC-01', 'Section 1.3 lists them. Raise questions before approval.'],
    ['2', 'Owners: start your Context Pack files', 'Every file has OWNER TO COMPLETE blocks and a week 3–4 deadline.'],
    ['3', 'Propose a pilot item', 'One NF, one CR, one SR; between them all three surfaces.']];
  let y = 1.75;
  asks.forEach(([n, t, d]) => {
    s.addShape(SH.roundRect, { x: M, y, w: 7.4, h: 1.08, rectRadius: 0.09, fill: { color: '17404C' }, line: { type: 'none' } });
    s.addShape(SH.ellipse, { x: M + 0.24, y: y + 0.28, w: 0.52, h: 0.52, fill: { color: P.amberBright }, line: { type: 'none' } });
    txt(s, n, { x: M + 0.24, y: y + 0.28, w: 0.52, h: 0.52, fontSize: 15, bold: true, color: P.ink, align: 'center', valign: 'middle' });
    txt(s, t, { x: M + 0.94, y: y + 0.16, w: 6.3, h: 0.4, fontSize: 14.5, bold: true, color: 'FFFFFF', valign: 'middle' });
    txt(s, d, { x: M + 0.94, y: y + 0.56, w: 6.3, h: 0.4, fontSize: 11.5, color: 'A9C4CB' });
    y += 1.2;
  });
  s.addShape(SH.roundRect, { x: 8.3, y: 1.75, w: 4.4, h: 3.48, rectRadius: 0.1, fill: { color: 'FFFFFF' }, line: { type: 'none' } });
  iconCircle(s, 8.56, 1.97, 0.46, P.rust, 'scale');
  txt(s, 'DECISIONS FOR THE COUNCIL', { x: 9.16, y: 1.97, w: 3.4, h: 0.46, fontSize: 11.5, bold: true, color: P.rust, charSpacing: 0.6, valign: 'middle' });
  bullets(s, ['Approve PD-AISDLC-01 v1.0', 'Coverage and duplication thresholds', 'The approved AI tool list', 'Pilot items and start date', 'P1 / P2 defect boundary confirmed'],
    { x: 8.58, y: 2.6, w: 3.9, h: 2.5, fontSize: 12, color: P.ink, lineSpacing: 15, paraSpaceAfter: 8 });
  s.addShape(SH.roundRect, { x: M, y: 5.5, w: 12.1, h: 1.0, rectRadius: 0.1, fill: { color: P.amberBright }, line: { type: 'none' } });
  txt(s, 'The process is written, the templates are ready and the tooling plan is clear. What makes it real is every one of us using it on the next piece of work.',
    { x: M + 0.4, y: 5.5, w: 11.3, h: 1.0, fontSize: 14, bold: true, color: '3A2A08', valign: 'middle', lineSpacing: 18 });
  s.addNotes('End on the asks. Collect pilot proposals before people leave.');
}

/* ---------- build ---------- */
(async () => {
  await renderIcons(ICON_SPEC);
  iCover(); iAgenda(); iPackage();
  divider('01', 'The process in one picture', 'Stages, modes, AI boundaries, and what goes in and out of each stage', 'The process');
  iMaster(); iModes(); iBoundaries(); iAnatomy(); iStageIO();
  divider('02', 'Three work types, three paths', 'New feature, change request, issue fix and service request', 'Work types');
  iRouting(); iFlowNF(); iFlowCR(); iFlowSR(); iSeverity(); iTailor();
  divider('03', 'Proving AI output is valid', 'Four levels, ten techniques, one universal checklist', 'Validation');
  iLevels(); iTechniques(); iUniversal(); iDomain();
  divider('04', 'Documents and templates', 'Which document, at which stage, filled by whom', 'Documents');
  iDocMap(); iCatalogue(); iTracker();
  divider('05', 'Common context', 'One Context Pack and one prompt structure for everyone', 'Common context');
  iContext(); iCPFiles(); iPrompt();
  divider('06', 'Implementing it here', 'Tools, roles, governance, roll-out, pilot and the first 30 days', 'Implementation');
  iTools(); iJira(); iJenkins(); iRoles(); iGovern(); iRollout(); iPilot(); iFirst30(); iClose();
  const out = require('path').join(__dirname, '..', 'presentation', 'AI-SDLC-Process-Implementation.pptx');
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log('written ' + out);
})();
