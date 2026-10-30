/* Minimal SVG drawing kit for process diagrams. All sizes in px on the design canvas. */
const C = {
  ink: '#0E2A33', deep: '#14434F', teal: '#0E7C86', rust: '#C25E3A', amber: '#B87D14', amberBright: '#E0A02E',
  slate: '#3E6B7A', plum: '#7A5C8E', red: '#8E2424', green: '#4E8C5A', muted: '#5B7480', line: '#C9D6DB',
  surface: '#EEF3F5', white: '#FFFFFF', text: '#1E3640'
};
const MODE = {
  'M': { c: '#C25E3A', t: '#F8E6DF' }, 'AI-G': { c: '#0E7C86', t: '#DDF0F1' }, 'AI-A': { c: '#7A5C8E', t: '#ECE5F1' },
  'AUTO': { c: '#3E6B7A', t: '#E1EAEE' }, 'AI-X': { c: '#8E2424', t: '#F3DCDC' }, 'AI-G*': { c: '#0E7C86', t: '#DDF0F1' }
};
const FONT = "Carlito, Calibri, 'Liberation Sans', Arial, sans-serif";
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(text, width, size, bold) {
  const max = Math.max(4, Math.floor(width / (size * (bold ? 0.5 : 0.475))));
  const out = [];
  String(text).split('\n').forEach(para => {
    let cur = '';
    para.split(' ').forEach(w => {
      const t = cur ? cur + ' ' + w : w;
      if (t.length <= max) cur = t; else { if (cur) out.push(cur); cur = w; }
    });
    out.push(cur);
  });
  return out;
}
/* items: [{t,size,bold,color,italic,gap}] */
function stack(x, y, w, h, items, o = {}) {
  const pad = o.pad ?? 14, valign = o.valign || 'middle', align = o.align || 'middle';
  const blocks = items.map(it => ({ ...it, lines: wrap(it.t, w - pad * 2, it.size || 22, it.bold) }));
  const total = blocks.reduce((a, b, i) => a + b.lines.length * (b.size || 22) * 1.2 + (i ? (b.gap ?? 6) : 0), 0);
  let cy = valign === 'middle' ? y + (h - total) / 2 : y + pad;
  const tx = align === 'middle' ? x + w / 2 : x + pad;
  const anchor = align === 'middle' ? 'middle' : 'start';
  let s = '';
  blocks.forEach((b, i) => {
    const sz = b.size || 22;
    if (i) cy += (b.gap ?? 6);
    b.lines.forEach(line => {
      cy += sz * 1.2;
      s += `<text x="${tx}" y="${cy - sz * 0.28}" font-family="${FONT}" font-size="${sz}" font-weight="${b.bold ? 700 : 400}"${b.italic ? ' font-style="italic"' : ''} fill="${b.color || C.text}" text-anchor="${anchor}">${esc(line)}</text>`;
    });
  });
  return s;
}
function rect(x, y, w, h, o = {}) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 12}" fill="${o.fill || C.white}" stroke="${o.stroke || 'none'}" stroke-width="${o.sw ?? 2.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
}
function pillW(code, size = 21) { return Math.round(code.length * size * 0.6 + 24); }
function pill(x, y, code, size = 21) {
  const m = MODE[code] || { c: C.slate }; const w = pillW(code, size), h = size + 10;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${m.c}"/>` +
    `<text x="${x + w / 2}" y="${y + h / 2 + size * 0.36}" font-family="${FONT}" font-size="${size}" font-weight="700" fill="#FFFFFF" text-anchor="middle">${esc(code)}</text>`;
}
function pillRow(x, y, codes, o = {}) {
  const size = o.size || 21, gap = 8;
  const total = codes.reduce((a, c) => a + pillW(c, size), 0) + gap * (codes.length - 1);
  let px = o.align === 'center' ? x - total / 2 : x, s = '';
  codes.forEach(c => { s += pill(px, y, c, size); px += pillW(c, size) + gap; });
  return s;
}
function gate(cx, cy, label, r = 22) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.amberBright}" stroke="#FFFFFF" stroke-width="3"/>` +
    `<text x="${cx}" y="${cy + 7}" font-family="${FONT}" font-size="${r * 0.86}" font-weight="700" fill="${C.ink}" text-anchor="middle">${esc(label)}</text>`;
}
function chip(x, y, label, fill = C.ink) {
  const w = Math.max(56, label.length * 15 + 22);
  return `<rect x="${x}" y="${y}" width="${w}" height="34" rx="8" fill="${fill}"/><text x="${x + w / 2}" y="${y + 24}" font-family="${FONT}" font-size="22" font-weight="700" fill="#FFFFFF" text-anchor="middle">${esc(label)}</text>`;
}
const markers = () => Object.entries({ ink: C.ink, slate: C.slate, rust: C.rust, plum: C.plum, teal: C.teal, amber: C.amber, muted: C.muted, green: C.green })
  .map(([k, v]) => `<marker id="ah-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${v}"/></marker>`).join('');
function path(points, o = {}) {
  const col = o.color || 'slate', hex = C[col] || col;
  const d = points.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' ');
  return `<path d="${d}" fill="none" stroke="${hex}" stroke-width="${o.sw ?? 3}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.head === false ? '' : ` marker-end="url(#ah-${col})"`} stroke-linejoin="round"/>`;
}
function label(x, y, t, o = {}) {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${o.size || 20}" font-weight="${o.bold ? 700 : 400}"${o.italic ? ' font-style="italic"' : ''} fill="${o.color || C.muted}" text-anchor="${o.anchor || 'middle'}">${esc(t)}</text>`;
}
function diamond(cx, cy, w, h, text, o = {}) {
  const pts = `${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}`;
  return `<polygon points="${pts}" fill="${o.fill || '#FDF6E6'}" stroke="${o.stroke || C.amber}" stroke-width="3"/>` +
    stack(cx - w / 2 + w * 0.18, cy - h / 2, w * 0.64, h, [{ t: text, size: o.size || 22, bold: true, color: C.ink }], { pad: 0 });
}
function svgDoc(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${markers()}</defs><rect width="${w}" height="${h}" fill="#FFFFFF"/>${body}</svg>`;
}
module.exports = { C, MODE, FONT, esc, wrap, stack, rect, pill, pillW, pillRow, gate, chip, path, label, diamond, svgDoc };
