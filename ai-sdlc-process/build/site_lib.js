/* Shared HTML helpers for the portal generator. */
const fs = require('fs'); const path = require('path');
const D = require('./process_data'); const { T } = require('./templates_spec');
const ROOT = path.join(__dirname, '..');
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = s => esc(s).replace(/"/g, '&quot;');
const TPL = Object.fromEntries(D.TEMPLATES.map(t => [t[0], { id: t[0], name: t[1], purpose: t[2], stage: t[3], wt: t[4], owner: t[5], mode: t[6] }]));
const CPF = Object.fromEntries(D.CONTEXT_PACK.map(r => [r[0].split(' ')[0], { file: r[0], desc: r[1], owner: r[2] }]));
const ST = Object.fromEntries(D.STAGES.map(s => [s.id, s]));
const TECH = Object.fromEntries(D.TECHNIQUES.map(t => [t[0], t]));
const LEVELS = { L1: ['Automated checks', 'Jenkins and tools: lint, PMD, Sonar, OpenAPI diff, secret scan, ID link check, parity.'], L2: ['Role checklist', 'The stage checklist in T10, ticked by the named role with evidence.'], L3: ['Independent review', 'A second person, never the AI operator, compares the output with the approved input.'], L4: ['Recorded sign-off', 'The gate owner records the decision in T10 and the X01 Gate Log.'] };
const MODE_KEY = { 'M': 'M', 'AI-G': 'AIG', 'AI-A': 'AIA', 'AUTO': 'AUTO', 'AI-X': 'AIX' };
const MODE_BY_CODE = Object.fromEntries(Object.values(D.MODES).map(m => [m.code, m]));
const tplPage = id => id === 'X01' ? 'tracker' : 'template-' + id.toLowerCase();
const stagePage = id => 'stage-' + id.toLowerCase();

function chip(code) {
  const m = MODE_BY_CODE[code]; if (!m) return esc(code);
  return `<span class="mode ${MODE_KEY[code]}" data-tip-title="${attr(m.code + ' · ' + m.name)}" data-tip="${attr(m.desc)}">${esc(code)}</span>`;
}
const modeText = s => '<span class="nw">' + esc(s).replace(/AI-G\*?|AI-A|AI-X|AUTO|\bM\b/g, c => chip(c.replace('*', ''))) + '</span>';
const modeOf = c => D.MODES[c] ? D.MODES[c].code : c;

/* Turn IDs in prose into links with tooltips, in one pass so replacements are never re-scanned. */
const RX = /(?<![\w\-/.])(?:(T(?:0[1-9]|1[0-5])|X01)|(CP-\d\d)|(S[0-9])|(G[0-9])|(V(?:10|[1-9]))|(L[1-4])|(AI-G|AI-A|AI-X|AUTO))(?![\w])/g;
function link(text) {
  return esc(text).replace(RX, (all, tp, cp, st, g, v, l, m) => {
    if (tp) { const t = TPL[tp]; return `<a class="ref" href="#${tplPage(tp)}" data-tip-title="${attr(tp + ' ' + t.name)}" data-tip="${attr(t.purpose)}">${tp}</a>`; }
    if (cp) { const f = CPF[cp]; return f ? `<a class="ref" href="#context-pack" data-tip-title="${attr(f.file)}" data-tip="${attr(f.desc + ' Owner: ' + f.owner + '.')}">${cp}</a>` : cp; }
    if (st) { const s = ST[st]; return `<a class="ref" href="#${stagePage(st)}" data-tip-title="${attr(st + ' ' + s.name)}" data-tip="${attr(s.purpose)}">${st}</a>`; }
    if (g) { const s = D.STAGES.find(x => x.gate === g); return `<a class="ref" href="#${stagePage(s.id)}" data-tip-title="${attr('Gate ' + g)}" data-tip="${attr(s.gateText)}">${g}</a>`; }
    if (v) { const t = TECH[v]; return `<a class="ref" href="#validation" data-tip-title="${attr(v + ' ' + t[1])}" data-tip="${attr('Catches: ' + t[2] + '. ' + t[3])}">${v}</a>`; }
    if (l) { return `<span class="tip-term" data-tip-title="${attr(l + ' ' + LEVELS[l][0])}" data-tip="${attr(LEVELS[l][1])}">${l}</span>`; }
    if (m) return chip(m);
    return all;
  });
}
const info = (t) => `<button type="button" class="info" aria-label="About this section" data-tip="${attr(t)}">i</button>`;
const H2 = (t, tipText) => `<h2 data-label="${attr(t)}">${esc(t)}${tipText ? info(tipText) : ''}</h2>`;
const H3 = (t, tipText) => `<h3 class="toc-sub" data-label="${attr(t)}">${esc(t)}${tipText ? info(tipText) : ''}</h3>`;
const P = t => `<p>${link(t)}</p>`;
const UL = items => `<ul class="clean">${items.map(i => `<li>${link(i)}</li>`).join('')}</ul>`;
const OL = items => `<ol class="steps">${items.map(i => `<li>${link(i)}</li>`).join('')}</ol>`;
function table(head, rows, o = {}) {
  const th = head.map((h, i) => `<th${(o.center || []).includes(i) ? ' class="c"' : ''}>${esc(h)}</th>`).join('');
  const tr = rows.map(r => {
    const cells = r.cells || r; const ra = r.attrs || '';
    return `<tr${ra}>${cells.map((c, i) => {
      const cls = [(o.key || []).includes(i) ? 'k' : '', (o.center || []).includes(i) ? 'c' : ''].filter(Boolean).join(' ');
      const html = (o.raw || []).includes(i) ? c : (o.mode || []).includes(i) ? modeText(c) : link(c);
      return `<td${cls ? ` class="${cls}"` : ''}>${html}</td>`;
    }).join('')}</tr>`;
  }).join('');
  return `<div class="table-wrap"${o.id ? ` id="${o.id}"` : ''}><table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
}
const callout = (cls, title, body) => `<div class="callout ${cls}">${title ? `<h4>${title}</h4>` : ''}${body}</div>`;

/* figures with optional clickable hotspots: [x, y, w, h, href, label] in canvas px */
function figure(name, caption, canvas, spots = []) {
  const [W, H] = canvas;
  const hs = spots.map(([x, y, w, h, href, label]) => `<a class="hot" href="#${href}" aria-label="${attr(label)}" data-tip="${attr(label)}" style="left:${(x / W * 100).toFixed(2)}%;top:${(y / H * 100).toFixed(2)}%;width:${(w / W * 100).toFixed(2)}%;height:${(h / H * 100).toFixed(2)}%"></a>`).join('');
  return `<figure class="fig"><div class="fig-frame"><div class="fig-inner"><img src="assets/diagrams/${name}.webp" alt="${attr(caption)}" loading="lazy" width="${W}" height="${H}">${hs}</div></div><figcaption>${esc(caption)}${spots.length ? ' · Click a highlighted area to open it.' : ''}</figcaption></figure>`;
}

/* downloads: hosted build links the file; preview build shows an inert button that explains why */
const ICON = {
  dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>'
};
let PREVIEW = false;
const setPreview = v => { PREVIEW = v; };
function dl(file, label = 'Download', primary = false) {
  if (PREVIEW) return `<button type="button" class="btn off${primary ? ' primary' : ''}" data-tip="Downloads work on the hosted portal. The claude.ai preview cannot save files.">${ICON.dl}${esc(label)}</button>`;
  return `<a class="btn${primary ? ' primary' : ''}" href="files/${attr(file)}" download data-tip="${attr('Download ' + path.basename(file) + ' to fill in or keep')}">${ICON.dl}${esc(label)}</a>`;
}
const view = (href, label = 'View online') => `<a class="btn" href="#${href}" data-tip="Open a read-only view in the portal">${ICON.eye}${esc(label)}</a>`;

/* files for each template */
const TFILE = Object.fromEntries(fs.readdirSync(path.join(ROOT, 'templates')).map(f => [f.slice(0, 3), 'templates/' + f]));

/* ---------- template paper view (from the same spec as the Word file) ---------- */
function hint(t) { return `<span class="hint">${esc(t)}</span>`; }
function pBlock(b) {
  switch (b.t) {
    case 'guide': return `<p class="guide">${esc(b.text)}</p>`;
    case 'opts': return `<div class="opts"><b>${esc(b.label)}</b>${b.list.map(o => `<span>☐ ${esc(o)}</span>`).join('')}</div>`;
    case 'bullets': return `<ul>${b.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
    case 'callout': return `<div class="howto"><b>${esc(b.title || '')}</b> ${esc([].concat(b.body).join(' '))}</div>`;
    case 'text': return `<div class="box">${esc(b.hint || '')}</div>`;
    case 'form': {
      const four = (b.cols || 4) === 4, rows = [];
      for (let i = 0; i < b.pairs.length; i += four ? 2 : 1) {
        const cells = [b.pairs[i], four ? b.pairs[i + 1] : null].filter(Boolean).map(([l, v]) => `<td class="lab">${esc(l)}</td><td>${v ? hint(String(v).replace(/^\[|\]$/g, '')) : hint('enter')}</td>`).join('');
        rows.push(`<tr>${cells}${four && !b.pairs[i + 1] ? '<td class="lab"></td><td></td>' : ''}</tr>`);
      }
      return `<div class="ptable"><table><tbody>${rows.join('')}</tbody></table></div>`;
    }
    case 'checklist': return `<div class="ptable"><table><thead><tr><th style="width:40px">✓</th><th>${esc(b.title || 'Check')}</th>${b.evidence ? '<th>Evidence</th>' : ''}</tr></thead><tbody>${b.items.map(i => `<tr><td>☐</td><td>${esc(i)}</td>${b.evidence ? `<td>${hint('evidence / link')}</td>` : ''}</tr>`).join('')}</tbody></table></div>`;
    case 'table': {
      const ex = (b.example || []).map(r => `<tr>${r.map(c => `<td>${hint(c)}</td>`).join('')}</tr>`).join('');
      const fx = (b.fixed || []).map(r => `<tr>${b.h.map((_, i) => `<td>${i === 0 ? `<b>${esc(r[0])}</b>` : r[i] ? hint(r[i]) : ''}</td>`).join('')}</tr>`).join('');
      const bl = Array.from({ length: Math.min(2, b.rows ?? 4) }, () => `<tr class="blank">${b.h.map(() => '<td></td>').join('')}</tr>`).join('');
      return `<div class="ptable"><table><thead><tr>${b.h.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${ex}${fx}${bl}</tbody></table></div>`;
    }
  }
  return '';
}
function paper(t) {
  const st = (t.stages || []).map(id => ST[id]);
  const checks = t.checklist || st.flatMap(s => s.checklist);
  let h = `<div class="paper" role="document" aria-label="${attr(t.id + ' ' + t.title + ' preview')}"><div class="tk">AI-SDLC TEMPLATE · ${esc(t.id)}</div><h2>${esc(t.title)}</h2><p>${esc(t.purpose)}</p>`;
  h += `<div class="howto"><b>How to use this template</b><br><b>When:</b> ${esc(t.when)}<br><b>Filled by:</b> ${esc(t.who)}<br><b>Mode:</b> ${esc(t.mode)}<br><span class="rule">AI rule:</span> ${esc(t.ai)}<br><b>Store at:</b> ${esc(t.store)}</div>`;
  h += `<h4>Document information</h4>` + pBlock({ t: 'form', pairs: t.info, cols: 4 });
  t.sections.forEach(s => { h += `<h4>${esc(s.h)}</h4>` + s.b.map(pBlock).join(''); });
  if (checks.length) h += `<h4>Review checklist</h4>` + pBlock({ t: 'checklist', items: checks, title: 'Reviewer confirms', evidence: true });
  h += `<h4>Sign-off</h4>` + `<div class="ptable"><table><thead><tr><th>Role</th><th>Name</th><th>Decision</th><th>Date</th><th>Signature / Jira ref</th></tr></thead><tbody>${t.signoff.map(r => `<tr><td><b>${esc(r)}</b></td><td></td><td>${hint('Approve / Reject')}</td><td></td><td></td></tr>`).join('')}</tbody></table></div>`;
  return h + '</div>';
}

/* ---------- tiny markdown renderer for the Context Pack files ---------- */
function inline(s) {
  return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\[ \]/g, '☐').replace(/\[x\]/gi, '☑');
}
function md(src) {
  const lines = src.replace(/<!--[\s\S]*?-->/g, '').split('\n'); let out = '', i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (/^```/.test(l)) { const buf = []; i++; while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]); i++; out += `<pre class="code">${esc(buf.join('\n'))}</pre>`; continue; }
    if (/^#{1,3} /.test(l)) { const n = l.match(/^#+/)[0].length; out += `<h${n}>${inline(l.slice(n + 1))}</h${n}>`; i++; continue; }
    if (/^\|/.test(l)) { const rows = []; while (i < lines.length && /^\|/.test(lines[i])) { if (!/^\|[\s|:-]+\|$/.test(lines[i])) rows.push(lines[i].slice(1, -1).split('|').map(c => c.trim())); i++; }
      out += `<div class="table-wrap"><table><thead><tr>${rows[0].map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; continue; }
    if (/^> /.test(l)) { const buf = []; while (i < lines.length && /^> /.test(lines[i])) buf.push(lines[i++].slice(2)); out += `<blockquote>${inline(buf.join(' '))}</blockquote>`; continue; }
    if (/^(\s*[-*] |\d+\. )/.test(l)) { const ordered = /^\d+\. /.test(l), buf = []; while (i < lines.length && /^(\s*[-*] |\d+\. )/.test(lines[i])) buf.push(lines[i++].replace(/^(\s*[-*] |\d+\. )/, ''));
      out += `<${ordered ? 'ol' : 'ul'} class="clean">${buf.map(b => `<li>${inline(b)}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`; continue; }
    if (!l.trim()) { i++; continue; }
    const buf = []; while (i < lines.length && lines[i].trim() && !/^(#|\||> |```|\s*[-*] |\d+\. )/.test(lines[i])) buf.push(lines[i++]);
    out += `<p>${inline(buf.join(' '))}</p>`;
  }
  return `<div class="md">${out}</div>`;
}

module.exports = { D, T, ROOT, esc, attr, TPL, CPF, ST, TECH, LEVELS, chip, modeText, modeOf, link, info, H2, H3, P, UL, OL, table, callout, figure, dl, view, ICON, setPreview, TFILE, tplPage, stagePage, paper, md, isPreview: () => PREVIEW };
