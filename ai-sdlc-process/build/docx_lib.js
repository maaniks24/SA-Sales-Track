/* Shared Word building blocks: styles, tables, mode tags, checklists, figures, page setup. */
const fs = require('fs'); const path = require('path');
const d = require('docx');
const { Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, AlignmentType,
  HeadingLevel, ImageRun, PageOrientation, Header, Footer, PageNumber, CheckBox, VerticalAlign, LevelFormat, TableLayoutType } = d;

const COL = { ink: '0E2A33', teal: '0E7C86', rust: 'C25E3A', amber: 'B87D14', slate: '3E6B7A', plum: '7A5C8E', red: '8E2424',
  green: '4E8C5A', muted: '5B7480', line: 'C9D6DB', surface: 'EEF3F5', zebra: 'F6F9FA', white: 'FFFFFF', text: '1E3640', amberTint: 'FDF6E6' };
const MODE = { 'M': ['C25E3A', 'F8E6DF'], 'AI-G': ['0E7C86', 'DDF0F1'], 'AI-A': ['7A5C8E', 'ECE5F1'], 'AUTO': ['3E6B7A', 'E1EAEE'], 'AI-X': ['8E2424', 'F3DCDC'] };
const CODE = { M: 'M', AG: 'AI-G', AA: 'AI-A', AU: 'AUTO', NA: 'AI-X' };

const PAGE = { w: 11906, h: 16838, m: 1134 };          // A4, 2 cm margins
const CW = PAGE.w - 2 * PAGE.m;                        // 9638 DXA portrait content width
const CWL = PAGE.h - 2 * PAGE.m;                       // 14570 DXA landscape content width

const styles = {
  default: { document: { run: { font: 'Calibri', size: 21, color: COL.text }, paragraph: { spacing: { after: 100, line: 276, lineRule: 'auto' } } } },
  paragraphStyles: [
    { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { font: 'Cambria', size: 34, bold: true, color: COL.ink }, paragraph: { spacing: { before: 120, after: 200 }, outlineLevel: 0, keepNext: true } },
    { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { font: 'Cambria', size: 26, bold: true, color: COL.teal }, paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1, keepNext: true } },
    { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { font: 'Calibri', size: 22, bold: true, color: COL.slate }, paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2, keepNext: true } },
    { id: 'Caption', name: 'Caption', basedOn: 'Normal', run: { size: 18, italics: true, color: COL.muted }, paragraph: { spacing: { before: 60, after: 200 }, alignment: AlignmentType.CENTER } },
    { id: 'Small', name: 'Small', basedOn: 'Normal', run: { size: 18, color: COL.muted }, paragraph: { spacing: { after: 60 } } },
    { id: 'Code', name: 'Code Block', basedOn: 'Normal', run: { font: 'Consolas', size: 17, color: COL.ink }, paragraph: { spacing: { after: 0, line: 240, lineRule: 'auto' } } }
  ]
};
const numbering = { config: [
  { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } } } },
    { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 240 } } } }] },
  ...Array.from({ length: 40 }, (_, i) => ({ reference: 'num' + i, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 300 } } } }] }))
] };
let numSeq = 0;

/* ---------- text ---------- */
const run = (t, o = {}) => new TextRun({ text: t, ...o });
function runs(x) {          // string | [string | [text, opts]]
  if (typeof x === 'string') return [run(x)];
  return x.map(r => typeof r === 'string' ? run(r) : (r instanceof TextRun || r instanceof CheckBox) ? r : run(r[0], r[1]));
}
const P = (x, o = {}) => new Paragraph({ children: runs(x), ...o });
const H1 = (t, o = {}) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [run(t)], pageBreakBefore: o.newPage !== false });
const H2 = (t, o = {}) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [run(t)], pageBreakBefore: !!o.newPage });
const H3 = t => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [run(t)] });
const bullets = (items, lvl = 0) => items.map(t => new Paragraph({ numbering: { reference: 'bul', level: lvl }, children: runs(t), spacing: { after: 60 } }));
function numbered(items) { const ref = 'num' + (numSeq++ % 40); return items.map(t => new Paragraph({ numbering: { reference: ref, level: 0 }, children: runs(t), spacing: { after: 70 } })); }
const spacer = (after = 120) => new Paragraph({ children: [], spacing: { after } });
const pageBreak = () => new Paragraph({ children: [new d.PageBreak()] });
const placeholder = t => run('[' + t + ']', { italics: true, color: '8A9BA2' });

/* ---------- tables ---------- */
const border = (c = COL.line) => ({ style: BorderStyle.SINGLE, size: 4, color: c });
const allBorders = c => ({ top: border(c), bottom: border(c), left: border(c), right: border(c) });
function cell(content, o = {}) {
  if (Array.isArray(content)) content = content.flatMap(x => Array.isArray(x) && x.length && (x[0] instanceof TextRun || x[0] instanceof CheckBox) ? x : [x]);
  const kids = Array.isArray(content) && content.length && content[0] instanceof Paragraph ? content
    : [new Paragraph({ children: (content instanceof TextRun || content instanceof CheckBox) ? [content] : (Array.isArray(content) && content.some(c => c instanceof TextRun || c instanceof CheckBox) ? content : runs(content ?? '')), alignment: o.align, spacing: { after: 0, line: 252, lineRule: 'auto' } })];
  return new TableCell({
    children: kids, width: { size: o.w, type: WidthType.DXA }, columnSpan: o.span,
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 }, verticalAlign: o.valign || VerticalAlign.CENTER,
    borders: allBorders(o.borderColor)
  });
}
const headCell = (t, w) => cell([run(t, { bold: true, color: COL.white, size: 19 })], { w, fill: COL.ink });
function modeCell(code, w) { const m = MODE[code] || MODE[CODE[code]]; const c = MODE[code] ? code : CODE[code];
  return cell([run(c, { bold: true, color: m[0], size: 19 })], { w, fill: m[1], align: AlignmentType.CENTER }); }
/* rows: arrays of cell contents; modeCols: indexes rendered as mode tags; boldCols */
function table(headers, rows, widths, o = {}) {
  const total = widths.reduce((a, b) => a + b, 0);
  const trs = [];
  if (headers) trs.push(new TableRow({ tableHeader: true, children: headers.map((h, i) => headCell(h, widths[i])) }));
  rows.forEach((r, ri) => trs.push(new TableRow({ cantSplit: true, children: r.map((c, i) => {
    if ((o.modeCols || []).includes(i)) return modeCell(c, widths[i]);
    const fill = o.fills?.[ri]?.[i] || (o.zebra !== false && ri % 2 ? COL.zebra : undefined);
    const content = (o.boldCols || []).includes(i) && typeof c === 'string' ? [run(c, { bold: true, color: o.boldColor || COL.ink })] : c;
    return cell(content, { w: widths[i], fill, align: (o.centerCols || []).includes(i) ? AlignmentType.CENTER : undefined });
  }) })));
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths, rows: trs, layout: TableLayoutType.FIXED });
}
/* checklist: [☐] item | (optional) evidence / comment column */
function checklist(items, o = {}) {
  const w = o.width || CW, cols = o.evidence ? [520, w - 520 - 2600, 2600] : [520, w - 520];
  const rows = items.map((t, i) => new TableRow({ cantSplit: true, children: [
    cell([new CheckBox({ checked: false })], { w: cols[0], align: AlignmentType.CENTER, fill: i % 2 ? COL.zebra : undefined }),
    cell(t, { w: cols[1], fill: i % 2 ? COL.zebra : undefined })
  ].concat(o.evidence ? [cell([placeholder('evidence / link')], { w: cols[2], fill: i % 2 ? COL.zebra : undefined })] : []) }));
  const hdr = new TableRow({ tableHeader: true, children: [headCell('✓', cols[0]), headCell(o.title || 'Check', cols[1])].concat(o.evidence ? [headCell('Evidence', cols[2])] : []) });
  return new Table({ width: { size: w, type: WidthType.DXA }, columnWidths: cols, rows: [hdr, ...rows], layout: TableLayoutType.FIXED });
}
/* coloured callout box */
function callout(title, body, o = {}) {
  const c = o.color || COL.amber, fill = o.fill || COL.amberTint, w = o.width || CW;
  const kids = [];
  if (title) kids.push(new Paragraph({ children: [run(title, { bold: true, color: c })], spacing: { after: 40 } }));
  (Array.isArray(body) ? body : [body]).forEach(b => kids.push(b instanceof Paragraph ? b : new Paragraph({ children: runs(b), spacing: { after: 40 } })));
  return new Table({ width: { size: w, type: WidthType.DXA }, columnWidths: [w], layout: TableLayoutType.FIXED, rows: [new TableRow({ children: [new TableCell({
    children: kids, width: { size: w, type: WidthType.DXA }, shading: { fill, type: ShadingType.CLEAR, color: 'auto' },
    margins: { top: 120, bottom: 100, left: 180, right: 180 }, borders: allBorders(c)
  })] })] });
}
/* label/value form grid: pairs [[label, value]] in 2 or 4 columns */
function formGrid(pairs, o = {}) {
  const w = o.width || CW, four = o.cols === 4;
  const widths = four ? [Math.round(w * 0.18), Math.round(w * 0.32), Math.round(w * 0.18), w - Math.round(w * 0.18) * 2 - Math.round(w * 0.32)] : [Math.round(w * 0.3), w - Math.round(w * 0.3)];
  const rows = [];
  for (let i = 0; i < pairs.length; i += four ? 2 : 1) {
    const cells = [];
    [pairs[i], four ? pairs[i + 1] : null].forEach((pr, k) => {
      if (!pr && four && k === 1) { cells.push(cell('', { w: widths[2], fill: COL.surface }), cell('', { w: widths[3] })); return; }
      if (!pr) return;
      cells.push(cell([run(pr[0], { bold: true, color: COL.ink, size: 19 })], { w: widths[k * 2], fill: COL.surface }));
      cells.push(cell(pr[1] === undefined || pr[1] === null ? [placeholder('enter')] : (typeof pr[1] === 'string' && pr[1].startsWith('[') ? [placeholder(pr[1].slice(1, -1))] : pr[1]), { w: widths[k * 2 + 1] }));
    });
    rows.push(new TableRow({ cantSplit: true, children: cells }));
  }
  return new Table({ width: { size: w, type: WidthType.DXA }, columnWidths: widths, rows, layout: TableLayoutType.FIXED });
}
/* blank grid with N empty rows for manual entry */
function blankTable(headers, widths, n = 5, o = {}) {
  const rows = Array.from({ length: n }, (_, i) => headers.map((h, j) => (o.prefill && o.prefill[i] && o.prefill[i][j] !== undefined) ? o.prefill[i][j] : ''));
  return table(headers, rows, widths, { zebra: true, ...o });
}
function signoff(roles, o = {}) {
  const w = o.width || CW, widths = [Math.round(w * 0.24), Math.round(w * 0.22), Math.round(w * 0.16), Math.round(w * 0.16), w - Math.round(w * 0.24) - Math.round(w * 0.22) - Math.round(w * 0.32)];
  return table(['Role', 'Name', 'Decision', 'Date', 'Signature / Jira ref'], roles.map(r => [[run(r, { bold: true, color: COL.ink })], '', [placeholder('Approve / Reject')], '', '']), widths);
}

/* ---------- figures ---------- */
let figNo = 0;
function figure(file, caption, widthDxa = CW, o = {}) {
  const buf = fs.readFileSync(file);
  const pw = buf.readUInt32BE(16), ph = buf.readUInt32BE(20);
  let wpx = Math.round(widthDxa / 1440 * 96), hpx = Math.round(wpx * ph / pw);
  if (o.maxH && hpx > o.maxH) { hpx = o.maxH; wpx = Math.round(hpx * pw / ph); }
  figNo++;
  return [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 40, line: 240, lineRule: 'auto' }, keepNext: true,
    children: [new ImageRun({ type: 'png', data: buf, transformation: { width: wpx, height: hpx }, altText: { title: caption, description: caption, name: path.basename(file) } })] }),
  new Paragraph({ style: 'Caption', children: [run(`Figure ${figNo} — ${caption}`)] })];
}

/* ---------- page furniture ---------- */
function header(docId, title, pos) {
  return new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: COL.line, space: 4 } },
    tabStops: [{ type: d.TabStopType.RIGHT, position: pos || CW }],
    children: [run(title, { size: 16, color: COL.muted }), run('\t' + docId, { size: 16, color: COL.muted, bold: true })] })] });
}
function footer(label, pos) {
  return new Footer({ children: [new Paragraph({ tabStops: [{ type: d.TabStopType.RIGHT, position: pos || CW }],
    children: [run(label, { size: 16, color: COL.muted }), run('\tPage ', { size: 16, color: COL.muted }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: COL.muted }),
      run(' of ', { size: 16, color: COL.muted }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: COL.muted })] })] });
}
const portrait = { page: { size: { width: PAGE.w, height: PAGE.h }, margin: { top: PAGE.m, bottom: PAGE.m, left: PAGE.m, right: PAGE.m, header: 560, footer: 560 } } };
const landscape = { page: { size: { width: PAGE.w, height: PAGE.h, orientation: PageOrientation.LANDSCAPE }, margin: { top: PAGE.m, bottom: PAGE.m, left: PAGE.m, right: PAGE.m, header: 560, footer: 560 } } };

async function pack(doc) {
  const JSZip = require('jszip');
  const zip = await JSZip.loadAsync(await d.Packer.toBuffer(doc));
  let n = 0;
  for (const f of Object.keys(zip.files).filter(f => /^word\/(document|header\d*|footer\d*)\.xml$/.test(f))) {
    const xml = await zip.file(f).async('string');
    zip.file(f, xml.replace(/<wp:docPr id="\d+"/g, () => `<wp:docPr id="${++n}"`));
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}
module.exports = { pack, d, COL, MODE, CODE, CW, CWL, PAGE, styles, numbering, run, runs, P, H1, H2, H3, bullets, numbered, spacer, pageBreak, placeholder,
  cell, headCell, modeCell, table, checklist, callout, formGrid, blankTable, signoff, figure, header, footer, portrait, landscape, resetFig: () => { figNo = 0; } };
