const fs = require('fs'); const path = require('path');
const S = require('./build_site');
const { L, D, T, OUT, PREVIEW, page } = S;
const { ROOT, esc, attr, TPL, ST, link, H2, H3, P, UL, OL, table, callout, figure, dl, view, ICON, TFILE, tplPage, stagePage, chip, modeText, md, paper } = L;
const CTX = path.join(ROOT, 'ai-context');

/* ---------------- assurance ---------------- */
function validation() {
  const chk = `<ul class="check" data-key="universal">${D.UNIVERSAL_CHECKLIST.map((c, k) => `<li><input type="checkbox" id="chk-u-${k}"><label for="chk-u-${k}">${link(c)}</label></li>`).join('')}</ul><div class="check-foot"><span class="done"></span><div class="progress" aria-hidden="true"><i></i></div><button type="button" class="btn reset">Clear ticks</button></div>`;
  return page('validation', { title: 'Validating AI output', eyebrow: 'Assurance', lede: 'AI output fails in predictable ways: invented identifiers, silent omissions, drift from house standards, and domain rules that look right and are wrong. Validation is a fixed set of levels and techniques, each aimed at one failure, applied the same way by everyone.' },
  `${H2('Four levels of verification', 'The same four levels close every gate in every stage. Only the checklist contents change by stage.')}${figure('D7-validation-levels', 'The four verification levels that close every gate', [1300, 720])}
${table(['Level', 'Who', 'What it proves', 'Evidence'], [['L1 Automated', 'Jenkins and tools', 'Objective rules are met: standards, quality, security, contract compatibility, ID links, parity', 'Pipeline result link in T10'], ['L2 Role checklist', 'The stage owner', 'Every stage-specific check has been made by the accountable role', 'Ticked checklist in T10'], ['L3 Independent review', 'A reviewer who is not the AI operator', 'The output matches the approved input, with nothing invented or missing', 'Reviewer name and findings in T10'], ['L4 Recorded sign-off', 'The gate owner', 'The decision was taken and is auditable', 'T10 record + X01 Gate Log']], { key: [0] })}
${H2('Ten validation techniques', 'Each stage page names the techniques its reviewer uses.')}${table(['ID', 'Technique', 'Catches', 'How to apply', 'Stages'], D.TECHNIQUES, { key: [0, 1] })}
${H2('Universal AI output acceptance checklist', 'Apply this to every AI-generated artifact, in addition to the stage checklist. It is also in T11.')}${chk}
${H2('Fixed-asset domain spot checks', 'Where AI output most often looks right and is wrong. A domain SME re-derives at least two scenarios without looking at the AI output (V7).')}${table(['Area', 'What to re-derive or verify'], D.DOMAIN_CHECKS, { key: [0] })}
${H2('Handling rejected AI output')}${OL(D.REJECTION_STEPS)}
${H2('Evidence to retain')}${table(['Evidence', 'Where it lives', 'Retention'], D.EVIDENCE)}`);
}
function traceability() {
  return page('traceability', { title: 'Traceability and IDs', eyebrow: 'Assurance', lede: 'The requirement ID ties every artifact together. It proves coverage at audit, shows the impact of a change before it is made, and traces a defect back to the gate that missed it.' },
  `${figure('D8-traceability-chain', 'The traceability chain and where each ID is recorded', [1300, 470])}
${H2('ID conventions', 'Click Copy to put a format on your clipboard.')}${table(['Item', 'Format', 'Example'], D.ID_CONVENTIONS.map((r, i) => [esc(r[0]), `<code id="idf-${i}">${esc(r[1])}</code> <button type="button" class="btn" style="height:26px;padding:0 8px" data-copy="idf-${i}" aria-label="Copy format">${ICON.copy}</button>`, `<span class="idchip">${esc(r[2])}</span>`]), { raw: [0, 1, 2], key: [0] })}
${H2('Where each ID must appear')}${table(['ID', 'Must appear in'], D.ID_WHERE, { key: [0] })}
${H2('Automated traceability checks')}${UL(D.ID_CHECKS)}
<div class="btns">${view('tracker', 'Open the RTM in the tracker')}</div>`);
}

/* ---------------- context ---------------- */
function ctxFiles() {
  const out = [];
  (function walk(dir, rel) { fs.readdirSync(dir).sort().forEach(f => { const p = path.join(dir, f), r = rel ? rel + '/' + f : f; if (fs.statSync(p).isDirectory()) walk(p, r); else out.push(r); }); })(CTX, '');
  return out;
}
const mdId = f => 'md-' + f.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
function contextPack() {
  const files = ctxFiles().filter(f => !f.startsWith('CP-50-prompt-templates/'));
  const rows = D.CONTEXT_PACK.map(r => {
    const key = r[0].split(' ')[0], f = files.find(x => x.startsWith(key === 'AI-INSTRUCTIONS.md' ? 'AI-INSTRUCTIONS' : key + '-')) || (key === 'CP-99' ? 'CP-99-golden-examples/README.md' : null);
    const btn = key === 'CP-50' ? `<a class="btn" href="#prompts">${ICON.eye}Open prompts</a>` : f ? `<button type="button" class="btn" data-view="${mdId(f)}" data-view-title="${attr(r[0])}">${ICON.eye}View</button>${dl('ai-context/' + f, 'Download')}` : '';
    return [`<b>${esc(r[0])}</b>`, link(r[1]), esc(r[2]), link(r[3]), `<div class="btns">${btn}</div>`];
  });
  return page('context-pack', { title: 'Common Context Pack', eyebrow: 'Common context', lede: 'Consistent AI output is an input problem. The Context Pack is the single, versioned folder of standards, registries and examples that every AI prompt loads, so two developers asking the same question get the same answer.' },
  `<div class="btns">${dl('ai-context.zip', 'Download the whole pack (.zip)', true)}<button type="button" class="btn" data-view="${mdId('README.md')}" data-view-title="/ai-context README">${ICON.eye}How to install it</button></div>
${H2('Layers')}${figure('D9-context-layers', 'Context layers: only the task prompt is personal', [1300, 640])}
${H2('Files and owners', 'Each starter file has OWNER TO COMPLETE sections that the named owner fills in before go-live.')}${table(['File', 'Content', 'Owner', 'Update trigger', ''], rows, { raw: [0, 1, 2, 3, 4] })}
${H2('How the pack is loaded')}${UL(D.CP_LOADING)}
${H2('Change control')}${OL(D.CP_CHANGE)}
<div class="btns">${view('template-t14', 'Open T14 Context Pack Change Request')}</div>`);
}
function prompts() {
  const blocks = [['1', 'ROLE', 'Sets the perspective and the surface profile.'], ['2', 'CONTEXT', 'Names the Context Pack version; makes it binding.'], ['3', 'INPUT', 'Approved artifact IDs and versions, referenced and never retyped.'], ['4', 'TASK', 'One stage deliverable only.'], ['5', 'CONSTRAINTS', 'Reuse rules; what must not be created; what to do when something is missing.'], ['6', 'OUTPUT FORMAT', 'The template to fill, so review is mechanical.'], ['7', 'TRACEABILITY', 'IDs to stamp on every section; Context Pack and prompt version.'], ['8', 'SELF-CHECK', 'Standards applied, reuse decisions, assumptions, open questions. Non-negotiable.']];
  const items = D.STAGES.map(s => {
    const f = path.join(CTX, 'CP-50-prompt-templates', 'P-' + s.id + '.md'), src = fs.readFileSync(f, 'utf8');
    const code = (src.match(/```text\n([\s\S]*?)```/) || [, ''])[1], id = 'prompt-' + s.id.toLowerCase();
    return `<details class="fold"><summary><span><b>P-${s.id}</b> · ${esc(s.name)}</span><span class="small">Gate ${s.gate}</span></summary><div><div class="btns" style="margin-bottom:8px"><button type="button" class="btn primary" data-copy="${id}">${ICON.copy}Copy prompt</button>${dl('ai-context/CP-50-prompt-templates/P-' + s.id + '.md', 'Download .md')}<a class="btn" href="#${stagePage(s.id)}">Open ${s.id}</a></div><pre class="code" id="${id}">${esc(code.trim())}</pre></div></details>`;
  }).join('');
  return page('prompts', { title: 'Stage prompt templates', eyebrow: 'Common context', lede: 'Every prompt for a deliverable uses the same eight blocks. Copy the template for your stage, fill in the angle brackets, and run it. Changing a template is a pull request, not a personal preference.' },
  `${H2('The eight blocks')}${table(['#', 'Block', 'Purpose'], blocks, { key: [1], center: [0] })}
${callout('warn', 'Block 8 is non-negotiable', '<p>The declared assumptions list is where the reviewer looks first. It turns “confidently wrong” from an invisible risk into a written claim a person can accept or reject in seconds.</p>')}
${H2('Templates by stage', 'Expand a stage, then Copy prompt.')}${items}`);
}

/* ---------------- people ---------------- */
function roles() {
  const names = { PO: 'Product Owner', BA: 'Business Analyst', TW: 'Technical Writer', ARC: 'Architect', TL: 'Tech Lead', DEV: 'Developer', REV: 'Reviewer', QA: 'QA Lead / Engineer', REL: 'Release Manager', OPS: 'DevOps', SEC: 'Security', DM: 'Delivery Manager' };
  const letter = { R: 'Responsible: does the work', A: 'Accountable: signs the gate', C: 'Consulted', I: 'Informed' };
  const head = '<tr><th>Stage</th>' + D.RACI_ROLES.map(r => `<th class="c"><span class="tip-term" data-tip="${attr(names[r])}">${r}</span></th>`).join('') + '</tr>';
  const body = D.STAGES.map(s => `<tr><td class="k"><a href="#${stagePage(s.id)}">${s.id} ${esc(s.short)}</a></td>${D.RACI[s.id].map((v, j) => `<td class="c"${v.includes('A') ? ' style="background:var(--m-bg);font-weight:700;color:var(--ink)"' : ''}>${v ? `<span class="tip-term" data-tip="${attr(names[D.RACI_ROLES[j]] + ' · ' + v.split('/').map(x => letter[x]).join('; '))}">${v}</span>` : ''}</td>`).join('')}</tr>`).join('');
  return page('roles', { title: 'Roles and RACI', eyebrow: 'People', lede: 'Who does what at each stage. The person who ran the AI prompt never signs the independent review or the gate for that output.' },
  `${H2('Roles')}${table(['Role', 'Responsibilities in the AI SDLC'], D.ROLES, { key: [0] })}
${H2('RACI matrix', 'Hover a letter to see the role and what it means. Shaded cells are accountable.')}<div class="table-wrap"><table><thead>${head}</thead><tbody>${body}</tbody></table></div>
${callout('warn', 'Separation of duties', '<p>The person who ran the AI prompt for an output is never the person who signs the L3 review or the gate for that output. The tracker flags it automatically.</p>')}`);
}
function governance() {
  return page('governance', { title: 'Governance and metrics', eyebrow: 'People', lede: 'A small council owns the process, the Context Pack, thresholds, waivers and audits. The overhead is thirty minutes a week and one audit a month.' },
  `${H2('AI Governance Council')}${table(['Item', 'Definition'], D.COUNCIL, { key: [0] })}
${H2('Waivers and escalation')}${UL(D.WAIVER_RULES)}<div class="btns">${view('template-t15', 'Open T15 Waiver Request')}</div>
${H2('Metrics', 'These are calculated live on the Metrics sheet of the tracker workbook.')}${table(['Metric', 'Definition', 'Target', 'Reviewed'], D.METRICS, { key: [0] })}`);
}

/* ---------------- documents ---------------- */
const DOCS = [
  { id: 'PD', kind: 'Process document', title: 'AI SDLC Process Definition', purpose: 'The full process: stages, inputs and outputs, modes, validation, flows, governance and implementation. 64 pages, Word.', stages: 'any', wt: 'NF CR SR', file: 'AI-SDLC-Process-Definition.docx', page: 'process-doc', mode: 'DOC', who: 'Everyone' },
  { id: 'PPT', kind: 'Presentation', title: 'AI SDLC Implementation Deck', purpose: '39 slides explaining the process and how to roll it out, with speaker notes.', stages: 'any', wt: 'NF CR SR', file: 'AI-SDLC-Process-Implementation.pptx', page: 'deck', mode: 'DOC', who: 'Presenters' },
  { id: 'CP', kind: 'Context Pack', title: '/ai-context starter pack', purpose: 'AI instructions, CP-00 to CP-99 starters, ten stage prompts and the pull request template.', stages: 'any', wt: 'NF CR SR', file: 'ai-context.zip', page: 'context-pack', mode: 'DOC', who: 'File owners' }
].concat(D.TEMPLATES.map(t => ({ id: t[0], kind: t[0] === 'X01' ? 'Tracker (Excel)' : 'Template (Word)', title: t[1], purpose: t[2], stages: stagesOf(t[0]), wt: t[4], file: t[0] === 'X01' ? 'templates/X01-AI-SDLC-Tracker.xlsx' : TFILE[t[0]], page: tplPage(t[0]), mode: /AI-X|only/.test(t[6]) && /AI-X/.test(t[6]) ? 'AIX' : /AI-G/.test(t[6]) ? 'AIG' : /AI-A/.test(t[6]) ? 'AIA' : 'M', who: t[5], how: t[6] })));
function stagesOf(id) { const m = D.DOC_MAP[id]; return typeof m === 'string' ? 'any' : Object.keys(m).join(' '); }
function library() {
  const cards = DOCS.map(d => `<div class="card lib-card" data-stages="${attr(d.stages)}" data-wt="${attr(d.wt + (d.wt === 'All' || /All/.test(d.wt) ? ' NF CR SR' : ''))}">
<div class="top"><span class="idbadge ${d.mode === 'AIG' ? '' : d.mode}">${esc(d.id)}</span><span class="kind">${esc(d.kind)}</span></div>
<h3>${esc(d.title)}</h3><p>${link(d.purpose)}</p>
<div class="small">${d.stages === 'any' ? 'Any stage' : 'Stages ' + link(d.stages.split(' ').join(', '))} · ${esc(d.who)}${d.how ? ' · ' + modeText(d.how) : ''}</div>
<div class="btns">${view(d.page)}${dl(d.file, 'Download')}</div></div>`).join('');
  const opt = v => `<option value="${v[0]}">${esc(v[1])}</option>`;
  return page('library', { title: 'Document library', eyebrow: 'Documents', lede: 'Every document and template in one place. Filter by stage or work type, view it online, or download it to work on.' },
  `<div class="lib-tools" role="search"><label class="small" for="lib-stage">Stage</label><select id="lib-stage">${opt(['all', 'All stages'])}${D.STAGES.map(s => opt([s.id, s.id + ' ' + s.short])).join('')}</select>
<label class="small" for="lib-wt">Work type</label><select id="lib-wt">${[['all', 'All work types'], ['NF', 'New feature'], ['CR', 'Change request'], ['SR', 'Issue / SR']].map(opt).join('')}</select>
<input id="lib-text" type="search" placeholder="Filter by name or purpose" aria-label="Filter documents"><span class="count" id="lib-count" aria-live="polite"></span></div>
${PREVIEW ? callout('note', 'Preview copy', '<p>View online works here. Downloads are switched off because claude.ai blocks file downloads; they work on the hosted portal.</p>') : ''}
<div class="grid g3" id="lib-grid">${cards}</div>`);
}
function processDoc() {
  const map = [['1 Introduction', 'home', 'Purpose, scope, audience, definitions'], ['2 Principles, modes and AI permissions', 'principles', ''], ['3 Process overview', 'process-flow', 'Master flow, stage loop, summary, tailoring'], ['3.4 Classification and routing', 'classify', ''], ['4 Stage definitions', 'stage-s0', 'One page per stage, S0 to S9'], ['5.1 New application or feature', 'flow-nf', ''], ['5.2 Enhancement / change request', 'flow-cr', ''], ['5.3 Issue fix / service request', 'flow-sr', ''], ['6 AI output validation', 'validation', ''], ['7 Common Context Pack', 'context-pack', 'Prompts are on their own page'], ['8 Traceability and identifiers', 'traceability', ''], ['9 Roles, responsibilities and governance', 'roles', 'Governance and metrics on the next page'], ['10 Support documents and templates', 'library', 'Every template has its own page'], ['11 Implementation', 'implementation', ''], ['Appendix A Worked examples', 'examples', ''], ['Appendix B Quick reference card', 'quick-ref', '']];
  return page('process-doc', { title: 'Process definition', eyebrow: 'Documents · PD-AISDLC-01', lede: 'The Word document is the approved reference. This portal is the same content split into pages you can search and link to, generated from the same source so the two always match.' },
  `<div class="btns">${dl('AI-SDLC-Process-Definition.docx', 'Download the Word document', true)}${view('library', 'Open the document library')}</div>
${H2('Where each section lives in the portal')}${table(['Document section', 'Portal page', 'Notes'], map.map(([s, p, n]) => [esc(s), `<a href="#${p}">${esc(S.TITLE[p] ? S.TITLE[p].label : p)}</a>`, esc(n)]), { raw: [0, 1, 2] })}
${H2('Document lifecycle map', 'Click a template row or a stage header to open it.')}${S.D10()}`);
}
function deck() {
  const dir = path.join(__dirname, 'deck_cache'), slides = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /\.jpg$/.test(f)).sort() : [];
  const thumbs = slides.map((f, i) => `<button type="button" data-src="assets/deck/${f}" aria-label="Slide ${i + 1}"><img src="assets/deck/${f}" alt="" loading="lazy"><span>${i + 1}</span></button>`).join('');
  return page('deck', { title: 'Implementation deck', eyebrow: 'Documents · Presentation', lede: 'The briefing that explains the process and how we roll it out. Use the arrows or your keyboard to move between slides.' },
  `<div class="deck"><div class="deck-bar"><div class="btns"><button type="button" class="btn" id="deck-prev" aria-label="Previous slide">← Previous</button><button type="button" class="btn" id="deck-next" aria-label="Next slide">Next →</button><span class="count" id="deck-pos" aria-live="polite"></span></div><div class="btns">${dl('AI-SDLC-Process-Implementation.pptx', 'Download .pptx', true)}</div></div>
<div class="deck-stage"><img id="deck-img" src="${slides.length ? 'assets/deck/' + slides[0] : ''}" alt="Slide 1"></div>
${H2('All slides')}<div class="thumbs" id="thumbs">${thumbs}</div></div>`);
}
function tracker() {
  const spec = JSON.parse(fs.readFileSync(path.join(__dirname, 'tracker_spec.json'), 'utf8'));
  const flags = { 'RTM': 'GAP when a requirement has no PR, no test case or no passing result', 'Gate Log': 'NO when the reviewer ran the AI prompt; No when evidence is incomplete', 'AI Usage Log': 'Missing when AI output has no T11 declaration', 'Parity': 'Cases missing when the counts do not reconcile', 'Waivers': 'EXPIRED, or NO when longer than 90 days', 'CP Versions': 'Lead time in working days', 'Defect to Gate': 'Open preventive actions' };
  const sheets = spec.sheets.map(s => {
    const ex = s.example.length ? table(s.cols, [s.cols.map((c, i) => s.auto.includes(c) ? '(calculated)' : (s.example[i] ?? ''))]) : '';
    return `<details class="fold"><summary><span><b>${esc(s.name)}</b> · ${esc(s.title)}</span><span class="small">${s.cols.length} columns</span></summary><div>
<p><b>Flags automatically:</b> ${link(flags[s.name] || '')}</p>
<p class="small"><b>You enter:</b> ${esc(s.cols.filter(c => !s.auto.includes(c)).join(', '))}</p><p class="small"><b>Calculated:</b> ${esc(s.auto.join(', ') || 'none')}</p>
${Object.keys(s.lists).length ? `<p class="small"><b>Drop-down lists:</b> ${esc(Object.entries(s.lists).map(([k, v]) => k + ' (' + v.join(', ') + ')').join('; '))}</p>` : ''}
<h3>Example row</h3>${ex}</div></details>`;
  }).join('');
  return page('tracker', { title: 'Tracker workbook', eyebrow: 'Documents · X01', lede: TPL.X01.purpose + '. Grey cells are formulas; you only type in white cells. Row 5 on each sheet is an example.' },
  `<div class="btns">${dl('templates/X01-AI-SDLC-Tracker.xlsx', 'Download X01 (.xlsx)', true)}</div>
${H2('Sheets', 'Expand a sheet to see its columns, what it flags, and an example row.')}${sheets}
<details class="fold"><summary><span><b>Metrics</b> · Council metrics (live)</span><span class="small">calculated</span></summary><div>${table(['Metric', 'Definition', 'Target', 'Reviewed'], D.METRICS, { key: [0] })}</div></details>`);
}
function templatePage(t) {
  const meta = TPL[t.id], m = D.DOC_MAP[t.id];
  const used = typeof m === 'string' ? m : Object.entries(m).map(([sid, k]) => `<a class="ref" href="#${stagePage(sid)}" data-tip="${attr(ST[sid].name)}">${sid}</a> <span class="small">(${k === 'P' ? 'produced' : k === 'U' ? 'used' : 'sign-off'})</span>`).join(', ');
  const metaHtml = `<div class="meta"><span>Work types <b>${esc(meta.wt)}</b></span><span>Owner <b>${esc(meta.owner)}</b></span><span>Filled ${modeText(meta.mode)}</span></div><p class="small" style="margin-top:10px">Stages: ${typeof m === 'string' ? esc(m) : used}</p>`;
  return page(tplPage(t.id), { title: `${t.id} ${t.title}`, eyebrow: 'Template', lede: t.purpose, meta: metaHtml },
  `<div class="btns">${dl(TFILE[t.id], 'Download .docx', true)}${view('library', 'All documents')}</div>
${callout('note', 'Read-only preview', '<p>This is how the Word template is laid out. Download it to fill it in: the Word file has clickable checkboxes and a sign-off block. Grey italic text is guidance or an example.</p>')}
${paper(t)}`);
}

/* ---------------- roll-out ---------------- */
function implementation() {
  const chk = `<ul class="check" data-key="readiness">${D.READINESS.map((c, k) => `<li><input type="checkbox" id="chk-r-${k}"><label for="chk-r-${k}">${link(c)}</label></li>`).join('')}</ul><div class="check-foot"><span class="done"></span><div class="progress" aria-hidden="true"><i></i></div><button type="button" class="btn reset">Clear ticks</button></div>`;
  return page('implementation', { title: 'Implementing the process', eyebrow: 'Roll-out', lede: 'The process is introduced in phases so delivery never stops. Gates start in warning mode and become blocking only after the pilot has tuned them.' },
  `${H2('Readiness checklist', 'Ready to start the pilot when every item is true. Your ticks are saved in this browser only.')}${chk}
${H2('Roll-out phases')}${table(['Phase', 'Weeks', 'Outcomes', 'Exit criterion'], D.PHASES, { key: [0] })}
${H2('Jira workflow and gates')}${table(['Jira status', 'Stage', 'Transition requires'], D.JIRA_FLOW, { key: [0] })}
${H2('Configuration artifacts')}${table(['Artifact', 'Where', 'What it enforces'], D.CONFIG_ARTIFACTS, { key: [0] })}
${H2('Storage, naming and versioning')}${table(['Document', 'Location', 'File name', 'Versioning'], D.STORAGE, { key: [0] })}
<div class="btns">${view('deck', 'Open the implementation deck')}</div>`);
}
function examples() {
  return page('examples', { title: 'Worked examples', eyebrow: 'Roll-out', lede: 'How the process applies to one item of each work type.' },
  callout('note', 'Illustrative only', '<p>IDs, counts and findings in these examples are illustrative, not records of real work.</p>') +
  D.EXAMPLES.map(e => `${H2(e.title)}${P(e.intro)}${table(['Stage', 'What happened', 'Artifact', 'Mode'], e.rows, { mode: [3], center: [0] })}`).join(''));
}
function glossary() {
  return page('glossary', { title: 'Glossary', eyebrow: 'Roll-out', lede: 'Terms and abbreviations used across the process.' },
  `${table(['Term', 'Meaning'], D.GLOSSARY, { key: [0] })}${H2('Identifier formats')}${table(['Item', 'Format', 'Example'], D.ID_CONVENTIONS, { key: [0] })}`);
}

/* ---------------- assemble ---------------- */
function mdTemplates() {
  return ctxFiles().filter(f => /\.md$/.test(f)).map(f => `<template id="${mdId(f)}">${md(fs.readFileSync(path.join(CTX, f), 'utf8'))}</template>`).join('\n');
}
function shell() {
  const pagesHtml = [S.home(), S.startHere(), S.quickRef(), S.principles(), S.processFlow(), S.classify(), ...D.STAGES.map(S.stagePageHtml), S.flowNF(), S.flowCR(), S.flowSR(),
    validation(), traceability(), contextPack(), prompts(), roles(), governance(), library(), processDoc(), deck(), tracker(), ...T.map(templatePage), implementation(), examples(), glossary()].join('\n');
  const css = fs.readFileSync(path.join(__dirname, 'site', 'site.css'), 'utf8'), js = fs.readFileSync(path.join(__dirname, 'site', 'app.js'), 'utf8');
  const searchSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  const menuSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  const helpSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01"/></svg>';
  const themeSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor"/></svg>';
  const head = `<title>AI SDLC Process Portal</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Navigable AI SDLC process for the Fixed Assets suite: stages, flows, validation, templates and downloads.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,500;8..60,650&display=swap">
<style>${css}</style>`;
  const body = `<a class="skip" href="#main">Skip to content</a>
<header class="topbar"><button type="button" class="icon-btn menu-btn" id="menu" aria-label="Open menu" aria-controls="nav" aria-expanded="false">${menuSvg}</button>
<a class="brand" href="#home" aria-label="AI SDLC Process Portal home"><span class="brand-mark">AI</span><span><span class="brand-name">AI SDLC Process Portal</span><br><span class="brand-sub">Fixed Assets Suite</span></span></a>
<div class="search" role="search">${searchSvg}<input id="q" type="search" placeholder="Search stages, templates, roles, terms" aria-label="Search the portal" autocomplete="off"><kbd>/</kbd><div class="results" id="results" hidden></div></div>
<button type="button" class="icon-btn" id="help-btn" aria-label="Help" data-tip="Help and keyboard shortcuts (press ?)">${helpSvg}<span class="hide-sm">Help</span></button>
<button type="button" class="icon-btn" id="theme-btn" aria-label="Switch theme">${themeSvg}<span class="hide-sm" id="theme-label">Auto</span></button></header>
<div class="shell"><nav class="nav" id="nav" aria-label="Portal sections">${S.navHtml()}</nav>
<main class="main" id="main"><div class="layout"><div class="content">${pagesHtml}</div><aside class="toc" id="toc" aria-label="On this page"></aside></div></main></div>
<div class="scrim" id="scrim" hidden></div>
<div class="modal" id="modal" hidden role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-box"><div class="modal-head"><h2 id="modal-title">Help</h2><button type="button" class="close" aria-label="Close">×</button></div><div class="modal-body" id="modal-body"></div></div></div>
<div id="tip" role="tooltip" hidden></div><div class="toast" id="toast" role="status" hidden></div>
<template id="help-content">${S.helpBody()}</template>
${mdTemplates()}
<script>${js}</script>`;
  return PREVIEW ? head + '\n' + body : `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
}

(async () => {
  const sharp = require('sharp');
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'assets', 'diagrams'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'index.html'), shell());
  for (const f of fs.readdirSync(path.join(ROOT, 'diagrams')).filter(f => f.endsWith('.png'))) {
    await sharp(path.join(ROOT, 'diagrams', f)).resize({ width: /D4|D5|D10/.test(f) ? 2200 : 1600 }).webp({ quality: 90 }).toFile(path.join(OUT, 'assets', 'diagrams', f.replace('.png', '.webp')));
  }
  const dc = path.join(__dirname, 'deck_cache');
  if (fs.existsSync(dc)) { fs.mkdirSync(path.join(OUT, 'assets', 'deck'), { recursive: true }); fs.readdirSync(dc).forEach(f => fs.copyFileSync(path.join(dc, f), path.join(OUT, 'assets', 'deck', f))); }
  if (!PREVIEW) {
    const files = path.join(OUT, 'files'); fs.mkdirSync(path.join(files, 'templates'), { recursive: true });
    ['AI-SDLC-Process-Definition.docx'].forEach(f => fs.copyFileSync(path.join(ROOT, f), path.join(files, f)));
    fs.copyFileSync(path.join(ROOT, 'presentation', 'AI-SDLC-Process-Implementation.pptx'), path.join(files, 'AI-SDLC-Process-Implementation.pptx'));
    fs.readdirSync(path.join(ROOT, 'templates')).forEach(f => fs.copyFileSync(path.join(ROOT, 'templates', f), path.join(files, 'templates', f)));
    fs.cpSync(CTX, path.join(files, 'ai-context'), { recursive: true });
    const JSZip = require('jszip'), zip = new JSZip();
    ctxFiles().forEach(f => zip.file('ai-context/' + f, fs.readFileSync(path.join(CTX, f))));
    fs.writeFileSync(path.join(files, 'ai-context.zip'), await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  }
  console.log((PREVIEW ? 'preview' : 'site') + ' written to ' + OUT + ' (' + Math.round(fs.statSync(path.join(OUT, 'index.html')).size / 1024) + ' KB page)');
})();
