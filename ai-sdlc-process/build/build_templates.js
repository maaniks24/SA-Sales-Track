/* Builds fillable Word templates T01–T15 into ../templates */
const fs = require('fs'); const path = require('path');
const X = require('./docx_lib'); const D = require('./process_data');
const { d, COL, CW, CWL, run, P, H2, H3, bullets, spacer, table, checklist, callout, formGrid, signoff, placeholder } = X;
const { Paragraph, Document, CheckBox, AlignmentType } = d;
const OUT = path.join(__dirname, '..', 'templates');
const ST = id => D.STAGES.find(s => s.id === id);
const ex = t => [run(t, { italics: true, color: '8A9BA2', size: 19 })];
const guide = t => new Paragraph({ children: [run(t, { italics: true, color: COL.muted, size: 19 })], spacing: { after: 100 } });
const opts = (label, list) => new Paragraph({ spacing: { after: 100 }, children: [run(label + '   ', { bold: true, color: COL.ink })].concat(...list.map(o => [new CheckBox({ checked: false }), run(' ' + o + '     ')])) });

function block(b, W) {
  switch (b.t) {
    case 'guide': return [guide(b.text)];
    case 'form': return [formGrid(b.pairs, { cols: b.cols || 4, width: W }), spacer(80)];
    case 'opts': return [opts(b.label, b.list)];
    case 'bullets': return bullets(b.items);
    case 'callout': return [callout(b.title, b.body, { color: b.color, fill: b.fill, width: W }), spacer(80)];
    case 'checklist': return [checklist(b.items, { title: b.title || 'Reviewer confirms', width: W, evidence: b.evidence }), spacer(80)];
    case 'text': return [table(null, [[Array.from({ length: b.lines || 4 }, (_, i) => new Paragraph({ children: i === 0 && b.hint ? ex(b.hint) : [], spacing: { after: 0 } }))]], [W], { zebra: false }), spacer(80)];
    case 'table': {
      const widths = b.w.map(f => Math.round(f * W)); widths[widths.length - 1] += W - widths.reduce((a, c) => a + c, 0);
      const rows = [];
      (b.example || []).forEach(r => rows.push(r.map(c => ex(c))));
      (b.fixed || []).forEach(r => rows.push(r.map((c, i) => i === 0 ? [run(c, { bold: true, color: COL.ink, size: 19 })] : (c ? ex(c) : ''))));
      for (let i = 0; i < (b.rows ?? 4); i++) rows.push(b.h.map(() => ''));
      return [table(b.h, rows, widths), spacer(80)];
    }
  }
  return [];
}
function build(t) {
  const land = !!t.landscape, W = land ? CWL : CW;
  const st = t.stages ? t.stages.map(ST) : [];
  const kids = [
    P([[`AI-SDLC TEMPLATE  ·  ${t.id}`, { bold: true, color: COL.teal, size: 20, characterSpacing: 30 }]], { spacing: { after: 60 } }),
    P([[t.title, { font: 'Cambria', bold: true, size: 40, color: COL.ink }]], { spacing: { after: 100 } }),
    P([[t.purpose, { size: 21, color: COL.muted }]], { spacing: { after: 160 } }),
    callout('How to use this template', [
      [run('When: ', { bold: true }), run(t.when)], [run('Filled by: ', { bold: true }), run(t.who)],
      [run('Mode: ', { bold: true }), ...t.mode.split(/(AI-G|AI-A|AI-X|AUTO|\bM\b)/).filter(Boolean).map(s => X.MODE[s] ? run(s, { bold: true, color: X.MODE[s][0] }) : run(s))],
      [run('AI rule: ', { bold: true, color: COL.red }), run(t.ai)], [run('Store at: ', { bold: true }), run(t.store)],
      [run('Grey italic text is guidance or an example. Replace it, then delete this box when the document is baselined.', { italics: true, color: COL.muted, size: 18 })]
    ], { color: COL.teal, fill: 'EAF5F6', width: W }),
    spacer(120),
    H3('Document information'),
    formGrid(t.info, { cols: 4, width: W }), spacer(120)
  ];
  t.sections.forEach((s, i) => {
    kids.push(new Paragraph({ heading: d.HeadingLevel.HEADING_2, children: [run(s.h)], pageBreakBefore: !!s.newPage }));
    s.b.forEach(b => kids.push(...block(b, W)));
  });
  const checks = t.checklist || st.flatMap(s => s.checklist);
  if (checks.length) {
    kids.push(new Paragraph({ heading: d.HeadingLevel.HEADING_2, children: [run('Review checklist')], pageBreakBefore: !!t.checkNewPage }));
    kids.push(guide(t.checkGuide || `Completed by the reviewer before gate ${st.map(s => s.gate).join(' / ') || 'sign-off'}. The reviewer must not be the person who ran the AI prompt.`));
    kids.push(checklist(checks, { width: W, evidence: true }), spacer(120));
  }
  kids.push(new Paragraph({ heading: d.HeadingLevel.HEADING_2, children: [run('Sign-off')] }));
  kids.push(signoff(t.signoff, { width: W }), spacer(120));
  kids.push(new Paragraph({ heading: d.HeadingLevel.HEADING_2, children: [run('Revision history')] }));
  kids.push(table(['Version', 'Date', 'Author', 'Change'], [['', '', '', ''], ['', '', '', '']], [1300, 1600, 2400, W - 5300].map(Math.round)));
  return new Document({
    creator: 'AI SDLC Council', title: `${t.id} ${t.title}`, styles: X.styles, numbering: X.numbering,
    sections: [{ properties: land ? X.landscape : X.portrait, headers: { default: X.header(t.id, t.title, W) }, footers: { default: X.footer('Template v1.0 · PD-AISDLC-01', W) }, children: kids }]
  });
}

const { T } = require('./templates_spec');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const t of T) {
    const f = path.join(OUT, t.file + '.docx');
    fs.writeFileSync(f, await X.pack(build(t)));
    console.log('written', path.basename(f));
  }
})();
