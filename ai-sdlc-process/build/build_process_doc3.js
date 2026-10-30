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
    ...numbered(D.REJECTION_STEPS),
    H2('6.6  Evidence to retain'),
    table(['Evidence', 'Where it lives', 'Retention'], D.EVIDENCE, [3800, 3500, CW - 7300])
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
    ...bullets(D.CP_LOADING),
    H2('7.4  Change control'),
    ...numbered(D.CP_CHANGE),
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
    table(['ID', 'Must appear in'], D.ID_WHERE, [2300, CW - 2300], { boldCols: [0] }),
    H2('8.4  Automated traceability checks'),
    ...bullets(D.ID_CHECKS)
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
    table(['Item', 'Definition'], D.COUNCIL, [2300, CW - 2300], { boldCols: [0] }),
    H2('9.4  Waivers and escalation'),
    ...bullets(D.WAIVER_RULES),
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
    table(['Artifact', 'Where', 'What it enforces'], D.CONFIG_ARTIFACTS, [2900, 2900, CW - 5800], { boldCols: [0] }),
    H2('10.4  Storage, naming and versioning'),
    table(['Document', 'Location', 'File name', 'Versioning'], D.STORAGE, [2200, 2700, 2800, CW - 7700], { boldCols: [0] })
  ];
}

/* ======================= 11 IMPLEMENTATION ======================= */
function sec11() {
  return [
    H1('11  Implementation'),
    P('The process is introduced in phases so delivery does not stop. Gates start in warning mode and become blocking only after the pilot has tuned them. The implementation deck that accompanies this document explains each step to the team.'),
    H2('11.1  Readiness checklist'),
    checklist(D.READINESS, { title: 'Ready to start the pilot when all are true', evidence: true }),
    H2('11.2  Roll-out phases'),
    table(['Phase', 'Weeks', 'Outcomes', 'Exit criterion'], D.PHASES, [1500, 900, 4600, CW - 7000], { boldCols: [0] }),
    H2('11.3  Jira workflow and gates'),
    table(['Jira status', 'Stage', 'Transition requires'], D.JIRA_FLOW, [2300, 1600, CW - 3900], { boldCols: [0] })
  ];
}

/* ======================= APPENDICES ======================= */
function appA() {
  const ex = (title, intro, rows) => [H2(title), P(intro), table(['Stage', 'What happened', 'Artifact', 'Mode'], rows.map(r => [r[0], r[1], r[2], [modeRuns(r[3])]]), [800, 5300, 2100, CW - 8200], { centerCols: [0] })];
  return [
    H1('Appendix A  Worked Examples'),
    callout('Illustrative only', ['These examples show how the process is applied. IDs, counts and findings are illustrative, not records of real work.'], { color: COL.slate, fill: 'EEF3F5' }),
    ...ex(D.EXAMPLES[0].title, D.EXAMPLES[0].intro, D.EXAMPLES[0].rows),
    ...ex(D.EXAMPLES[1].title, D.EXAMPLES[1].intro, D.EXAMPLES[1].rows),
    ...ex(D.EXAMPLES[2].title, D.EXAMPLES[2].intro, D.EXAMPLES[2].rows),
    ...ex(D.EXAMPLES[3].title, D.EXAMPLES[3].intro, D.EXAMPLES[3].rows)
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
