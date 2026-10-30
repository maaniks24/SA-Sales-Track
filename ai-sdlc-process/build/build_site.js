/* Generates the AI SDLC Process Portal.
   node build_site.js            -> ../site/ (hosted build: everything works, including downloads)
   node build_site.js --preview  -> <outdir> given as 2nd arg (claude.ai preview: downloads replaced by an explanation) */
const fs = require('fs'); const path = require('path');
const L = require('./site_lib');
const { D, T, ROOT, esc, attr, TPL, ST, link, info, H2, H3, P, UL, OL, table, callout, figure, dl, view, ICON, TFILE, tplPage, stagePage, chip, modeText, modeOf } = L;
const PREVIEW = process.argv.includes('--preview');
L.setPreview(PREVIEW);
const OUT = PREVIEW ? path.resolve(process.argv[process.argv.indexOf('--preview') + 1]) : path.join(ROOT, 'site');

/* ---------------- navigation model ---------------- */
const NAV = [
  ['Start', [['home', 'Overview', '⌂'], ['start-here', 'How to use this portal', '?'], ['quick-ref', 'Quick reference card', 'QR']]],
  ['Process', [['principles', 'Principles, modes and AI rules', 'P'], ['process-flow', 'Master flow and stage loop', 'F'], ['classify', 'Classify work and pick a path', 'C']]],
  ['Stages', D.STAGES.map(s => [stagePage(s.id), s.short === 'SFVD' ? 'SFVD' : s.short, s.id])],
  ['Work-type flows', [['flow-nf', 'New application or feature', 'NF'], ['flow-cr', 'Enhancement / change request', 'CR'], ['flow-sr', 'Issue fix / service request', 'SR']]],
  ['Assurance', [['validation', 'Validating AI output', 'V'], ['traceability', 'Traceability and IDs', 'ID']]],
  ['Common context', [['context-pack', 'Context Pack files', 'CP'], ['prompts', 'Stage prompt templates', 'PR']]],
  ['People', [['roles', 'Roles and RACI', 'R'], ['governance', 'Governance and metrics', 'G']]],
  ['Documents', [['library', 'Document library', 'DL'], ['process-doc', 'Process definition', 'PD'], ['deck', 'Implementation deck', 'PPT'], ['tracker', 'Tracker workbook', 'X01']]],
  ['Templates', T.map(t => [tplPage(t.id), t.title.replace(/ —.*/, ''), t.id])],
  ['Roll-out', [['implementation', 'Implementing the process', 'IM'], ['examples', 'Worked examples', 'EX'], ['glossary', 'Glossary', 'GL']]]
];
const TITLE = {}; NAV.forEach(([g, items]) => items.forEach(([id, label]) => { TITLE[id] = { label, group: g }; }));
const chev = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
function navHtml() {
  return NAV.map(([g, items]) => `<div class="nav-group${g === 'Templates' ? ' closed' : ''}" data-group="${attr(g)}"><button type="button" aria-expanded="${g === 'Templates' ? 'false' : 'true'}">${esc(g)}${chev}</button><ul>${items.map(([id, label, tag]) => `<li><a href="#${id}" data-page="${id}" data-title="${attr(label)}" data-group="${attr(g)}"><span class="tag">${esc(tag)}</span><span>${esc(label)}</span></a></li>`).join('')}</ul></div>`).join('');
}
function page(id, o, body) {
  const t = TITLE[id] || { label: o.title, group: '' };
  return `<section class="page" id="p-${id}" data-title="${attr(t.label)}" data-group="${attr(t.group)}"${id === 'home' ? '' : ' hidden'} aria-labelledby="h-${id}">
<div class="crumbs" aria-label="Breadcrumb"></div>
<div class="page-head">${o.eyebrow ? `<div class="eyebrow">${esc(o.eyebrow)}</div>` : ''}<h1 id="h-${id}">${esc(o.title)}</h1>${o.lede ? `<p class="lede">${link(o.lede)}</p>` : ''}${o.meta || ''}</div>
${body}
<nav class="pager" aria-label="Previous and next page"></nav></section>`;
}

/* ---------------- figures with hotspots ---------------- */
const D1 = () => figure('D1-master-flow', 'Master AI SDLC flow: ten stages, each closed by a gate', [1300, 1090],
  [[150, 110, 340, 160], [530, 110, 340, 160], [910, 110, 340, 160], [150, 330, 340, 160], [530, 330, 340, 160], [910, 330, 340, 160], [150, 545, 720, 160], [150, 790, 340, 160], [530, 790, 340, 160], [910, 790, 340, 160]]
    .map((r, i) => [...r, stagePage('S' + i), `Open S${i} ${ST['S' + i].name}`]));
const D3 = () => figure('D3-work-type-routing', 'Classifying a work item and choosing its path', [1300, 1060],
  [[300, 138, 700, 118, 'stage-s0', 'Open S0 Intake and Classification'], [8, 756, 304, 200, 'flow-nf', 'Open the new feature flow'], [333, 756, 304, 200, 'flow-cr', 'Open the change request flow'], [658, 756, 304, 200, 'flow-sr', 'Open the issue fix flow'], [983, 756, 304, 200, 'flow-sr', 'Open the service request flow']]);
const D10 = () => {
  const ids = ['T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08', 'T09', 'T10', 'T11', 'T12', 'T13', 'T14', 'T15', 'X01'];
  const cw = (1800 - 470 - 10) / 10;
  return figure('D10-document-map', 'Which document is produced, used and signed at each stage', [1800, 998],
    ids.map((id, r) => [0, 64 + r * 54, 470, 54, tplPage(id), `Open ${id} ${TPL[id].name}`]).concat(D.STAGES.map((s, i) => [470 + i * cw, 4, cw, 54, stagePage(s.id), `Open ${s.id} ${s.name}`])));
};
const legend = () => `<div class="legend" aria-label="Mode legend">${Object.values(D.MODES).map(m => `${chip(m.code)}<span>${esc(m.name)}</span>`).join('')}<span class="gate" data-tip-title="Gate" data-tip="A recorded decision (T10) that closes a stage. Nothing moves to the next stage until its gate is signed.">Gn</span><span>Gate</span></div>`;

/* ---------------- help content (also the start-here page) ---------------- */
const KEYS = [['/', 'Jump to search'], ['?', 'Open this help'], ['[ and ]', 'Previous and next page'], ['← and →', 'Previous and next slide in the deck viewer'], ['Esc', 'Close a dialog, the menu or a tooltip']];
function helpBody() {
  return `${H2('Finding your way')}
<ul class="clean"><li>The <b>menu on the left</b> follows the process: start, process, the ten stages, the three work-type flows, assurance, context, people, documents and templates. On a phone, open it with the menu button.</li>
<li><b>Search</b> at the top finds stages, templates, roles and terms. Try “S4”, “T04”, “parity” or “developer”.</li>
<li>Every page has <b>Previous</b> and <b>Next</b> links at the bottom, so you can read the whole process in order.</li>
<li>Diagrams with highlighted areas are <b>clickable</b>: click a stage box on the master flow to open that stage.</li></ul>
${H2('Tooltips and links')}
<p>Codes in the text are live. Hover over or tap them to see what they mean, and click to open them.</p>
${table(['You see', 'It means', 'Click to'], [
  [chip('AI-G') + ' ' + chip('M'), 'How that row is produced: AI-generated, manual, AI-assisted, automated, or AI not permitted', 'Hover for the definition'],
  ['<a class="ref" href="#template-t04">T04</a>', 'A template', 'Open its online view and download'],
  ['<a class="ref" href="#stage-s2">S2</a> <a class="ref" href="#stage-s2">G2</a>', 'A stage and its gate', 'Open the stage page'],
  ['<a class="ref" href="#context-pack">CP-23</a>', 'A Context Pack file', 'Open the Context Pack page'],
  ['<a class="ref" href="#validation">V3</a> <span class="tip-term">L3</span>', 'A validation technique or verification level', 'Open the validation page'],
  [`<button type="button" class="info" aria-label="Example">i</button>`, 'An explanation of the section', 'Hover or tap']], { raw: [0, 1, 2] })}
${H2('View or download')}
<ul class="clean"><li><b>View online</b> opens a read-only copy in the portal: use it to look something up.</li>
<li><b>Download</b> saves the Word, Excel or PowerPoint file: use it when you are going to fill it in and attach it to Jira.</li>
<li>Each stage page lists the documents for that stage on the right, so you never need to hunt for a template.</li></ul>
${PREVIEW ? callout('note', 'You are viewing the preview', '<p>This copy runs inside claude.ai, which blocks file downloads. Viewing works everywhere; downloads work on the hosted portal.</p>') : ''}
${H2('Checklists on this site')}
<p>Ticks on stage checklists are saved in your own browser only, so you can use them as a personal self-check. They are not a gate record: record the official decision in <a class="ref" href="#template-t10">T10</a>.</p>
${H2('Keyboard shortcuts')}
${table(['Key', 'Action'], KEYS.map(([k, a]) => [`<kbd>${esc(k)}</kbd>`, esc(a)]), { raw: [0, 1] })}`;
}

/* ---------------- pages: start ---------------- */
function home() {
  const quick = [['flow-nf', 'Starting a new feature', 'All ten stages, step by step, with who does what.'], ['flow-cr', 'Handling a change request', 'Impact analysis first, then delta documents and regression.'],
    ['flow-sr', 'Fixing an issue or SR', 'Triage, manual root cause, and what severity allows.'], ['library', 'Looking for a template', 'Filter every document by stage and work type, then view or download.'],
    ['validation', 'Reviewing AI output', 'The four levels, ten techniques and the acceptance checklist.'], ['template-t10', 'Closing a gate', 'The gate checklist and sign-off for every stage.']];
  return page('home', { title: 'AI SDLC Process Portal', eyebrow: 'Fixed Assets Suite · PD-AISDLC-01', lede: 'One place to read the process, check a stage, and open or download the template you need, without switching between documents.' },
  `<div class="welcome" id="welcome"><p><b>New here?</b> Read <a href="#start-here">How to use this portal</a>, or press <kbd>?</kbd> at any time for help.</p><button type="button" class="close" id="welcome-x" aria-label="Dismiss">×</button></div>
${H2('What do you need to do?')}
<div class="grid g3">${quick.map(([h, t, d]) => `<a class="card" href="#${h}"><h3>${esc(t)}</h3><p>${esc(d)}</p></a>`).join('')}</div>
${H2('The process at a glance', 'Click any stage box to open that stage. Colours show who produces each part.')}
${D1()}${legend()}
${H2('Start from your role')}
${table(['If you are…', 'Read first', 'Then use'], D.AUDIENCE.map(r => [r[0], r[1].replace(/Sections? /g, 'Section '), r[2]]), { key: [0] })}
${P('Section numbers refer to the Word process definition (PD-AISDLC-01); every section has a page in this portal. See Process definition in the menu for the mapping.')}`);
}
function startHere() { return page('start-here', { title: 'How to use this portal', eyebrow: 'Help', lede: 'A two-minute guide to finding things, reading the codes, and viewing or downloading documents.' }, helpBody()); }
function quickRef() {
  const rows = D.STAGES.map(s => {
    const ai = s.activities.filter(a => a[2] === 'AG' || a[2] === 'AA')[0];
    return [`<a href="#${stagePage(s.id)}"><b>${s.id}</b> ${esc(s.short)}</a>`, ai ? modeText(modeOf(ai[2])) + ' ' + esc(ai[0]) : '—', `<ul class="clean">${s.checklist.slice(0, 3).map(c => `<li>${link(c)}</li>`).join('')}</ul>`, `<span class="gate" data-tip="${attr(s.gateText)}">${s.gate}</span> ${esc(s.raci.A)}`];
  });
  return page('quick-ref', { title: 'Quick reference card', eyebrow: 'Start', lede: 'One row per stage: the main AI step, the three checks people most often miss, and who signs the gate.' },
    table(['Stage', 'Main AI step', 'Top three human checks', 'Gate · signs'], rows, { raw: [0, 1, 2, 3] }));
}

/* ---------------- pages: process ---------------- */
function principles() {
  const ver = { 'M': 'Role checklist and gate (L2, L4)', 'AI-G': 'All four levels (L1 to L4) and the universal checklist', 'AI-A': 'The person confirms every AI suggestion before acting on it', 'AUTO': 'Result attached to the gate as evidence', 'AI-X': 'Not applicable: AI must not be used' };
  const perm = (code, title, items) => `<div class="card"><div class="k">${chip(code)} ${esc(title)}</div><ul class="clean">${items.map(i => `<li>${link(i)}</li>`).join('')}</ul></div>`;
  return page('principles', { title: 'Principles, modes and AI rules', eyebrow: 'Process', lede: 'Five principles, five modes that tag every input, activity and output, and the boundary of what AI may do.' },
  `${H2('Five principles')}${OL(D.PRINCIPLES.map(([a, b]) => a + ' ' + b))}
${H2('Process modes', 'Every row on every stage page carries one of these tags. It tells you who produces the item and how much checking it needs.')}
${table(['Mode', 'Name', 'Meaning', 'Verification required'], Object.values(D.MODES).map(m => [chip(m.code), esc(m.name), esc(m.desc), link(ver[m.code])]), { raw: [0, 1, 2, 3] })}
${callout('note', 'A combined tag such as ' + chip('AI-G') + ' → ' + chip('M'), '<p>AI generates the draft; a person then validates, completes and owns it. It is only usable after the person’s step.</p>')}
${H2('What AI may and may not do')}
<div class="grid g3">${perm('AI-G', 'Generate, then validate', D.AI_PERMISSIONS.AG)}${perm('AI-A', 'Assist only', D.AI_PERMISSIONS.AA)}${perm('AI-X', 'Not permitted', D.AI_PERMISSIONS.NA)}</div>
${H2('Rules for every AI interaction')}${UL(D.AI_RULES)}`);
}
function processFlow() {
  const sum = D.STAGES.map(s => { const o = s.outputs[0]; return [`<a href="#${stagePage(s.id)}"><b>${s.id}</b> ${esc(s.name)}</a>`, link(s.inputs[0][0]), link(o[0] + ' (' + o[1] + ')'), modeText(modeOf(o[2]) + (o[2] === 'AG' ? ' → M' : '')), `<span class="gate" data-tip="${attr(s.gateText)}">${s.gate}</span>`, esc(s.raci.A)]; });
  return page('process-flow', { title: 'Master flow and stage loop', eyebrow: 'Process', lede: 'Ten stages take every piece of work from intake to a closed, audited release. Test design (S6) runs in parallel with design and development from the moment the SFVD is baselined.' },
  `${H2('The master flow', 'Click a stage to open it.')}${D1()}
${H2('The loop every stage follows')}${figure('D2-stage-anatomy', 'The loop every stage follows, including rejection and context-gap handling', [1300, 640])}
${OL(['Approved input: only the signed output of the previous gate, identified by ID and version.', 'Context and prompt: the current Context Pack version and the stage prompt from CP-50.', 'AI draft: output in the standard template, with every assumption and open question declared.', 'Validate: L1 automated checks, L2 role checklist, L3 independent review.', 'Gate sign-off: L4, the gate owner records the decision in T10; the output becomes the next stage input.'])}
${P('If the output is rejected, the reason is recorded and the stage repeats. If the cause was missing context, the AI operator also raises T14 so the error is not generated for anyone else.')}
${H2('Stage summary')}${table(['Stage', 'Key input', 'Key output', 'Output mode', 'Gate', 'Accountable'], sum, { raw: [0, 1, 2, 3, 4, 5], center: [4] })}
${H2('Tailoring by work type', 'Full: the stage runs as defined. Delta: only affected parts. Conditional: only when the stated trigger applies. Light: a reduced form.')}
${table(['Stage', 'New feature', 'Change request', 'Issue / SR', 'Notes for CR', 'Notes for issue / SR'], D.TAILORING.map(r => [`<a href="#${stagePage(r[0])}">${r[0]} ${esc(ST[r[0]].short)}</a>`, D.TAILOR_KEY[r[1]], D.TAILOR_KEY[r[2]], D.TAILOR_KEY[r[3]], link(r[5]), link(r[6])]), { raw: [0, 4, 5], center: [1, 2, 3] })}`);
}
function classify() {
  return page('classify', { title: 'Classify work and pick a path', eyebrow: 'Process', lede: 'Every work item is classified at intake (S0). The work type decides which stages apply and in what depth. Classification is manual: AI may summarise a request but never classifies it.' },
  `${D3()}
${H2('Classification rules')}${table(['Question asked at intake', 'Answer', 'Classify as'], D.CLASS_RULES, { key: [2] })}
${callout('gate-box', 'Unsure?', '<p>The Architect decides within one working day. Default to the stricter path.</p>')}
${H2('The three work types')}
<div class="grid g3">${Object.values(D.WORK_TYPES).map(w => `<a class="card" href="#flow-${w.code.toLowerCase()}"><div class="k">${w.code}</div><h3>${esc(w.name)}</h3><p>${esc(w.when)}</p><p class="small">e.g. ${esc(w.examples.join('; '))}</p></a>`).join('')}</div>`);
}

/* ---------------- stage pages ---------------- */
function docsFor(stageId) {
  const rows = [];
  Object.entries(D.DOC_MAP).forEach(([id, m]) => {
    const k = typeof m === 'string' ? 'A' : m[stageId]; if (!k) return;
    rows.push({ id, role: k === 'P' ? 'Produced or updated here' : k === 'U' ? 'Used as an input' : k === 'S' ? 'Gate sign-off for this stage' : 'When needed at any stage', k });
  });
  const ord = { P: 0, S: 1, U: 2, A: 3 }; rows.sort((a, b) => ord[a.k] - ord[b.k]);
  return rows;
}
function docItem(id, role) {
  const t = TPL[id], file = id === 'X01' ? 'templates/X01-AI-SDLC-Tracker.xlsx' : TFILE[id];
  return `<li><div class="t"><a class="ref" href="#${tplPage(id)}" data-tip="${attr(t.purpose)}">${id}</a> ${esc(t.name)}</div><div class="r">${esc(role)}</div><div class="btns">${view(tplPage(id), 'View')}${dl(file, 'Download')}</div></li>`;
}
function stagePageHtml(s, i) {
  const tail = D.TAILORING.find(r => r[0] === s.id);
  const applies = `<div class="applies">${['New feature', 'Change request', 'Issue / SR'].map((w, k) => `<span tabindex="0" data-tip-title="${attr(w)}" data-tip="${attr(k === 0 ? (D.TAILOR_KEY[tail[1]] + ': ' + tail[4]) : k === 1 ? tail[5] : tail[6])}">${esc(w)}: <b>${D.TAILOR_KEY[tail[k + 1]]}</b></span>`).join('')}</div>`;
  const meta = `<div class="meta"><span><span class="gate" tabindex="0" data-tip-title="Gate ${s.gate}" data-tip="${attr(s.gateText)}">${s.gate}</span></span><span>Accountable <b>${esc(s.raci.A)}</b></span><span>Responsible <b>${esc(s.raci.R)}</b></span></div>${applies}`;
  const stepper = `<nav class="stepper" aria-label="Stages">${D.STAGES.map(x => `<a href="#${stagePage(x.id)}" class="${x.id === s.id ? 'on' : ''}" data-tip="${attr(x.id + ' ' + x.name)}"${x.id === s.id ? ' aria-current="step"' : ''}>${x.id}</a>`).join('')}</nav>`;
  const actId = 'act-' + s.id.toLowerCase();
  const acts = table(['#', 'Activity', 'Performed by', 'Mode'], s.activities.map((a, k) => ({ attrs: ` data-mode="${modeOf(a[2])}"`, cells: [String(k + 1), a[0], a[1], modeOf(a[2])] })), { mode: [3], center: [0, 3], id: actId });
  const filters = `<div class="filters" data-for="${actId}" role="group" aria-label="Filter activities by mode">Show <button type="button" class="chipbtn" data-mode="all" aria-pressed="true">All</button><button type="button" class="chipbtn" data-mode="M" aria-pressed="false">Manual only</button><button type="button" class="chipbtn" data-mode="ai" aria-pressed="false">AI only</button><button type="button" class="chipbtn" data-mode="AUTO" aria-pressed="false">Automated</button></div>`;
  const outs = table(['Output', 'Template / location', 'Mode', 'Owner'], s.outputs.map(o => [o[0], o[1], modeOf(o[2]) + (o[2] === 'AG' ? ' → M' : o[2] === 'AA' ? ' → M' : ''), o[3]]), { mode: [2] });
  const val = table(['Level', 'What is applied in this stage'], [
    ['L1 Automated', s.auto.join('; ') + '.'], ['L2 + L3 Techniques', s.techniques.map(t => t + ' ' + L.TECH[t][1]).join(', ') + '.'], ['How to apply', s.validationNote], ['L4 Sign-off', 'Gate ' + s.gate + ' recorded in T10 by ' + s.raci.A + '.']], { key: [0] });
  const chk = `<ul class="check" data-key="${s.id}">${s.checklist.map((c, k) => `<li><input type="checkbox" id="chk-${s.id}-${k}"><label for="chk-${s.id}-${k}">${link(c)}</label></li>`).join('')}</ul><div class="check-foot"><span class="done"></span><div class="progress" aria-hidden="true"><i></i></div><button type="button" class="btn reset">Clear ticks</button></div>`;
  const docs = docsFor(s.id).map(r => docItem(r.id, r.role)).join('');
  const prompt = `<div class="card"><h3>Stage prompt</h3><p class="small">Use the approved prompt for this stage instead of writing your own.</p><div class="btns"><a class="btn" href="#prompts" data-tip="Open the prompt templates page">${ICON.eye}P-${s.id}</a></div></div>`;
  const body = `${stepper}<div class="with-aside"><div style="min-width:0">
${H2('Entry criteria')}${UL(s.entry)}
${H2('Inputs given to AI', 'What goes into this stage, where it comes from, and who prepares it.')}${table(['Input', 'Source / template', 'Prepared by', 'Mode'], s.inputs.map(r => [r[0], r[1], r[2], modeOf(r[3])]), { mode: [3], center: [3] })}
${H2('Activities', 'Use the filter to see only the manual steps or only the AI steps.')}${filters}${acts}
${H2('Outputs')}${outs}
${H2('How the AI output is validated', 'The same four levels close every gate. This stage applies the checks and techniques below.')}${val}
${H2('Manual review checklist', 'Your ticks are saved in this browser only. The official record is T10.')}${chk}
${callout('gate-box', `<span class="gate">${s.gate}</span> Exit gate`, `<p>${link(s.gateText)}</p><p><b>AI rule:</b> ${link(s.aiRule)}</p>`)}
${H2('RACI')}${table(['Responsible', 'Accountable', 'Consulted', 'Informed'], [[s.raci.R, s.raci.A, s.raci.C, s.raci.I]])}
</div><aside class="aside" aria-label="Documents for this stage"><div class="card"><h3>Documents for ${s.id}</h3><ul class="doclist">${docs}</ul></div>${prompt}</aside></div>`;
  return page(stagePage(s.id), { title: `${s.id} ${s.name}`, eyebrow: `Stage ${i + 1} of 10`, lede: s.purpose, meta }, body);
}

/* ---------------- work-type flows ---------------- */
const stepsTable = rows => table(['#', 'Stage', 'Activity', 'Who', 'Mode', 'Output', 'Gate'], rows.map((r, i) => [String(i + 1), r[0], r[1], r[2], r[3], r[4], r[5] || '']), { mode: [4], center: [0, 1, 6] });
function flowNF() {
  return page('flow-nf', { title: 'New application or feature', eyebrow: 'Work-type flow · NF', lede: D.WORK_TYPES.NF.when + ' All ten stages run in full.' },
  `${figure('D4-flow-new-feature', 'New feature swimlane: roles, stages, modes and gates', [1800, 1042])}
${H2('Step by step')}${stepsTable(D.STEPS_NF)}${H2('Rules specific to new features')}${UL(D.RULES_NF)}
${H2('Examples')}${UL(D.WORK_TYPES.NF.examples)}`);
}
function flowCR() {
  return page('flow-cr', { title: 'Enhancement or change request', eyebrow: 'Work-type flow · CR', lede: D.WORK_TYPES.CR.when + ' A CR starts with an impact analysis (T04); documents are updated as deltas and regression is selected from the RTM.' },
  `${figure('D5-flow-change-request', 'Change request swimlane: impact analysis first, then delta stages', [1800, 1042])}
${H2('Minor or Major?')}${table(['Class', 'Criteria (any one is enough for Major)', 'Effect on the flow'], D.CR_CLASS, { key: [0] })}
${H2('Step by step')}${stepsTable(D.STEPS_CR)}${H2('Rules specific to change requests')}${UL(D.RULES_CR)}`);
}
function flowSR() {
  return page('flow-sr', { title: 'Issue fix or service request', eyebrow: 'Work-type flow · SR', lede: 'Triage (T05) decides whether code is needed. If not, it is a scripted, reviewed and reversible service request. If it is, it is a defect: root cause analysis is always manual, and severity decides whether AI may help with the fix.' },
  `${figure('D6-flow-issue-sr', 'Issue fix and service request flow', [1300, 1760])}
${H2('Severity and AI permission')}${table(['Severity', 'Definition', 'Response', 'AI permission', 'Review', 'Release path'], D.SEVERITY, { key: [0] })}
${H2('Service request types')}${table(['Type', 'Examples', 'Controls'], D.SR_TYPES, { key: [0] })}
${H2('Step by step: defect fix')}${stepsTable(D.STEPS_DEFECT)}
${H2('Step by step: service request')}${stepsTable(D.STEPS_SERVICE)}
${H2('Rules specific to issues and service requests')}${UL(D.RULES_SR)}`);
}
module.exports = { L, D, T, OUT, PREVIEW, NAV, TITLE, navHtml, page, helpBody, home, startHere, quickRef, principles, processFlow, classify, stagePageHtml, flowNF, flowCR, flowSR, D10, legend, docItem };
