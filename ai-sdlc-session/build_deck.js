/* Builds: AI-Augmented SDLC Framework — Fixed Assets Suite (team session deck) */
const pptxgen = require('pptxgenjs');
const React = require('react');
const RDS = require('react-dom/server');
const sharp = require('sharp');
const Fa = require('react-icons/fa');
const { applyTheme } = require('/root/.claude/skills/synced/7403b9c1-536e-4761-80b4-888badfbe19a_877e417e-425a-4065-bf64-4e106ebe2ee5/pptx/scripts/apply_theme.js');

const THEME = {
  name: 'AI SDLC Governance',
  headFontFace: 'Cambria',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '0E2A33', lt1: 'FFFFFF', dk2: '14434F', lt2: 'EEF3F5',
    accent1: '0E7C86', accent2: 'C25E3A', accent3: 'E0A02E', accent4: '3E6B7A',
    accent5: '4E8C5A', accent6: '7A5C8E', hlink: '0E7C86', folHlink: '7A5C8E'
  }
};
const P = {
  ink: '0E2A33', deep: '14434F', teal: '0E7C86', rust: 'C25E3A', amber: 'B87D14',
  amberBright: 'E0A02E', slate: '3E6B7A', green: '4E8C5A', plum: '7A5C8E',
  surface: 'EEF3F5', surface2: 'F6F9FA', line: 'D7E2E6', muted: '5B7480', white: 'FFFFFF'
};

/* ---------- icons ---------- */
const ICON = {};
async function renderIcons(spec) {
  for (const [key, [name, color]] of Object.entries(spec)) {
    const Comp = Fa[name];
    if (!Comp) throw new Error('missing icon ' + name);
    const svg = RDS.renderToStaticMarkup(React.createElement(Comp, { color: '#' + color, size: 256 }));
    const png = await sharp(Buffer.from(svg), { density: 600 }).resize(256, 256).png().toBuffer();
    ICON[key] = 'image/png;base64,' + png.toString('base64');
  }
}
const ICON_SPEC = {
  robot: ['FaRobot', 'FFFFFF'], robotTeal: ['FaRobot', '0E7C86'],
  review: ['FaUserCheck', 'FFFFFF'], reviewRust: ['FaUserCheck', 'C25E3A'],
  gate: ['FaStamp', 'FFFFFF'], gateAmber: ['FaStamp', 'E0A02E'],
  input: ['FaSignInAlt', 'FFFFFF'], doc: ['FaFileAlt', 'FFFFFF'],
  code: ['FaCode', 'FFFFFF'], test: ['FaVial', 'FFFFFF'], rocket: ['FaRocket', 'FFFFFF'],
  box: ['FaBoxOpen', 'FFFFFF'], sitemap: ['FaSitemap', 'FFFFFF'], bug: ['FaBug', 'FFFFFF'],
  link: ['FaLink', 'FFFFFF'], shield: ['FaShieldAlt', 'FFFFFF'], users: ['FaUsers', 'FFFFFF'],
  chart: ['FaChartLine', 'FFFFFF'], layers: ['FaLayerGroup', 'FFFFFF'], book: ['FaBookOpen', 'FFFFFF'],
  warn: ['FaExclamationTriangle', 'FFFFFF'], check: ['FaCheckCircle', 'FFFFFF'],
  bolt: ['FaBolt', 'FFFFFF'], recycle: ['FaRecycle', 'FFFFFF'], search: ['FaSearch', 'FFFFFF'],
  lock: ['FaLock', 'FFFFFF'], mobile: ['FaMobileAlt', 'FFFFFF'], server: ['FaServer', 'FFFFFF'],
  desktop: ['FaDesktop', 'FFFFFF'], compass: ['FaCompass', 'FFFFFF'], flag: ['FaFlagCheckered', 'FFFFFF'],
  tools: ['FaTools', 'FFFFFF'], clip: ['FaClipboardCheck', 'FFFFFF'], db: ['FaDatabase', 'FFFFFF'],
  scale: ['FaBalanceScale', 'FFFFFF'], eye: ['FaEye', 'FFFFFF'], history: ['FaHistory', 'FFFFFF'],
  up: ['FaThumbsUp', 'FFFFFF'], down: ['FaThumbsDown', 'FFFFFF'], plug: ['FaPlug', 'FFFFFF'],
  calendar: ['FaCalendarAlt', 'FFFFFF'], diagram: ['FaProjectDiagram', 'FFFFFF'],
  ban: ['FaBan', 'FFFFFF'], key: ['FaKey', 'FFFFFF']
};

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';            // 13.3 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = 'Product Engineering';
pres.company = 'Fixed Assets Product Engineering';
pres.subject = 'AI-Augmented SDLC Framework';
pres.title = 'AI-Augmented SDLC Framework';
const C = pres.SchemeColor;
const SH = pres.ShapeType;

const W = 13.3, H = 7.5, M = 0.6, CW = 12.1;   // content width
const sh = (o = {}) => Object.assign({ type: 'outer', color: '0E2A33', opacity: 0.12, blur: 10, offset: 1.5, angle: 90 }, o);

/* ---------- layouts ---------- */
pres.defineSlideMaster({
  title: 'COVER', background: { color: P.ink },
  objects: [
    { text: { text: '', options: { placeholder: 'title', x: 0.9, y: 2.25, w: 11.5, h: 1.9, fontSize: 44, bold: true, color: 'FFFFFF', valign: 'bottom' } } },
    { text: { text: '', options: { placeholder: 'sub', x: 0.95, y: 4.25, w: 11.3, h: 1.0, fontSize: 17, color: 'B9CED4', valign: 'top' } } },
    { text: { text: '', options: { placeholder: 'meta', x: 0.95, y: 6.3, w: 11.3, h: 0.5, fontSize: 12, color: '7FA0AA' } } }
  ]
});
pres.defineSlideMaster({
  title: 'SECTION', background: { color: P.deep },
  objects: [
    { text: { text: '', options: { placeholder: 'num', x: 0.9, y: 2.1, w: 2.0, h: 1.0, fontSize: 60, bold: true, color: 'E0A02E' } } },
    { text: { text: '', options: { placeholder: 'title', x: 0.95, y: 3.15, w: 11.0, h: 1.1, fontSize: 36, bold: true, color: 'FFFFFF' } } },
    { text: { text: '', options: { placeholder: 'sub', x: 1.0, y: 4.3, w: 10.5, h: 0.8, fontSize: 15, color: 'AFC8CF' } } }
  ]
});
const contentObjects = (bg) => ([
  { text: { text: '', options: { placeholder: 'kicker', x: M, y: 0.34, w: CW, h: 0.26, fontSize: 11, bold: true, charSpacing: 1.4, color: P.teal, margin: 0 } } },
  { text: { text: '', options: { placeholder: 'title', x: M, y: 0.6, w: CW, h: 0.62, fontSize: 28, bold: true, color: P.ink, margin: 0, valign: 'middle' } } },
  { text: { text: 'AI-Augmented SDLC Framework  ·  Fixed Assets Suite', options: { x: M, y: 6.98, w: 8.0, h: 0.3, fontSize: 9, color: '8CA4AC', margin: 0 } } }
]);
pres.defineSlideMaster({
  title: 'CONTENT', background: { color: 'FFFFFF' }, objects: contentObjects(),
  slideNumber: { x: 12.3, y: 6.98, w: 0.5, h: 0.3, fontSize: 9, color: '8CA4AC', align: 'right' }
});
pres.defineSlideMaster({
  title: 'CONTENTTINT', background: { color: P.surface2 }, objects: contentObjects(),
  slideNumber: { x: 12.3, y: 6.98, w: 0.5, h: 0.3, fontSize: 9, color: '8CA4AC', align: 'right' }
});
pres.defineSlideMaster({
  title: 'CLOSING', background: { color: P.ink },
  objects: [
    { text: { text: '', options: { placeholder: 'kicker', x: M, y: 0.5, w: CW, h: 0.3, fontSize: 11, bold: true, charSpacing: 1.4, color: 'E0A02E', margin: 0 } } },
    { text: { text: '', options: { placeholder: 'title', x: M, y: 0.82, w: CW, h: 0.7, fontSize: 30, bold: true, color: 'FFFFFF', margin: 0, valign: 'middle' } } }
  ]
});

/* ---------- placeholder option sets (explicit: never rely on inheritance) ---------- */
const PH = {
  coverTitle: { placeholder: 'title', x: 0.9, y: 2.25, w: 11.5, h: 1.9, fontSize: 44, bold: true, color: 'FFFFFF', valign: 'bottom', margin: 0 },
  coverSub:   { placeholder: 'sub', x: 0.95, y: 4.3, w: 10.6, h: 1.0, fontSize: 16.5, color: 'B9CED4', valign: 'top', margin: 0, lineSpacing: 23 },
  coverMeta:  { placeholder: 'meta', x: 0.95, y: 6.35, w: 11.3, h: 0.4, fontSize: 12, color: '7FA0AA', margin: 0 },
  secNum:     { placeholder: 'num', x: 0.9, y: 2.0, w: 2.0, h: 1.0, fontSize: 60, bold: true, color: 'E0A02E', margin: 0, valign: 'middle' },
  secTitle:   { placeholder: 'title', x: 0.95, y: 3.15, w: 11.0, h: 1.0, fontSize: 36, bold: true, color: 'FFFFFF', margin: 0, valign: 'middle' },
  secSub:     { placeholder: 'sub', x: 0.98, y: 4.25, w: 10.6, h: 0.8, fontSize: 15, color: 'AFC8CF', margin: 0, valign: 'top' },
  kicker:     { placeholder: 'kicker', x: 0.6, y: 0.34, w: 12.1, h: 0.26, fontSize: 11, bold: true, charSpacing: 1.4, color: '0E7C86', margin: 0, valign: 'middle' },
  title:      { placeholder: 'title', x: 0.6, y: 0.62, w: 12.1, h: 0.6, fontSize: 28, bold: true, color: '0E2A33', margin: 0, valign: 'middle' },
  closeKick:  { placeholder: 'kicker', x: 0.6, y: 0.5, w: 12.1, h: 0.28, fontSize: 11, bold: true, charSpacing: 1.4, color: 'E0A02E', margin: 0, valign: 'middle' },
  closeTitle: { placeholder: 'title', x: 0.6, y: 0.82, w: 12.1, h: 0.66, fontSize: 30, bold: true, color: 'FFFFFF', margin: 0, valign: 'middle' }
};

/* ---------- helpers ---------- */
let SEC = null;
function section(t) { pres.addSection({ title: t }); SEC = t; }
function slide(master) { return pres.addSlide({ masterName: master, sectionTitle: SEC }); }
function content(kicker, title, tint) {
  const s = slide(tint ? 'CONTENTTINT' : 'CONTENT');
  s.addText(kicker, PH.kicker);
  s.addText(title, PH.title);
  return s;
}
function txt(s, t, o) { s.addText(t, Object.assign({ isTextBox: true, margin: 0, valign: 'top' }, o)); }
function bullets(s, items, o) {
  const runs = items.map((t, i) => (typeof t === 'string'
    ? { text: t, options: { bullet: true, breakLine: i < items.length - 1 } }
    : { text: t.text, options: Object.assign({ bullet: true, breakLine: i < items.length - 1 }, t.options) }));
  s.addText(runs, Object.assign({ isTextBox: true, margin: 0, valign: 'top', fontSize: 13, color: P.ink, lineSpacing: 16, paraSpaceAfter: 7 }, o));
}
function iconCircle(s, x, y, d, color, key) {
  s.addShape(SH.ellipse, { x, y, w: d, h: d, fill: { color }, line: { color, width: 0 } });
  if (key && ICON[key]) s.addImage({ data: ICON[key], x: x + d * 0.27, y: y + d * 0.27, w: d * 0.46, h: d * 0.46 });
}
function card(s, o) {
  const { x, y, w, h, label, items, accent, icon, fill, labelSize = 12, bodySize = 13, note } = o;
  s.addShape(SH.roundRect, {
    x, y, w, h, rectRadius: 0.09, fill: { color: fill || P.surface },
    line: { color: P.line, width: 0.75 }, shadow: sh({ opacity: 0.09, blur: 8, offset: 1 }),
    objectName: (label || 'card') + ' panel'
  });
  let ty = y + 0.26;
  if (label) {
    iconCircle(s, x + 0.24, y + 0.22, 0.42, accent, icon);
    txt(s, label, { x: x + 0.78, y: y + 0.22, w: w - 0.98, h: 0.42, fontSize: labelSize, bold: true, color: accent, charSpacing: 0.8, valign: 'middle' });
    ty = y + 0.78;
  }
  if (items && items.length) bullets(s, items, { x: x + 0.28, y: ty, w: w - 0.56, h: h - (ty - y) - 0.2, fontSize: bodySize });
  if (note) txt(s, note, { x: x + 0.28, y: y + h - 0.42, w: w - 0.56, h: 0.32, fontSize: 10.5, italic: true, color: P.muted });
}
function pill(s, x, y, w, h, text, fill, color, fontSize = 11, bold = true) {
  s.addShape(SH.roundRect, { x, y, w, h, rectRadius: 0.5, fill: { color }, line: { type: 'none' } });
  txt(s, text, { x, y, w, h, fontSize, bold, color: fill, align: 'center', valign: 'middle' });
}
function arrow(s, x, y, w = 0.26, color = P.slate) {
  s.addShape(SH.triangle, { x, y, w, h: 0.22, fill: { color }, line: { type: 'none' }, rotate: 90 });
}
function kv(s, x, y, w, label, value, labelColor, valueColor, fs = 12) {
  txt(s, [{ text: label + '  ', options: { bold: true, color: labelColor } }, { text: value, options: { color: valueColor } }],
    { x, y, w, h: 0.3, fontSize: fs, valign: 'middle' });
}
module.exports = {};

/* ======================= 1. COVER ======================= */
function sCover() {
  section('Opening');
  const s = slide('COVER');
  s.addShape(SH.ellipse, { x: 9.6, y: -1.6, w: 5.6, h: 5.6, fill: { color: P.deep }, line: { type: 'none' } });
  s.addShape(SH.ellipse, { x: 11.0, y: 4.6, w: 3.4, h: 3.4, fill: { color: '19505E' }, line: { type: 'none' } });
  txt(s, 'TEAM ENABLEMENT SESSION  ·  45 MINUTES', { x: 0.95, y: 1.75, w: 9.0, h: 0.32, fontSize: 11.5, bold: true, charSpacing: 1.6, color: P.amberBright });
  s.addText('AI-Augmented SDLC Framework', PH.coverTitle);
  s.addText('How we use AI at every stage — and how we prove, by manual review and recorded gates, that every output is correct, consistent and traceable.', PH.coverSub);
  const surfaces = [['server', 'Web + Microservices'], ['mobile', 'Mobile Application'], ['desktop', 'Internal Web Apps']];
  let x = 0.95;
  surfaces.forEach(([ic, label]) => {
    s.addShape(SH.roundRect, { x, y: 5.45, w: 3.4, h: 0.62, rectRadius: 0.1, fill: { color: '17404C' }, line: { type: 'none' } });
    iconCircle(s, x + 0.18, y0(5.45), 0.34, P.teal, ic);
    txt(s, label, { x: x + 0.66, y: 5.45, w: 2.6, h: 0.62, fontSize: 12.5, bold: true, color: 'DCE9EC', valign: 'middle' });
    x += 3.6;
  });
  s.addText('Fixed Assets  ·  Depreciation  ·  Labelling and Tracking  ·  Data Validation and Audit', PH.coverMeta);
  s.addNotes('Open: we are not here to slow AI down. We are here to keep AI fast AND keep the product consistent. 45 minutes, 7 parts, decisions needed at the end.');
}
function y0(v) { return v + 0.14; }

/* ======================= 2. AGENDA ======================= */
function sAgenda() {
  const s = content('AGENDA', 'What we will cover in the next 45 minutes');
  const rows = [
    ['Where we stand', 'The process we had, and what AI outran', '4 min', P.slate, 'history'],
    ['Pros, cons and the control for each', 'Honest view, plus the control that removes each risk', '6 min', P.rust, 'scale'],
    ['The framework', 'Nine stages, one repeatable pattern per stage', '5 min', P.teal, 'sitemap'],
    ['The common context layer', 'How every developer gets the same output from AI', '7 min', P.plum, 'layers'],
    ['Stage by stage', 'Inputs, AI activity, manual review, exit gate, roles', '11 min', P.teal, 'clip'],
    ['Verification and governance', 'Traceability, gates, RACI, metrics', '6 min', P.amber, 'shield'],
    ['Rollout and decisions', '30-60-90 plan and what we need from you', '4 min', P.green, 'flag']
  ];
  let y = 1.55;
  rows.forEach(([t, d, time, col, ic], i) => {
    s.addShape(SH.roundRect, { x: M, y, w: CW, h: 0.66, rectRadius: 0.08, fill: { color: i % 2 ? P.surface2 : P.surface }, line: { type: 'none' } });
    iconCircle(s, M + 0.16, y + 0.14, 0.38, col, ic);
    txt(s, t, { x: M + 0.72, y, w: 5.1, h: 0.66, fontSize: 14, bold: true, color: P.ink, valign: 'middle' });
    txt(s, d, { x: M + 5.9, y, w: 4.5, h: 0.66, fontSize: 11.5, color: P.muted, valign: 'middle' });
    pill(s, 11.55, y + 0.17, 1.0, 0.32, time, P.white, col, 10.5);
    y += 0.72;
  });
  txt(s, 'Questions welcome throughout — decisions we need from you are listed on the final slide.', { x: M, y: 6.68, w: CW, h: 0.3, fontSize: 11.5, italic: true, color: P.muted });
  s.addNotes('Set expectations: this is a working session, not a lecture. Four decisions at the end.');
}

/* ======================= DIVIDERS ======================= */
function divider(num, title, sub, secName) {
  section(secName);
  const s = slide('SECTION');
  s.addText(num, PH.secNum);
  s.addText(title, PH.secTitle);
  s.addText(sub, PH.secSub);
  return s;
}

/* ======================= 3. THEN AND NOW ======================= */
function sThenNow() {
  const s = content('WHERE WE STAND', 'The discipline we had, and the steps AI quietly outran');
  const left = ['Functional Requirement Document signed before build', 'Coding and naming standards, verified by PMD and Sonar',
    'One project per feature, fixed folder structure', 'Common base classes and shared components for reuse',
    'Test scenarios and test cases written, then automated', 'Issues tracked in Jira against a requirement',
    'Deployment only through Jenkins pipelines'];
  const right = ['Requirement goes straight into a prompt — no signed document', 'AI picks its own patterns; our standards are never loaded',
    'Each developer scaffolds a different structure', 'New utilities and CSS written while base classes sit unused',
    'Test cases generated, but not reconciled with what was automated', 'Commits without a requirement ID — traceability matrix drifts',
    'Pipeline still runs, but it no longer checks what it used to'];
  card(s, { x: M, y: 1.5, w: 5.88, h: 4.35, label: 'THE MANUAL PROCESS THAT KEPT US CONSISTENT', items: left, accent: P.slate, icon: 'check', fill: P.surface, labelSize: 11.5, bodySize: 13 });
  card(s, { x: 6.81, y: 1.5, w: 5.88, h: 4.35, label: 'WHAT HAPPENS NOW THAT AI DRAFTS FIRST', items: right, accent: P.rust, icon: 'warn', fill: 'FBF0EC', labelSize: 11.5, bodySize: 13 });
  s.addShape(SH.roundRect, { x: M, y: 6.05, w: CW, h: 0.78, rectRadius: 0.09, fill: { color: P.ink }, line: { type: 'none' } });
  iconCircle(s, M + 0.22, 6.24, 0.4, P.amberBright, 'bolt');
  txt(s, 'AI did not break our process. It outran the checkpoints that used to catch us — so we put the checkpoints back, at AI speed.',
    { x: M + 0.78, y: 6.05, w: CW - 1.0, h: 0.78, fontSize: 13.5, bold: true, color: 'FFFFFF', valign: 'middle' });
  s.addNotes('Key line: nobody did anything wrong. The old checkpoints were human-paced; AI moved faster than them. We are restoring the checkpoints at AI speed, not removing AI.');
}

/* ======================= 4. SIX GAPS ======================= */
function sGaps() {
  const s = content('WHERE WE STAND', 'Six gaps that opened — and what each one costs us', true);
  const items = [
    ['code', P.rust, 'Code inconsistency', 'The same problem solved three different ways across service, mobile and internal web.'],
    ['scale', P.amber, 'Standards deviation', 'Generic AI patterns replace our naming, layering, logging and error handling.'],
    ['recycle', P.plum, 'Lost reuse', 'New utilities, validators and CSS written while proven base classes sit unused.'],
    ['link', P.slate, 'Traceability gaps', 'Code, tests and defects with no requirement ID. Coverage cannot be proven at audit.'],
    ['search', P.teal, 'Silent omissions', 'Requirements and test cases dropped during generation, with nothing to flag the loss.'],
    ['eye', P.rust, 'Review debt', 'Large AI diffs approved quickly; the defects surface after release, not before.']
  ];
  const xs = [M, 4.78, 8.96], ys = [1.5, 3.62];
  items.forEach(([ic, col, t, d], i) => {
    const x = xs[i % 3], y = ys[Math.floor(i / 3)];
    s.addShape(SH.roundRect, { x, y, w: 3.85, h: 1.95, rectRadius: 0.09, fill: { color: P.white }, line: { color: P.line, width: 0.75 }, shadow: sh({ opacity: 0.08, blur: 8, offset: 1 }) });
    iconCircle(s, x + 0.26, y + 0.24, 0.44, col, ic);
    txt(s, t, { x: x + 0.82, y: y + 0.24, w: 2.8, h: 0.44, fontSize: 14, bold: true, color: P.ink, valign: 'middle' });
    txt(s, d, { x: x + 0.28, y: y + 0.82, w: 3.3, h: 1.0, fontSize: 12, color: '3F5A63', lineSpacing: 15 });
  });
  s.addShape(SH.roundRect, { x: M, y: 5.78, w: CW, h: 1.0, rectRadius: 0.09, fill: { color: 'FBF0EC' }, line: { color: 'E8C7B8', width: 1 } });
  iconCircle(s, M + 0.26, 6.08, 0.42, P.rust, 'warn');
  txt(s, [{ text: 'The compounding cost:  ', options: { bold: true, color: P.rust } },
  { text: 'every inconsistency we accept today is paid again at every future enhancement. An inconsistent codebase turns routine change requests into critical, high-risk projects — which is exactly what this framework exists to prevent.', options: { color: P.ink } }],
    { x: M + 0.84, y: 5.9, w: CW - 1.1, h: 0.76, fontSize: 12.5, valign: 'middle', lineSpacing: 16 });
  s.addNotes('Land the compounding cost argument here — this is the business case. Future enhancement must stay routine, never critical.');
}

/* ======================= 5. PROS ======================= */
function sPros() {
  const s = content('AI: AN HONEST VIEW', 'What AI genuinely gives us — this is why we keep it');
  const items = [
    ['bolt', 'Speed on first drafts', 'SFVD, boilerplate, test cases, release notes and scripts arrive in minutes, not days.'],
    ['search', 'Breadth of coverage', 'Boundary, negative and cross-surface scenarios that a tired human reliably forgets.'],
    ['layers', 'Consistency when context is pinned', 'Given the same standards and examples, AI repeats our patterns more faithfully than we do.'],
    ['book', 'Documentation stops lagging', 'Traceability entries, API docs and release notes generated from the source of truth.'],
    ['users', 'Levelling across the team', 'A first-year developer produces output close to the team standard, if the context is right.'],
    ['compass', 'Senior time moves upstream', 'Architects spend their hours on design, reuse and review instead of boilerplate.']
  ];
  let y = 1.5;
  items.forEach(([ic, t, d], i) => {
    const x = i % 2 === 0 ? M : 6.81;
    if (i % 2 === 0 && i > 0) y += 1.78;
    s.addShape(SH.roundRect, { x, y, w: 5.88, h: 1.62, rectRadius: 0.09, fill: { color: i % 2 ? P.surface2 : P.surface }, line: { color: P.line, width: 0.75 } });
    iconCircle(s, x + 0.26, y + 0.26, 0.46, P.teal, ic);
    txt(s, t, { x: x + 0.86, y: y + 0.2, w: 4.8, h: 0.42, fontSize: 14.5, bold: true, color: P.ink, valign: 'middle' });
    txt(s, d, { x: x + 0.86, y: y + 0.66, w: 4.8, h: 0.8, fontSize: 12, color: '3F5A63', lineSpacing: 15 });
  });
  txt(s, 'None of this is in dispute. The question is not whether to use AI — it is what we put around it.', { x: M, y: 6.62, w: CW, h: 0.34, fontSize: 13, italic: true, bold: true, color: P.teal });
  s.addNotes('Be genuinely positive here. Credibility for the next slide depends on the team believing we are not anti-AI.');
}

/* ======================= 6. CONS ======================= */
function sCons() {
  const s = content('AI: AN HONEST VIEW', 'Where AI fails us — and why it fails quietly', true);
  const items = [
    ['Confident but wrong', 'Invents fields, validations, error codes and API shapes that look entirely plausible.'],
    ['Non-deterministic', 'Two developers, one requirement, two different designs — both defensible, neither aligned.'],
    ['Context-blind by default', 'It cannot see our base classes, so it rewrites them instead of calling them.'],
    ['Silent omission', 'Drops a requirement or a test case and never tells you what it left out.'],
    ['Over-generation', 'Dead code, speculative abstractions and brand-new CSS nobody asked for.'],
    ['Traceability loss', 'Output arrives with no link to a requirement, so coverage cannot be proven.'],
    ['Security and IP exposure', 'Secrets pasted into prompts; snippets of unknown licence pulled into our product.'],
    ['Review fatigue', 'A 900-line generated diff gets the same five minutes a 90-line one used to get.']
  ];
  const xs = [M, 6.81];
  items.forEach(([t, d], i) => {
    const x = xs[i % 2], y = 1.5 + Math.floor(i / 2) * 1.26;
    s.addShape(SH.roundRect, { x, y, w: 5.88, h: 1.12, rectRadius: 0.08, fill: { color: P.white }, line: { color: 'E8C7B8', width: 1 } });
    s.addShape(SH.ellipse, { x: x + 0.24, y: y + 0.3, w: 0.52, h: 0.52, fill: { color: 'F6E4DC' }, line: { type: 'none' } });
    txt(s, String(i + 1), { x: x + 0.24, y: y + 0.3, w: 0.52, h: 0.52, fontSize: 14, bold: true, color: P.rust, align: 'center', valign: 'middle' });
    txt(s, t, { x: x + 0.92, y: y + 0.14, w: 4.8, h: 0.38, fontSize: 13.5, bold: true, color: P.rust, valign: 'middle' });
    txt(s, d, { x: x + 0.92, y: y + 0.52, w: 4.85, h: 0.52, fontSize: 11.5, color: '3F5A63', lineSpacing: 14 });
  });
  txt(s, 'Every one of these is manageable. None of them is self-correcting — each needs a named control and a named human.', { x: M, y: 6.6, w: CW, h: 0.34, fontSize: 13, italic: true, bold: true, color: P.rust });
  s.addNotes('Do not soften these. Each maps to a control on the next slide — that pairing is the heart of the framework.');
}

/* ======================= 7. CONS -> CONTROLS ======================= */
function sControls() {
  const s = content('AI: AN HONEST VIEW', 'Every risk has one named control, one stage and one piece of evidence');
  const head = ['Risk from AI', 'The control that removes it', 'Stage', 'Evidence we keep'];
  const rows = [
    ['Confident but wrong output', 'Checklist review against the data dictionary, validation and error-code catalogue. AI must declare every assumption it made.', 'S1-S3', 'Signed review checklist'],
    ['Different design each time', 'Pinned Context Pack, standard stage prompt templates and golden reference examples.', 'All', 'Context version stamped on the artifact'],
    ['Rewrites what we already have', 'Shared library index loaded as context; reuse question is mandatory in review; duplication gate in CI.', 'S3-S5', 'Sonar duplication report'],
    ['Coding and naming drift', 'Standards files in context; PMD, Checkstyle and naming lint block the pull request.', 'S4-S5', 'CI gate result on the PR'],
    ['Silent omission', 'Traceability link check and automation parity check — approved cases must equal executed cases.', 'S1, S6, S7', 'RTM completeness report'],
    ['Traceability loss', 'Requirement ID mandatory in branch, commit, test case, defect and release note.', 'All', 'Automated ID link-check job'],
    ['Over-generation and dead code', 'Reuse-before-create rule, style class catalogue, reviewer removes anything unused.', 'S4-S5', 'Review comments on the PR'],
    ['Secrets and IP exposure', 'Approved tooling only, no secrets in prompts, dependency and secret scanning in CI.', 'All', 'Scan report and tooling policy'],
    ['Review fatigue', 'Pull requests under 400 lines, independent reviewer, monthly audit of a 10% sample.', 'S5', 'Audit log and PR size metric']
  ];
  s.addTable([head.map(h => ({ text: h, options: { bold: true, color: P.white, fill: { color: P.ink }, fontSize: 11.5, valign: 'middle' } }))].concat(
    rows.map((r, i) => r.map((cell, j) => ({
      text: cell,
      options: {
        fontSize: 10.8, color: j === 0 ? P.rust : P.ink, bold: j === 0,
        fill: { color: i % 2 ? P.surface2 : P.white }, valign: 'middle',
        align: j === 2 ? 'center' : 'left'
      }
    })))), {
    x: M, y: 1.46, w: CW, colW: [2.85, 5.1, 1.1, 3.05], rowH: 0.47,
    border: { type: 'solid', color: P.line, pt: 0.5 }, margin: 0.07, autoPage: false
  });
  txt(s, 'Not one of these controls requires us to trust the AI. Each one is a check a person or a job performs on the output.',
    { x: M, y: 6.34, w: CW, h: 0.4, fontSize: 12, bold: true, italic: true, color: P.teal, align: 'center' });
  s.addNotes('This is the single most important slide for sceptics. Walk two rows in detail, then move on. Note nothing here depends on trusting the AI.');
}

/* ======================= 8. PRINCIPLES ======================= */
function sPrinciples() {
  const s = content('OPERATING MODEL', 'Five principles that govern every stage', true);
  const items = [
    ['robot', P.teal, 'AI drafts. A human decides. The gate records.', 'AI output is never a deliverable. It becomes one only when a named reviewer accepts it and the gate is recorded.'],
    ['layers', P.plum, 'Context is shared, never personal', 'Standards, structure, shared libraries, style classes and test data live in one versioned pack that every prompt loads.'],
    ['link', P.slate, 'Nothing moves without an ID', 'Every artifact, commit, test case and defect carries the requirement ID. If it is not linked, it does not ship.'],
    ['recycle', P.green, 'Reuse before create', 'A new utility, base method, CSS class or service is justified in writing, or it is not written at all.'],
    ['clip', P.amber, 'Evidence or it did not happen', 'A gate passes only with a recorded artifact: checklist, scan result, approval. Verbal sign-off is not a gate.']
  ];
  let y = 1.5;
  items.forEach(([ic, col, t, d]) => {
    s.addShape(SH.roundRect, { x: M, y, w: CW, h: 0.98, rectRadius: 0.09, fill: { color: P.white }, line: { color: P.line, width: 0.75 }, shadow: sh({ opacity: 0.07, blur: 6, offset: 1 }) });
    iconCircle(s, M + 0.26, y + 0.25, 0.48, col, ic);
    txt(s, t, { x: M + 0.92, y: y + 0.12, w: 5.1, h: 0.4, fontSize: 14.5, bold: true, color: col, valign: 'middle' });
    txt(s, d, { x: M + 6.3, y: y + 0.2, w: 5.5, h: 0.6, fontSize: 12, color: '3F5A63', lineSpacing: 15, valign: 'middle' });
    y += 1.06;
  });
  s.addNotes('Read the five aloud. These are the rules we are asking the team to adopt from Monday.');
}

function defBullets(s, pairs, o, nameColor) {
  const runs = [];
  pairs.forEach(([name, desc], i) => {
    runs.push({ text: name, options: { bullet: true, bold: true, color: nameColor || P.ink } });
    runs.push({ text: '  ' + desc, options: { breakLine: i < pairs.length - 1, color: '3F5A63' } });
  });
  s.addText(runs, Object.assign({ isTextBox: true, margin: 0, valign: 'top', fontSize: 12, lineSpacing: 15, paraSpaceAfter: 7 }, o));
}

const STAGES = [
  ['Requirements', 'REQ'], ['SFVD', 'SFVD'], ['Design + contract', 'DESIGN'], ['Development', 'DEV'],
  ['Code review', 'REVIEW'], ['Test design', 'TEST CASE'], ['Test execution', 'TEST RUN'],
  ['Build + release', 'RELEASE'], ['Deploy + close', 'DEPLOY']
];

/* ======================= 9. FRAMEWORK AT A GLANCE ======================= */
function sFramework() {
  const s = content('THE FRAMEWORK', 'Nine stages: what AI does, and the gate that closes each one');
  const data = [
    [P.slate, 'Requirements', 'Structures the register, lists every ambiguity', 'Register approved, requirement IDs frozen'],
    [P.slate, 'SFVD', 'Drafts screens, fields, validations, flows', 'SFVD baselined, field matrix updated'],
    [P.plum, 'Design and contract', 'Drafts API contract, impact and reuse map', 'Contract merged before any code starts'],
    [P.teal, 'Development', 'Writes code inside our structure and libraries', 'PR with checklist, static gates green'],
    [P.teal, 'Code review', 'Scans for deviation, duplication, missing tests', 'Independent human approval recorded'],
    [P.amber, 'Test design', 'Generates cases from SFVD and contract', 'At least one case per requirement ID'],
    [P.amber, 'Test execution', 'Drafts automation scripts and defect notes', 'Automation parity check passes'],
    [P.green, 'Build and release', 'Drafts release notes from commits and IDs', 'Signed, immutable release package'],
    [P.green, 'Deploy and close', 'Builds smoke pack, summarises post-deploy logs', 'Smoke passes, traceability matrix frozen']
  ];
  const xs = [M, 4.78, 8.96], ys = [1.42, 3.06, 4.70];
  data.forEach(([col, name, ai, gate], i) => {
    const x = xs[i % 3], y = ys[Math.floor(i / 3)];
    s.addShape(SH.roundRect, { x, y, w: 3.85, h: 1.48, rectRadius: 0.09, fill: { color: P.white }, line: { color: P.line, width: 0.75 }, shadow: sh({ opacity: 0.08, blur: 7, offset: 1 }) });
    s.addShape(SH.ellipse, { x: x + 0.24, y: y + 0.2, w: 0.44, h: 0.44, fill: { color: col }, line: { type: 'none' } });
    txt(s, String(i + 1), { x: x + 0.24, y: y + 0.2, w: 0.44, h: 0.44, fontSize: 14, bold: true, color: P.white, align: 'center', valign: 'middle' });
    txt(s, name, { x: x + 0.8, y: y + 0.2, w: 2.85, h: 0.44, fontSize: 14, bold: true, color: P.ink, valign: 'middle' });
    txt(s, [{ text: 'AI   ', options: { bold: true, color: P.teal } }, { text: ai, options: { color: '3F5A63' } }],
      { x: x + 0.28, y: y + 0.7, w: 3.35, h: 0.38, fontSize: 10.8, lineSpacing: 13 });
    txt(s, [{ text: 'GATE   ', options: { bold: true, color: P.amber } }, { text: gate, options: { color: '3F5A63' } }],
      { x: x + 0.28, y: y + 1.08, w: 3.35, h: 0.38, fontSize: 10.8, lineSpacing: 13 });
  });
  s.addShape(SH.roundRect, { x: M, y: 6.26, w: CW, h: 0.68, rectRadius: 0.08, fill: { color: P.ink }, line: { type: 'none' } });
  txt(s, [{ text: 'Mandatory manual review sits between the AI column and the gate column in every single stage.  ', options: { bold: true, color: P.white } },
  { text: 'No stage output becomes the next stage input without a named reviewer and a recorded gate.', options: { color: 'B9CED4' } }],
    { x: M + 0.3, y: 6.26, w: CW - 0.6, h: 0.68, fontSize: 11, valign: 'middle', lineSpacing: 14 });
  s.addNotes('Point out the three colour bands: definition (1-3), build (4-5), prove (6-7), ship (8-9). Then say: every one of these runs the same five-step loop, which is the next slide.');
}

/* ======================= 10. ANATOMY OF A STAGE ======================= */
function sAnatomy() {
  const s = content('THE FRAMEWORK', 'One pattern, repeated in all nine stages — learn it once', true);
  const boxes = [
    [P.slate, 'input', 'Approved input', 'The signed artifact from the previous stage, plus the pinned Context Pack version.'],
    [P.teal, 'robot', 'Standard prompt', 'The stage prompt template. Nobody writes a free-form prompt for a deliverable.'],
    [P.teal, 'doc', 'AI draft', 'Deliverable in the standard template, with assumptions and open questions declared.'],
    [P.rust, 'review', 'Manual review', 'Four levels: automated checks, role checklist, independent reviewer, recorded sign-off.'],
    [P.amber, 'gate', 'Signed artifact', 'Versioned, context-stamped, linked in the traceability matrix, released to the next stage.']
  ];
  let x = 0.59;
  boxes.forEach(([col, ic, t, d], i) => {
    s.addShape(SH.roundRect, { x, y: 2.1, w: 2.2, h: 2.5, rectRadius: 0.1, fill: { color: P.white }, line: { color: col, width: 1.25 }, shadow: sh({ opacity: 0.08, blur: 8, offset: 1 }) });
    iconCircle(s, x + 0.86, 2.3, 0.48, col, ic);
    txt(s, t, { x: x + 0.12, y: 2.86, w: 1.96, h: 0.4, fontSize: 13.5, bold: true, color: col, align: 'center', valign: 'middle' });
    txt(s, d, { x: x + 0.16, y: 3.28, w: 1.88, h: 1.2, fontSize: 10.5, color: '3F5A63', align: 'center', lineSpacing: 13 });
    if (i < 4) arrow(s, x + 2.3, 3.25, 0.22, P.slate);
    x += 2.48;
  });
  txt(s, 'Stage N', { x: 0.59, y: 1.58, w: 2.2, h: 0.32, fontSize: 11, bold: true, color: P.muted, align: 'center' });
  txt(s, 'becomes the input to Stage N+1', { x: 9.0, y: 1.58, w: 3.3, h: 0.32, fontSize: 11, bold: true, color: P.amber, align: 'center' });
  s.addShape(SH.roundRect, { x: 0.59, y: 4.95, w: 12.12, h: 0.78, rectRadius: 0.09, fill: { color: 'FBF0EC' }, line: { color: 'E8C7B8', width: 1 } });
  iconCircle(s, 0.82, 5.13, 0.42, P.rust, 'history');
  txt(s, [{ text: 'Rejected at the gate:  ', options: { bold: true, color: P.rust } },
  { text: 'the artifact returns to the same stage with a recorded reason — and the gap is raised as a pull request against the Context Pack, so the same mistake is not regenerated by anyone else tomorrow.', options: { color: P.ink } }],
    { x: 1.4, y: 4.95, w: 11.1, h: 0.78, fontSize: 12, valign: 'middle', lineSpacing: 15 });
  const facts = [['Nothing skips a box', P.slate], ['The reviewer is never the AI operator', P.rust], ['The gate is a record, not a conversation', P.amber]];
  let fx = 0.59;
  facts.forEach(([t, c]) => {
    s.addShape(SH.roundRect, { x: fx, y: 5.95, w: 3.93, h: 0.62, rectRadius: 0.08, fill: { color: P.surface }, line: { type: 'none' } });
    s.addShape(SH.ellipse, { x: fx + 0.22, y: 6.14, w: 0.24, h: 0.24, fill: { color: c }, line: { type: 'none' } });
    txt(s, t, { x: fx + 0.58, y: 5.95, w: 3.2, h: 0.62, fontSize: 11.5, bold: true, color: P.ink, valign: 'middle' });
    fx += 4.1;
  });
  s.addNotes('This is the slide to hang the whole session on. If the team only remembers one picture, make it this one.');
}

/* ======================= 11. WHY COMMON CONTEXT ======================= */
function sWhyContext() {
  const s = content('COMMON CONTEXT LAYER', 'Consistent output is an input problem, not an AI problem');
  const layers = [
    [2.45, 2.8, P.amber, 'Task prompt', 'personal to the task'],
    [3.33, 3.7, P.plum, 'Surface profile', 'microservice / mobile / internal web'],
    [4.21, 4.6, P.slate, 'Product context', 'domain, shared libraries, style classes'],
    [5.09, 5.5, P.deep, 'Organisation standards', 'coding, naming, structure, security']
  ];
  const cx = 3.45;
  layers.forEach(([y, w, col, t, d]) => {
    s.addShape(SH.trapezoid, { x: cx - w / 2, y, w, h: 0.84, fill: { color: col }, line: { color: P.white, width: 1.5 }, rotate: 180 });
    txt(s, t, { x: cx - w / 2, y: y + 0.1, w, h: 0.34, fontSize: 13, bold: true, color: P.white, align: 'center', valign: 'middle' });
    txt(s, d, { x: cx - w / 2, y: y + 0.42, w, h: 0.3, fontSize: 10, color: 'D5E4E8', align: 'center', valign: 'middle' });
  });
  txt(s, 'written by one person', { x: 5.05, y: 2.72, w: 1.8, h: 0.3, fontSize: 10, bold: true, color: P.amber });
  txt(s, 'The three layers below the task prompt are shared and versioned — identical for everyone.',
    { x: 0.7, y: 6.1, w: 5.5, h: 0.6, fontSize: 11, bold: true, color: P.slate, align: 'center', lineSpacing: 14 });
  card(s, {
    x: 6.95, y: 1.46, w: 5.75, h: 3.6, label: 'WHY THIS FIXES INCONSISTENCY', accent: P.teal, icon: 'layers', fill: P.surface, bodySize: 12.5,
    items: [
      'Most of what AI needs is identical for every developer and every task — only the last layer changes.',
      'Pin the shared layers once and two developers asking the same question get the same answer.',
      'Leave them unpinned and every prompt silently invents its own standard.',
      'The pack is loaded automatically from the repository, so nobody has to remember to attach it.',
      'A context gap is treated as a defect: raise a pull request against the pack and everyone is fixed at once.'
    ]
  });
  s.addShape(SH.roundRect, { x: 6.95, y: 5.2, w: 5.75, h: 1.45, rectRadius: 0.09, fill: { color: P.ink }, line: { type: 'none' } });
  iconCircle(s, 7.2, 5.45, 0.44, P.amberBright, 'key');
  txt(s, 'Same context + same prompt template + same approved input', { x: 7.8, y: 5.3, w: 4.7, h: 0.46, fontSize: 12.5, bold: true, color: 'B9CED4', valign: 'middle' });
  txt(s, 'equals the same shape of output, from every developer, every time.', { x: 7.2, y: 5.78, w: 5.3, h: 0.78, fontSize: 13.5, bold: true, color: 'FFFFFF', valign: 'middle', lineSpacing: 16 });
  s.addNotes('Ask the room: how many of you have pasted a requirement straight into a chat window? That is the top layer without the bottom three.');
}

/* ======================= 12. THE CONTEXT PACK ======================= */
function sContextPack() {
  const s = content('COMMON CONTEXT LAYER', 'The Context Pack: one versioned folder, loaded into every prompt', true);
  const cards = [
    [M, 1.46, P.slate, 'tools', 'HOW WE BUILD', [
      ['10-coding-standards.md', 'layering, exceptions, logging, transactions, audit'],
      ['11-naming-conventions.md', 'package, class, method, table, column, API path, branch'],
      ['12-folder-structure.md', 'the canonical project skeleton and where a feature goes'],
      ['22-api-contract-standards.md', 'REST conventions, versioning, paging, error envelope']
    ]],
    [6.81, 1.46, P.green, 'recycle', 'WHAT WE REUSE', [
      ['20-shared-library-index.md', 'every base class, validator and utility, with "do not rewrite" list'],
      ['21-ui-style-guide.md', 'design tokens, approved style classes, component catalogue'],
      ['99-golden-examples/', 'one reference feature per surface for AI to imitate']
    ]],
    [M, 3.92, P.amber, 'clip', 'HOW WE PROVE IT', [
      ['30-test-standards.md', 'case template, ID convention, automation and locator patterns'],
      ['31-test-data-and-seed.md', 'seed data structure, standard asset fixtures, masking rules'],
      ['60-review-checklists/', 'the per-stage checklist that each gate is scored against']
    ]],
    [6.81, 3.92, P.plum, 'shield', 'DOMAIN AND GUARDRAILS', [
      ['00-product-overview.md', 'asset classes, depreciation methods, label and audit glossary'],
      ['40-security-and-compliance.md', 'authorisation model, PII handling, audit log, secrets policy'],
      ['50-prompt-templates/', 'the approved prompt for each of the nine stages']
    ]]
  ];
  cards.forEach(([x, y, col, ic, label, pairs]) => {
    s.addShape(SH.roundRect, { x, y, w: 5.88, h: 2.26, rectRadius: 0.09, fill: { color: P.white }, line: { color: P.line, width: 0.75 }, shadow: sh({ opacity: 0.08, blur: 7, offset: 1 }) });
    iconCircle(s, x + 0.24, y + 0.2, 0.42, col, ic);
    txt(s, label, { x: x + 0.78, y: y + 0.2, w: 4.9, h: 0.42, fontSize: 11.5, bold: true, color: col, charSpacing: 0.8, valign: 'middle' });
    defBullets(s, pairs, { x: x + 0.28, y: y + 0.7, w: 5.32, h: 1.44, fontSize: 11.5 }, col);
  });
  s.addShape(SH.roundRect, { x: M, y: 6.28, w: CW, h: 0.66, rectRadius: 0.08, fill: { color: P.ink }, line: { type: 'none' } });
  txt(s, [{ text: 'Lives at /ai-context in the repository.  ', options: { bold: true, color: 'FFFFFF' } },
  { text: 'Loaded automatically by the project instruction file · every change is a pull request with two approvals and a version bump · the version is stamped on every artifact AI produces.', options: { color: 'B9CED4' } }],
    { x: M + 0.3, y: 6.28, w: CW - 0.6, h: 0.66, fontSize: 10.5, valign: 'middle', lineSpacing: 13 });
  s.addNotes('Stress that this is small and maintainable — it is not a 200-page standards manual. Each file is a page or two of rules AI can actually follow.');
}

/* ======================= 13. CONTEXT PER SURFACE ======================= */
function sSurfaces() {
  const s = content('COMMON CONTEXT LAYER', 'One pack, three surface profiles — the shared sections stay identical');
  const cols = [
    [M, P.teal, 'server', 'WEB AND MICROSERVICES', [
      'Controller / service / repository layering, enforced by lint',
      'Base classes: BaseEntity, BaseService, AuditAware, error envelope',
      'OpenAPI contract first — no handwritten client code',
      'Package naming per bounded context; no cross-service database access',
      'Migration script naming and rollback expectations',
      'Transaction boundary and audit log rules for asset and depreciation writes'
    ]],
    [4.78, P.plum, 'mobile', 'MOBILE APPLICATION', [
      'Offline-first and sync rules for asset scanning in the field',
      'Shared barcode and RFID scan component — never re-implemented',
      'Screen, navigation and resource naming conventions',
      'Supported device and OS matrix for generated test cases',
      'Services consumed only through the generated contract client',
      'Secure storage, permission and image-capture standards'
    ]],
    [8.96, P.slate, 'desktop', 'INTERNAL WEB APPLICATIONS', [
      'Shared component library: grid, filter, upload, date, approval widget',
      'Approved style classes only — new CSS requires written justification',
      'Role-based menu and authorisation pattern',
      'Standard report, export and bulk-upload validation templates',
      'Audit trail display standard for validation and audit screens',
      'Pagination and large-dataset handling rules for asset registers'
    ]]
  ];
  cols.forEach(([x, col, ic, label, items]) => {
    card(s, { x, y: 1.46, w: 3.85, h: 4.6, label, items, accent: col, icon: ic, fill: x === 4.78 ? P.surface2 : P.surface, labelSize: 11.5, bodySize: 11.8 });
  });
  s.addShape(SH.roundRect, { x: M, y: 6.2, w: CW, h: 0.76, rectRadius: 0.09, fill: { color: P.surface }, line: { color: P.line, width: 1 } });
  iconCircle(s, M + 0.24, 6.37, 0.42, P.teal, 'link');
  txt(s, [{ text: 'The three surfaces differ only where they are allowed to differ.  ', options: { bold: true, color: P.ink } },
  { text: 'Domain glossary, requirement IDs, validation rules, error codes, test data and review checklists are the same file for all three — which is what keeps a loosely coupled product behaving like one product.', options: { color: '3F5A63' } }],
    { x: M + 0.82, y: 6.2, w: CW - 1.05, h: 0.76, fontSize: 11.5, valign: 'middle', lineSpacing: 14 });
  s.addNotes('For a loosely coupled architecture, the shared context layer is the only thing holding the user experience and the data rules together. Say that explicitly.');
}

/* ======================= 14. PROMPT TEMPLATE ======================= */
function sPrompt() {
  const s = content('COMMON CONTEXT LAYER', 'The standard stage prompt — eight blocks, no free-form prompting', true);
  const blocks = [
    ['ROLE', 'You are a senior engineer on the Fixed Assets suite, working on the <surface> profile.', P.slate],
    ['CONTEXT', 'Load /ai-context version 2.3, profile: microservice. Treat it as binding, not advisory.', P.slate],
    ['INPUT', 'Approved artifact ID and version — referenced, never retyped or summarised by hand.', P.slate],
    ['TASK', 'One stage deliverable only. Never combine two stages in a single prompt.', P.teal],
    ['CONSTRAINTS', 'Reuse these listed classes and style classes. Do not create new utilities, CSS or error codes.', P.teal],
    ['OUTPUT FORMAT', 'Fill the standard template exactly, so that review becomes mechanical, not interpretive.', P.teal],
    ['TRACEABILITY', 'Stamp the requirement IDs and the context version on every section you produce.', P.amber],
    ['SELF-CHECK', 'List the standards you applied, the reuse decisions you made, and every assumption.', P.rust]
  ];
  blocks.forEach(([n, d, col], i) => {
    const x = i % 2 === 0 ? M : 6.81, y = 1.46 + Math.floor(i / 2) * 0.92;
    s.addShape(SH.roundRect, { x, y, w: 5.88, h: 0.8, rectRadius: 0.08, fill: { color: P.white }, line: { color: P.line, width: 0.75 } });
    s.addShape(SH.roundRect, { x: x + 0.18, y: y + 0.19, w: 0.42, h: 0.42, rectRadius: 0.06, fill: { color: col }, line: { type: 'none' } });
    txt(s, String(i + 1), { x: x + 0.18, y: y + 0.19, w: 0.42, h: 0.42, fontSize: 13, bold: true, color: P.white, align: 'center', valign: 'middle' });
    txt(s, n, { x: x + 0.74, y: y + 0.1, w: 2.2, h: 0.32, fontSize: 11.5, bold: true, color: col, charSpacing: 0.8 });
    txt(s, d, { x: x + 0.74, y: y + 0.4, w: 5.0, h: 0.34, fontSize: 11, color: '3F5A63' });
  });
  s.addShape(SH.roundRect, { x: M, y: 5.28, w: CW, h: 1.0, rectRadius: 0.09, fill: { color: 'FBF0EC' }, line: { color: 'E8C7B8', width: 1 } });
  iconCircle(s, M + 0.26, 5.57, 0.44, P.rust, 'eye');
  txt(s, [{ text: 'Block 8 is non-negotiable.  ', options: { bold: true, color: P.rust } },
  { text: 'The declared assumptions list is where the reviewer looks first. It turns "confidently wrong" from an invisible risk into a written claim that a human can accept or reject in seconds.', options: { color: P.ink } }],
    { x: M + 0.86, y: 5.28, w: CW - 1.1, h: 1.0, fontSize: 12.5, valign: 'middle', lineSpacing: 16 });
  txt(s, 'The nine stage prompts live in /ai-context/50-prompt-templates/ — copy, fill the angle brackets, run. Changing a template is a pull request, not a personal preference.',
    { x: M, y: 6.46, w: CW, h: 0.5, fontSize: 11.5, italic: true, color: P.muted, lineSpacing: 14 });
  s.addNotes('Demo idea: show the same requirement run with and without blocks 2, 5 and 8. The difference is the whole argument.');
}

/* ======================= STAGE SLIDE MACHINERY ======================= */
function rail(s, current) {
  const w = 1.25, gap = 0.1; let x = 0.62;
  STAGES.forEach((st, i) => {
    const on = (i + 1) === current;
    s.addShape(SH.roundRect, { x, y: 1.34, w, h: 0.3, rectRadius: 0.06, fill: { color: on ? P.ink : 'E4EBEE' }, line: { type: 'none' } });
    txt(s, st[1], { x, y: 1.34, w, h: 0.3, fontSize: 10, bold: true, color: on ? P.amberBright : '7A929B', align: 'center', valign: 'middle' });
    x += w + gap;
  });
}
function stageCard(s, x, label, items, accent, icon, fill) {
  const y = 1.82, w = 3.85, h = 3.62;
  s.addShape(SH.roundRect, { x, y, w, h, rectRadius: 0.09, fill: { color: fill }, line: { color: P.line, width: 0.75 }, shadow: sh({ opacity: 0.08, blur: 7, offset: 1 }) });
  iconCircle(s, x + 0.24, y + 0.2, 0.42, accent, icon);
  txt(s, label, { x: x + 0.76, y: y + 0.18, w: w - 0.94, h: 0.46, fontSize: 11, bold: true, color: accent, charSpacing: 0.6, valign: 'middle', lineSpacing: 12 });
  bullets(s, items, { x: x + 0.26, y: y + 0.76, w: w - 0.52, h: h - 0.9, fontSize: 11.4, lineSpacing: 13.5, paraSpaceAfter: 5 });
}
function gateBar(s, gate, roles) {
  s.addShape(SH.roundRect, { x: M, y: 5.58, w: CW, h: 1.28, rectRadius: 0.09, fill: { color: P.ink }, line: { type: 'none' } });
  txt(s, 'EXIT GATE', { x: M + 0.28, y: 5.7, w: 1.3, h: 0.5, fontSize: 10.5, bold: true, color: P.amberBright, charSpacing: 0.8, valign: 'middle' });
  txt(s, gate, { x: M + 1.72, y: 5.7, w: 10.05, h: 0.5, fontSize: 11.8, color: 'FFFFFF', valign: 'middle', lineSpacing: 14 });
  s.addShape(SH.line, { x: M + 0.28, y: 6.24, w: 11.5, h: 0, line: { color: '2A4D57', width: 1 } });
  txt(s, 'ROLES', { x: M + 0.28, y: 6.3, w: 1.3, h: 0.46, fontSize: 10.5, bold: true, color: P.amberBright, charSpacing: 0.8, valign: 'middle' });
  txt(s, roles, { x: M + 1.72, y: 6.3, w: 10.05, h: 0.46, fontSize: 11.2, color: 'B9CED4', valign: 'middle' });
}
function stage(n, title, d) {
  const s = content('STAGE ' + n + ' OF 9  ·  ' + STAGES[n - 1][0].toUpperCase(), title, n % 2 === 0);
  rail(s, n);
  stageCard(s, M, 'INPUTS GIVEN TO AI', d.inputs, P.slate, 'input', P.surface);
  stageCard(s, 4.78, 'WHAT AI PRODUCES', d.ai, P.teal, 'robot', P.white);
  stageCard(s, 8.96, d.reviewLabel, d.review, P.rust, 'review', 'FBF0EC');
  gateBar(s, d.gate, d.roles);
  s.addNotes(d.notes);
  return s;
}

/* ======================= 15-23. THE NINE STAGES ======================= */
function sStages() {
  stage(1, 'Requirements intake and review points', {
    inputs: ['Business requirement note and the client review points', 'Current workflow export, screen inventory and report list',
      'Asset glossary: asset classes, SLM and WDV, CWIP, label format', 'Integration points and validation rules from the legacy module',
      'Non-functional targets: volume, response time, audit retention', 'Context Pack: product overview and compliance sections'],
    ai: ['Requirement register with a unique ID for every line', 'Draft acceptance criteria for each requirement',
      'Ambiguity and assumption list, declared and never guessed', 'Impact map across microservices, mobile and internal web',
      'First-cut priority and release grouping for discussion'],
    reviewLabel: 'MANUAL REVIEW (MANDATORY)\nBusiness Analyst with Product Owner',
    review: ['Every source line traced to a requirement ID, nothing dropped', 'Ambiguities answered by the business, never by the AI',
      'Depreciation and statutory rules verified against policy', 'Scope boundary and priority agreed with the client',
      'No requirement invented or silently widened by AI', 'Stage checklist completed and attached to the epic'],
    gate: 'Requirement Register v1.0 approved in Jira  ·  requirement IDs frozen  ·  traceability matrix rows created  ·  Context Pack version stamped on the document.',
    roles: 'R  Business Analyst      A  Product Owner      C  Architect, QA Lead      I  Development, Release',
    notes: 'Most AI damage starts here: a vague requirement produces a confident, detailed and wrong SFVD. Freezing IDs at this gate is what makes traceability possible for the next eight stages.'
  });
  stage(2, 'SFVD generation: screens, fields and validations', {
    inputs: ['Approved requirement register with frozen IDs', 'SFVD template plus two approved SFVDs as worked examples',
      'Naming conventions and UI style guide from the Context Pack', 'Validation library and error code registry',
      'Data dictionary and entity relationship model', 'Screen and field inventory from the existing product'],
    ai: ['SFVD draft per screen: purpose, actors and business flow', 'Field table: type, length, mandatory, validation ID, error code',
      'User stories with acceptance criteria per requirement ID', 'Reuse callouts naming the components and validators that apply',
      'Open questions list routed back to the business'],
    reviewLabel: 'MANUAL REVIEW (MANDATORY)\nTechnical Writer or BA, with Architect',
    review: ['Every field checked against the data dictionary', 'Validation and error code IDs exist in the registry; none invented',
      'Each screen and field maps back to a requirement ID', 'Business flow matches the approved register, not the AI version',
      'Reuse claims verified in the codebase before being accepted', 'UI references use approved style classes only'],
    gate: 'Finalised SFVD baselined in the document repository  ·  requirement to screen to field matrix updated  ·  released to Development and QA at the same moment.',
    roles: 'R  Technical Writer / BA      A  BA Lead      C  Architect, QA Lead, Product Owner      I  Development, Mobile, Release',
    notes: 'Releasing the SFVD to Dev and QA simultaneously is deliberate: it removes the window where developers and testers work from different versions of the truth.'
  });
  stage(3, 'Solution design and interface contracts', {
    inputs: ['Finalised SFVD and the approved requirement register', 'Current service map, domain boundaries and event topics',
      'Existing OpenAPI specifications for the affected services', 'Database schema, naming standard and shared library index',
      'Non-functional targets, authorisation and audit model'],
    ai: ['Service impact map across all three surfaces', 'OpenAPI contract draft with request, response and error shapes',
      'DTO, entity and sequence design for the main flows', 'Database migration and rollback script drafts',
      'Offline and synchronisation notes for the mobile surface', 'Build-versus-reuse recommendation with written justification'],
    reviewLabel: 'MANUAL REVIEW (MANDATORY)\nArchitect with Tech Lead',
    review: ['Service boundaries respected; no cross-service database access', 'Contract backward compatible, or the version bumped deliberately',
      'Capability does not already exist in another service', 'Base classes and shared libraries reused rather than re-created',
      'Indexes, migration and rollback reviewed with the DBA', 'Authorisation, audit fields and PII handling all present'],
    gate: 'Design note approved  ·  API contract merged to the contract repository before any code is written  ·  mobile and internal web build against that same contract  ·  breaking-change log updated.',
    roles: 'R  Tech Lead      A  Architect      C  DBA, Security, QA Lead      I  All development teams',
    notes: 'This stage did not exist in the old flow and is the one we are adding. In a loosely coupled product the contract is the integration test — agreeing it before code is what keeps three surfaces in step.'
  });
  stage(4, 'Development with AI inside our structure', {
    inputs: ['Approved SFVD section, API contract and design note', 'Coding standards, naming conventions and folder structure',
      'Shared library index and the UI style class catalogue', 'Golden reference example for this surface',
      'The requirement ID this task delivers', 'The same static analysis rule set the pipeline runs'],
    ai: ['Implementation placed inside the existing project structure', 'Unit tests covering the new logic and its boundaries',
      'Configuration entries, i18n keys and migration scripts', 'Inline documentation written in the house style',
      'Self-check note listing standards applied and reuse decisions'],
    reviewLabel: 'MANUAL REVIEW (MANDATORY)\nThe developer owns every line AI wrote',
    review: ['Shared library searched before accepting any new utility or CSS', 'Naming, layering and package placement match the standard',
      'No hardcoded values, no secrets, no leftover AI alternatives', 'Exception handling, logging and audit follow the standard',
      'Query patterns checked for N+1 and missing pagination', 'Requirement ID present in the branch name and every commit'],
    gate: 'Pull request raised with the completed stage checklist  ·  PMD, Sonar and coverage green on new code  ·  self-review evidence attached  ·  pull request kept under 400 lines or split.',
    roles: 'R  Developer      A  Tech Lead      C  Architect      I  QA, Release',
    notes: 'Say this plainly: you own the code AI wrote for you. "The AI generated it" is not a defence at review, and it will not be one in production.'
  });
  stage(5, 'Code review and static quality gates', {
    inputs: ['Pull request diff and the completed developer checklist', 'Coding standards and the shared library index',
      'Sonar baseline, duplication report and coverage delta', 'API contract diff against the approved version',
      'Review checklist for this surface from the Context Pack'],
    ai: ['Plain-language summary of what the diff actually changes', 'Standards deviation scan against our own rule set',
      'Duplicate logic matched against the shared libraries', 'Missing or weak test detection on the changed paths',
      'AI assists the reviewer. It never approves and never merges.'],
    reviewLabel: 'MANUAL REVIEW (MANDATORY)\nIndependent reviewer, never the AI operator',
    review: ['Business logic read line by line against the SFVD', 'Reuse opportunities enforced, not merely noted',
      'Contract adherence and backward compatibility confirmed', 'Security, authorisation and data access reviewed',
      'Test adequacy judged on scenarios, not on coverage percentage', 'Anything the reviewer cannot explain is sent back, not merged'],
    gate: 'Human approval recorded  ·  zero blocker and critical findings  ·  duplication within threshold  ·  new-code coverage at target  ·  merged with the requirement ID in the message.',
    roles: 'R  Reviewer (peer or Tech Lead)      A  Tech Lead      C  Architect, Security      I  QA, Product Owner',
    notes: 'The rule that matters: the reviewer is never the person who ran the prompt. Self-review of AI output is how standards drift becomes permanent.'
  });
  stage(6, 'Test case design from the approved SFVD', {
    inputs: ['Finalised SFVD and the approved API contract', 'Test case template and the test case ID convention',
      'Test data structure and the seed data specification', 'Boundary and negative scenario pattern library',
      'Index of the existing regression suite', 'Device, browser and user role matrix'],
    ai: ['Functional, validation, UI and business flow cases', 'Integration and cross-surface cases derived from the contract',
      'Positive and negative scenarios with expected results', 'Test data requirements mapped to the seed structure',
      'Requirement ID mapping and an automation candidate flag'],
    reviewLabel: 'MANUAL REVIEW (MANDATORY)\nQA Lead with the Business Analyst',
    review: ['Every requirement ID and every field validation is covered', 'No duplicate of a case already in the regression suite',
      'Expected results verified against the SFVD, never assumed', 'Depreciation, label and audit scenarios checked by a domain expert',
      'Test data realistic, masked and compliant with policy', 'Priority, regression and automation tags set deliberately'],
    gate: 'Test suite approved in the test management tool  ·  traceability matrix shows at least one case per requirement ID  ·  suite baselined for this release.',
    roles: 'R  QA Engineer      A  QA Lead      C  Business Analyst, Developer      I  Product Owner, Release',
    notes: 'AI is genuinely strong here — it finds negative cases humans skip. The risk is volume: hundreds of plausible cases, some duplicated, some wrong. The review is about pruning and verifying, not adding.'
  });
  stage(7, 'Test execution and automation', {
    inputs: ['Approved test suite and the seed data script', 'Environment configuration and the test account matrix',
      'Automation framework patterns and the locator standard', 'The existing automated regression pack',
      'Defect template and severity definitions'],
    ai: ['Automation script drafts following our page object pattern', 'Locators, data-driven skeletons and reusable steps',
      'Defect descriptions drafted from failed runs', 'Execution summary mapped back to requirement IDs'],
    reviewLabel: 'MANUAL REVIEW (MANDATORY)\nAutomation Engineer with QA Lead',
    review: ['Each script matches its approved case step for step', 'Assertions genuinely assert the expected result',
      'No hardcoded data, no fixed waits, no environment coupling', 'Tests independent and repeatable in any execution order',
      'Added to the regression pack with the correct tags', 'Anything deferred recorded with a reason and a named owner'],
    gate: 'Automation parity check passes: approved cases equal executed plus automated plus formally deferred  ·  defect log complete and linked  ·  evidence attached to the release record.',
    roles: 'R  Automation Engineer      A  QA Lead      C  Developer      I  Product Owner, Release',
    notes: 'The parity check is the direct answer to "cases get skipped when we automate". It is a count, it is automatic, and it blocks the release build.'
  });
  stage(8, 'Build and release packaging', {
    inputs: ['Merged code and the release scope drawn from Jira', 'Version and branching policy',
      'Release note template and the previous release note', 'Configuration and secret matrix per environment',
      'Migration scripts and the rollback plan'],
    ai: ['Release notes drafted from commits and requirement IDs', 'Configuration difference summary between environments',
      'Deployment checklist and rollback step drafts', 'Dependency and version change summary'],
    reviewLabel: 'MANUAL REVIEW (MANDATORY)\nRelease Manager with DevOps',
    review: ['Version and build number correct, unique and immutable', 'Configuration difference verified against the environment matrix',
      'Migration dry run executed on a production-like copy', 'Release notes reconciled against the traceability matrix',
      'Open defects accepted or deferred in writing, not by silence', 'Approval recorded before the artifact is promoted'],
    gate: 'Signed release package  ·  traceability snapshot attached  ·  artifact immutable and reproducible from the tagged commit.',
    roles: 'R  Release Manager      A  Delivery Manager      C  DevOps, Architect, QA Lead      I  All teams',
    notes: 'Release notes generated from requirement IDs is the quickest visible win of the whole framework — but only if stage 1 froze the IDs.'
  });
  stage(9, 'Deployment, verification and closure', {
    inputs: ['Approved and signed release package', 'Deployment runbook and environment checklist',
      'Smoke pack generated from the traceability matrix', 'Rollback plan and a confirmed backup',
      'Monitoring dashboard and alert thresholds'],
    ai: ['Smoke checklist assembled from the traceability matrix', 'Post-deployment log and metric anomaly summary',
      'Draft closure note and known-issues list'],
    reviewLabel: 'MANUAL REVIEW (MANDATORY)\nDevOps with QA and Product Owner',
    review: ['Pre-deployment validation and backup confirmed by a named person', 'Steps executed from the runbook, never improvised under pressure',
      'Smoke pack executed and signed by QA, not by the deployer', 'Monitoring watched for the agreed window after release',
      'Business sign-off recorded against the release', 'Rollback decision owner named before deployment starts'],
    gate: 'Smoke pack passes in full  ·  monitoring clean for the agreed window  ·  release closed and the traceability matrix frozen as the audit baseline for this version.',
    roles: 'R  DevOps      A  Delivery Manager      C  QA Lead, Product Owner, Architect      I  All teams',
    notes: 'The frozen matrix is what an auditor asks for. It is also what makes the next enhancement cheap, because the next team can see exactly what this release covered.'
  });
}

/* ======================= 24. DEFECT HANDLING ======================= */
function sDefects() {
  const s = content('STAGE 9+  ·  FEEDBACK AND REWORK', 'Defect handling: where AI stops and the engineer starts');
  const tiers = [
    [P.rust, 'ban', 'P1 and P2 production defects', 'No AI at any point. Root cause analysis, fix and regression test are written by the engineer, reviewed by a second engineer.'],
    [P.amber, 'tools', 'P3, P4 and pre-release defects', 'Root cause analysis is manual and approved first. AI may then draft the agreed fix, within the normal stage 4 and 5 gates.'],
    [P.ink, 'warn', 'Never, at any severity', 'Asking AI to make a symptom disappear before a human has written down what actually caused it.']
  ];
  let y = 1.5;
  tiers.forEach(([col, ic, t, d]) => {
    s.addShape(SH.roundRect, { x: M, y, w: 6.5, h: 1.42, rectRadius: 0.09, fill: { color: P.white }, line: { color: col, width: 1.25 } });
    iconCircle(s, M + 0.26, y + 0.24, 0.46, col, ic);
    txt(s, t, { x: M + 0.86, y: y + 0.2, w: 5.4, h: 0.44, fontSize: 14, bold: true, color: col, valign: 'middle' });
    txt(s, d, { x: M + 0.86, y: y + 0.68, w: 5.4, h: 0.66, fontSize: 11.8, color: '3F5A63', lineSpacing: 14 });
    y += 1.56;
  });
  card(s, {
    x: 7.4, y: 1.5, w: 5.3, h: 4.5, label: 'MANDATORY FOR EVERY DEFECT,\nWHATEVER THE SEVERITY', accent: P.slate, icon: 'clip', fill: P.surface, labelSize: 11, bodySize: 12,
    items: ['Root cause recorded: what broke, why it was not caught, and which gate missed it.',
      'A failing test is written before the fix is made, and kept in the regression pack.',
      'Defect linked to its requirement ID and to the release that introduced it.',
      'Fix reviewed by someone other than its author, under the stage 5 gate.',
      'The gate that let the defect through is strengthened, or a waiver is logged with an expiry.',
      'If the root cause was a context gap, the Context Pack is updated in the same week.']
  });
  s.addShape(SH.roundRect, { x: M, y: 6.18, w: CW, h: 0.74, rectRadius: 0.09, fill: { color: 'FDF6E6' }, line: { color: 'E8D2A0', width: 1 } });
  txt(s, [{ text: 'Decision needed today:  ', options: { bold: true, color: P.amber } },
  { text: 'our current rule bans AI for all bug fixing. This refinement keeps the ban where the risk is highest and allows AI on low-severity work once a human has written the root cause. The team needs to confirm the boundary.', options: { color: P.ink } }],
    { x: M + 0.3, y: 6.18, w: CW - 0.6, h: 0.74, fontSize: 11.5, valign: 'middle', lineSpacing: 14 });
  s.addNotes('Explain the reasoning: bug fixing needs intent, and AI optimises for making the symptom disappear. But a blanket ban pushes people to break the rule quietly, which is worse. Get a decision in the room.');
}

/* ======================= 25. TRACEABILITY CHAIN ======================= */
function sTrace() {
  const s = content('VERIFICATION AND GOVERNANCE', 'One unbroken chain: nothing exists in this product without an ID');
  const links = [
    [P.slate, 'Requirement', 'FA-REQ-214'], [P.slate, 'SFVD section', 'SFVD-FA-07 / 4.2'],
    [P.plum, 'API operation', 'POST /assets/depreciation'], [P.teal, 'Commit and PR', 'PR 1182'],
    [P.amber, 'Test case', 'TC-FA-214-03'], [P.rust, 'Defect', 'BUG-FA-911'], [P.green, 'Release', 'REL 4.7.0']
  ];
  let x = 0.51;
  links.forEach(([col, t, id], i) => {
    s.addShape(SH.roundRect, { x, y: 1.72, w: 1.6, h: 1.1, rectRadius: 0.09, fill: { color: col }, line: { type: 'none' }, shadow: sh({ opacity: 0.1, blur: 6, offset: 1 }) });
    txt(s, t, { x: x + 0.06, y: 1.84, w: 1.48, h: 0.42, fontSize: 11.5, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', lineSpacing: 13 });
    txt(s, id, { x: x + 0.04, y: 2.26, w: 1.52, h: 0.44, fontSize: 9.5, color: 'DCE9EC', align: 'center', valign: 'top', lineSpacing: 11 });
    if (i < links.length - 1) arrow(s, x + 1.65, 2.17, 0.2, P.muted);
    x += 1.78;
  });
  card(s, {
    x: M, y: 3.15, w: 5.88, h: 2.95, label: 'HOW THE CHAIN STAYS ALIVE', accent: P.teal, icon: 'link', fill: P.surface, bodySize: 12,
    items: ['The requirement ID is a mandatory field in Jira, the SFVD header, the test case, the branch name and the commit message.',
      'The matrix is generated nightly from those systems — it is never a spreadsheet someone remembers to update.',
      'A link-check job fails the release build if any requirement has no test case, or any commit has no requirement.',
      'AI stamps the IDs, the reviewer confirms them, the job proves them.']
  });
  card(s, {
    x: 6.81, y: 3.15, w: 5.88, h: 2.95, label: 'WHAT THE CHAIN BUYS US', accent: P.green, icon: 'check', fill: P.surface2, bodySize: 12,
    items: ['Coverage can be proven at audit in minutes instead of days.',
      'The impact of a change is visible across all three surfaces before it is made.',
      'The next enhancement starts from evidence rather than archaeology — which is how we keep future work routine instead of critical.',
      'A defect can be traced back to the gate that missed it, so the gate gets fixed, not the person.']
  });
  txt(s, 'This single control answers three of our six gaps: traceability loss, silent omission and review debt.',
    { x: M, y: 6.3, w: CW, h: 0.4, fontSize: 12.5, bold: true, italic: true, color: P.teal, align: 'center' });
  s.addNotes('If someone asks "what is the one thing we must not drop?", it is this chain. Everything else degrades gracefully; this does not.');
}

/* ======================= 26. VERIFICATION LADDER ======================= */
function sLadder() {
  const s = content('VERIFICATION AND GOVERNANCE', 'Verification is standardised: four levels close every gate', true);
  const levels = [
    [P.slate, 'bolt', 'L1', 'Machine checks', 'Lint, PMD, Checkstyle, Sonar, contract diff, coverage, duplication, secret scan and the ID link check. Objective, instant and blocking.'],
    [P.teal, 'clip', 'L2', 'Role checklist', 'The stage checklist from the Context Pack. Every item ticked by the named role, with evidence attached — not a verbal confirmation.'],
    [P.rust, 'review', 'L3', 'Independent review', 'A second human, never the person who ran the prompt, reads the output against the approved input from the previous stage.'],
    [P.amber, 'gate', 'L4', 'Recorded sign-off', 'A tool transition carrying the artifact version, the Context Pack version and the reviewer name. This is the audit trail.']
  ];
  let y = 1.5;
  levels.forEach(([col, ic, lv, t, d], i) => {
    const x = M + i * 0.3, w = CW - i * 0.3;
    s.addShape(SH.roundRect, { x, y, w, h: 1.12, rectRadius: 0.09, fill: { color: P.white }, line: { color: col, width: 1.25 }, shadow: sh({ opacity: 0.07, blur: 6, offset: 1 }) });
    s.addShape(SH.roundRect, { x: x + 0.22, y: y + 0.26, w: 0.62, h: 0.6, rectRadius: 0.08, fill: { color: col }, line: { type: 'none' } });
    txt(s, lv, { x: x + 0.22, y: y + 0.26, w: 0.62, h: 0.6, fontSize: 15, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
    txt(s, t, { x: x + 1.0, y: y + 0.16, w: 3.1, h: 0.4, fontSize: 14.5, bold: true, color: col, valign: 'middle' });
    txt(s, d, { x: x + 1.0, y: y + 0.54, w: w - 1.3, h: 0.5, fontSize: 11.8, color: '3F5A63', lineSpacing: 14 });
    iconCircle(s, x + w - 0.72, y + 0.33, 0.46, col, ic);
    y += 1.2;
  });
  s.addShape(SH.roundRect, { x: M, y: 6.34, w: CW, h: 0.6, rectRadius: 0.09, fill: { color: P.ink }, line: { type: 'none' } });
  txt(s, [{ text: 'The evidence rule:  ', options: { bold: true, color: P.amberBright } },
  { text: 'a gate opens only when all four levels are complete and recorded. Three out of four is not a gate — it is a hope.', options: { color: 'FFFFFF' } }],
    { x: M + 0.3, y: 6.34, w: CW - 0.6, h: 0.6, fontSize: 12.5, valign: 'middle' });
  s.addNotes('Same four levels in all nine stages — that is what "standardised verification" means here. Only the checklist contents change by stage.');
}

/* ======================= 27. AUTOMATED GATES ======================= */
function sGates() {
  const s = content('VERIFICATION AND GOVERNANCE', 'The automated gates — what blocks what, and at which point');
  const head = ['Gate', 'Tooling', 'Threshold', 'Blocks'];
  const rows = [
    ['Standards and naming', 'PMD, Checkstyle, custom naming rules', 'Zero violations in new code', 'Pull request merge'],
    ['Code quality', 'SonarQube quality gate', 'Zero blocker or critical findings', 'Pull request merge'],
    ['Test coverage', 'SonarQube new-code coverage', 'At or above the agreed target on new code', 'Pull request merge'],
    ['Duplication', 'SonarQube / CPD', 'Within the agreed limit on new code', 'Pull request merge'],
    ['Interface contract', 'OpenAPI diff against the approved spec', 'No breaking change without a version bump', 'Pull request merge'],
    ['Security', 'Dependency and secret scanning', 'No high findings, no secrets committed', 'Pull request merge'],
    ['Traceability', 'Nightly link-check job', 'Every requirement linked to code and tests', 'Release build'],
    ['Test parity', 'Test management export comparison', 'Approved equals executed, automated or deferred', 'Release build'],
    ['Smoke verification', 'Smoke pack generated from the matrix', 'Full pass inside the monitoring window', 'Release closure']
  ];
  s.addTable([head.map(h => ({ text: h, options: { bold: true, color: P.white, fill: { color: P.ink }, fontSize: 11.5, valign: 'middle' } }))].concat(
    rows.map((r, i) => r.map((cell, j) => ({
      text: cell, options: {
        fontSize: 11, bold: j === 0, color: j === 0 ? P.ink : '3F5A63',
        fill: { color: i % 2 ? P.surface2 : P.white }, valign: 'middle'
      }
    })))), {
    x: M, y: 1.46, w: CW, colW: [3.0, 3.6, 3.5, 2.0], rowH: 0.47,
    border: { type: 'solid', color: P.line, pt: 0.5 }, margin: 0.08, autoPage: false
  });
  s.addShape(SH.roundRect, { x: M, y: 6.24, w: CW, h: 0.68, rectRadius: 0.09, fill: { color: P.surface }, line: { color: P.line, width: 1 } });
  txt(s, [{ text: 'Exact thresholds are set by the Council and reviewed quarterly.  ', options: { bold: true, color: P.ink } },
  { text: 'They start in warning mode during the pilot and become blocking at day 60, so the team tunes them rather than fights them.', options: { color: '3F5A63' } }],
    { x: M + 0.3, y: 6.24, w: CW - 0.6, h: 0.68, fontSize: 11, valign: 'middle', lineSpacing: 14 });
  s.addNotes('Important tone point: gates start as warnings. We are not switching on nine blocking checks on Monday.');
}

/* ======================= 28. RACI ======================= */
function sRaci() {
  const s = content('VERIFICATION AND GOVERNANCE', 'Who does what: one accountable name per stage', true);
  const head = ['Stage', 'Runs the AI step', 'Accountable', 'Reviews and consulted', 'Informed'];
  const rows = [
    ['1  Requirements', 'Business Analyst', 'Product Owner', 'Architect, QA Lead', 'Dev, Release'],
    ['2  SFVD', 'Technical Writer / BA', 'BA Lead', 'Architect, QA Lead, PO', 'Dev, Mobile, Release'],
    ['3  Design and contract', 'Tech Lead', 'Architect', 'DBA, Security, QA Lead', 'All dev teams'],
    ['4  Development', 'Developer', 'Tech Lead', 'Architect', 'QA, Release'],
    ['5  Code review', 'Reviewer (peer)', 'Tech Lead', 'Architect, Security', 'QA, Product Owner'],
    ['6  Test design', 'QA Engineer', 'QA Lead', 'Business Analyst, Developer', 'PO, Release'],
    ['7  Test execution', 'Automation Engineer', 'QA Lead', 'Developer', 'PO, Release'],
    ['8  Build and release', 'Release Manager', 'Delivery Manager', 'DevOps, Architect, QA Lead', 'All teams'],
    ['9  Deploy and close', 'DevOps', 'Delivery Manager', 'QA Lead, PO, Architect', 'All teams']
  ];
  s.addTable([head.map(h => ({ text: h, options: { bold: true, color: P.white, fill: { color: P.ink }, fontSize: 11.5, valign: 'middle' } }))].concat(
    rows.map((r, i) => r.map((cell, j) => ({
      text: cell, options: {
        fontSize: 11, bold: j === 0 || j === 2, color: j === 2 ? P.rust : (j === 0 ? P.ink : '3F5A63'),
        fill: { color: i % 2 ? P.surface : P.white }, valign: 'middle'
      }
    })))), {
    x: M, y: 1.46, w: CW, colW: [2.6, 2.5, 2.2, 3.1, 1.7], rowH: 0.47,
    border: { type: 'solid', color: P.line, pt: 0.5 }, margin: 0.08, autoPage: false
  });
  s.addShape(SH.roundRect, { x: M, y: 6.24, w: CW, h: 0.68, rectRadius: 0.09, fill: { color: 'FBF0EC' }, line: { color: 'E8C7B8', width: 1 } });
  txt(s, [{ text: 'The one rule that cannot bend:  ', options: { bold: true, color: P.rust } },
  { text: 'the person who ran the AI prompt is never the person who signs the gate for that output. Every stage above keeps those two names apart.', options: { color: P.ink } }],
    { x: M + 0.3, y: 6.24, w: CW - 0.6, h: 0.68, fontSize: 11, valign: 'middle', lineSpacing: 14 });
  s.addNotes('Small teams will push back on separation of duties. The answer: it is one extra person for ten minutes, and it is the control that catches the expensive mistakes.');
}

/* ======================= 29. GOVERNANCE ======================= */
function sGovernance() {
  const s = content('VERIFICATION AND GOVERNANCE', 'Governance: keeping all three surfaces in step as we scale');
  const cards = [
    [M, 1.46, P.plum, 'users', 'AI GOVERNANCE COUNCIL', ['Architect as chair, with QA Lead, Delivery Manager and a security representative.',
      'Thirty minutes, weekly. Owns the Context Pack, the gate thresholds and every waiver.',
      'Reviews the metrics pack monthly and decides what changes.']],
    [6.81, 1.46, P.slate, 'layers', 'CONTEXT PACK CHANGE CONTROL', ['Every change is a pull request with two approvals and a version bump.',
      'A short release note goes to all three surface teams on the same day.',
      'The new version is stamped on every artifact produced after it lands.']],
    [M, 3.92, P.amber, 'search', 'MONTHLY DRIFT AUDIT', ['A ten percent sample of AI-assisted merges is scored against the stage checklists.',
      'Findings become Context Pack improvements, not individual blame.',
      'Repeat findings escalate to a blocking gate at the next review.']],
    [6.81, 3.92, P.rust, 'lock', 'WAIVERS AND ESCALATION', ['Any deviation needs a written waiver with a named owner and an expiry date.',
      'Schedule pressure never bypasses a gate — only the Council can waive one, in writing.',
      'Open waivers are reviewed at every release and cleared or renewed.']]
  ];
  cards.forEach(([x, y, col, ic, label, items]) => {
    card(s, { x, y, w: 5.88, h: 2.32, label, items, accent: col, icon: ic, fill: x === M ? P.surface : P.white, labelSize: 11.5, bodySize: 11.8 });
  });
  const cadence = [['calendar', 'Weekly', 'Council, 30 min'], ['chart', 'Monthly', 'Audit and metrics'],
  ['history', 'Quarterly', 'Refresh prompts'], ['flag', 'Each release', 'Matrix frozen']];
  let x = M;
  cadence.forEach(([ic, when, what]) => {
    s.addShape(SH.roundRect, { x, y: 6.32, w: 2.92, h: 0.6, rectRadius: 0.08, fill: { color: P.ink }, line: { type: 'none' } });
    iconCircle(s, x + 0.16, 6.45, 0.34, P.amberBright, ic);
    txt(s, [{ text: when + '   ', options: { bold: true, color: P.amberBright } }, { text: what, options: { color: 'B9CED4' } }],
      { x: x + 0.6, y: 6.32, w: 2.3, h: 0.6, fontSize: 10.5, valign: 'middle', lineSpacing: 12 });
    x += 3.06;
  });
  s.addNotes('Governance is four small habits, not a bureaucracy. Thirty minutes a week plus one audit a month is the entire overhead.');
}

/* ======================= 30. METRICS ======================= */
function sMetrics() {
  const s = content('VERIFICATION AND GOVERNANCE', 'How we will know it is working', true);
  s.addChart(pres.ChartType.bar, [{
    name: 'Automated machine checks',
    labels: STAGES.map((x, i) => (i + 1) + '. ' + x[0]),
    values: [1, 2, 3, 6, 5, 2, 3, 3, 2]
  }, {
    name: 'Human checklist items',
    labels: STAGES.map((x, i) => (i + 1) + '. ' + x[0]),
    values: [6, 6, 6, 6, 6, 6, 6, 6, 6]
  }], {
    x: 0.5, y: 1.46, w: 8.0, h: 4.6,
    barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 55,
    chartColors: [P.teal, P.rust],
    showTitle: true, title: 'Checks that close each stage gate', titleColor: P.ink, titleFontSize: 13, titleFontFace: '+mn-lt',
    showValue: true, dataLabelPosition: 'ctr', dataLabelColor: 'FFFFFF', dataLabelFontSize: 10, dataLabelFontFace: '+mn-lt',
    catAxisLabelColor: '3F5A63', catAxisLabelFontSize: 9.5, catAxisLabelFontFace: '+mn-lt', catAxisLabelRotate: 300,
    valAxisLabelColor: '3F5A63', valAxisLabelFontSize: 9.5, valAxisLabelFontFace: '+mn-lt', valAxisMaxVal: 14,
    valGridLine: { color: 'E4EBEE', size: 0.75 }, catGridLine: { style: 'none' },
    showLegend: true, legendPos: 'b', legendColor: '3F5A63', legendFontSize: 10, legendFontFace: '+mn-lt'
  });
  txt(s, 'Human review is constant across all nine stages. Automation varies — it carries the heaviest load exactly where AI writes the most.',
    { x: 0.6, y: 6.15, w: 7.8, h: 0.6, fontSize: 11.5, italic: true, color: P.muted, lineSpacing: 14 });
  card(s, {
    x: 8.75, y: 1.46, w: 3.95, h: 5.3, label: 'REVIEWED MONTHLY BY THE COUNCIL', accent: P.amber, icon: 'chart', fill: P.surface, labelSize: 11, bodySize: 11.5,
    items: ['Traceability matrix completeness — target 100%',
      'Automation parity — target 100%',
      'Commits carrying a requirement ID — target 100%',
      'Gates closed with recorded evidence — target 100%',
      'New-code coverage and duplication against the agreed limits',
      'Review findings per AI-assisted pull request — expected to fall as the Context Pack matures',
      'Defects escaping to production per release',
      'Cycle time per stage — this is where the AI benefit shows up'],
    note: 'Baseline is measured in sprint one. Targets are commitments, not estimates.'
  });
  s.addNotes('The last metric matters most to management: cycle time proves the AI benefit, while the first four prove we did not trade quality for it.');
}

/* ======================= 31. ROLLOUT ======================= */
function sRollout() {
  const s = content('ROLLOUT', 'Ninety days from today, in three steps');
  s.addShape(SH.line, { x: 1.4, y: 1.95, w: 10.6, h: 0, line: { color: P.line, width: 2.5 } });
  const phases = [
    [M, P.slate, 'Days 0 to 30', 'Foundation', ['Publish Context Pack v1.0: standards, naming, folder structure, shared library index, style classes, test data specification.',
      'Write the nine stage prompt templates and the nine review checklists.',
      'Name the Council and agree the initial gate thresholds.',
      'Pick one pilot feature on each of the three surfaces.']],
    [4.78, P.teal, 'Days 31 to 60', 'Pilot and prove', ['Run the full nine-stage flow end to end on the three pilot features.',
      'Turn the CI gates on in warning mode and measure the baseline.',
      'Tune the Context Pack from every review finding, weekly.',
      'Hands-on working session for the whole team, after this one.']],
    [8.96, P.green, 'Days 61 to 90', 'Enforce and scale', ['Gates move from warning to blocking.',
      'Traceability and parity checks become mandatory for the release build.',
      'First monthly drift audit runs; golden examples published.',
      'All new work follows the framework; retrospective produces Context Pack v1.1.']]
  ];
  phases.forEach(([x, col, when, title, items], i) => {
    s.addShape(SH.ellipse, { x: x + 1.75, y: 1.76, w: 0.38, h: 0.38, fill: { color: col }, line: { color: P.white, width: 2.5 } });
    s.addShape(SH.roundRect, { x, y: 2.4, w: 3.85, h: 3.45, rectRadius: 0.09, fill: { color: i === 1 ? P.white : P.surface }, line: { color: col, width: 1.25 }, shadow: sh({ opacity: 0.08, blur: 7, offset: 1 }) });
    pill(s, x + 0.26, 2.62, 1.75, 0.34, when, P.white, col, 10.5);
    txt(s, title, { x: x + 0.26, y: 3.04, w: 3.3, h: 0.42, fontSize: 16, bold: true, color: P.ink, valign: 'middle' });
    bullets(s, items, { x: x + 0.28, y: 3.56, w: 3.3, h: 2.1, fontSize: 11.5, lineSpacing: 14, paraSpaceAfter: 7 });
  });
  s.addShape(SH.roundRect, { x: M, y: 6.12, w: CW, h: 0.68, rectRadius: 0.09, fill: { color: P.ink }, line: { type: 'none' } });
  txt(s, [{ text: 'Nothing stops while this is built.  ', options: { bold: true, color: P.amberBright } },
  { text: 'Current work continues; the framework is applied to new features first, and to existing modules as they are touched.', options: { color: 'FFFFFF' } }],
    { x: M + 0.3, y: 6.12, w: CW - 0.6, h: 0.68, fontSize: 12, valign: 'middle', lineSpacing: 14 });
  s.addNotes('Pre-empt the objection that this halts delivery. It does not: pilot on three features, enforce after it is proven.');
}

/* ======================= 32. DO AND DO NOT ======================= */
function sDos() {
  const s = content('THE SHORT VERSION', 'What we are asking every one of you to do differently', true);
  const dos = ['Start from the approved artifact of the previous stage, never from memory.',
    'Load the Context Pack and use the stage prompt template — do not improvise a prompt.',
    'Make AI declare its assumptions, then review that list first.',
    'Search the shared library before accepting any new utility, CSS class or base method.',
    'Review in small batches: under 400 lines, with the SFVD open beside the diff.',
    'Stamp the requirement ID on the branch, the commit, the test case and the defect.',
    'Raise a context gap as a pull request to /ai-context — fix it once, for everyone.'];
  const donts = ['Do not paste a requirement straight into a free-form prompt.',
    'Do not accept code or a test case you could not explain to a reviewer.',
    'Do not let AI invent a field, a validation, an error code or an API shape.',
    'Do not create a new utility, style class or service before searching for one.',
    'Do not approve your own AI output — the gate needs a second name.',
    'Do not use AI on a production P1 or P2 fix before a human has written the root cause.',
    'Do not skip a gate because the date is close. Ask the Council for a waiver instead.'];
  s.addShape(SH.roundRect, { x: M, y: 1.46, w: 5.88, h: 5.0, rectRadius: 0.1, fill: { color: 'EEF5EF' }, line: { color: 'C6DCC9', width: 1 } });
  iconCircle(s, M + 0.26, 1.66, 0.5, P.green, 'up');
  txt(s, 'DO', { x: M + 0.9, y: 1.66, w: 4.6, h: 0.5, fontSize: 18, bold: true, color: P.green, charSpacing: 1.2, valign: 'middle' });
  bullets(s, dos, { x: M + 0.3, y: 2.3, w: 5.3, h: 4.0, fontSize: 12.5, color: '234A2C', lineSpacing: 15, paraSpaceAfter: 9 });
  s.addShape(SH.roundRect, { x: 6.81, y: 1.46, w: 5.88, h: 5.0, rectRadius: 0.1, fill: { color: 'FBF0EC' }, line: { color: 'E8C7B8', width: 1 } });
  iconCircle(s, 7.07, 1.66, 0.5, P.rust, 'down');
  txt(s, 'DO NOT', { x: 7.71, y: 1.66, w: 4.6, h: 0.5, fontSize: 18, bold: true, color: P.rust, charSpacing: 1.2, valign: 'middle' });
  bullets(s, donts, { x: 7.11, y: 2.3, w: 5.3, h: 4.0, fontSize: 12.5, color: '6B2E1C', lineSpacing: 15, paraSpaceAfter: 9 });
  txt(s, 'Print this slide. It is the whole framework in fourteen lines.', { x: M, y: 6.56, w: CW, h: 0.36, fontSize: 12.5, italic: true, bold: true, color: P.muted, align: 'center' });
  s.addNotes('Hand this out. If people only act on this slide, we have recovered most of the value.');
}

/* ======================= 33. CLOSE ======================= */
function sClose() {
  const s = slide('CLOSING');
  s.addText('CLOSING', PH.closeKick);
  s.addText('What we need from you', PH.closeTitle);
  s.addShape(SH.ellipse, { x: 10.4, y: 5.2, w: 4.0, h: 4.0, fill: { color: P.deep }, line: { type: 'none' } });
  const asks = [
    ['1', 'Adopt the Context Pack from Monday', 'Every prompt for a deliverable starts from /ai-context and a stage template.'],
    ['2', 'No stage output moves without a signed gate', 'Four levels of verification, a named reviewer who is not the prompt operator.'],
    ['3', 'Treat a context gap as a defect', 'Raise a pull request against the pack so the fix reaches everyone at once.']
  ];
  let y = 1.75;
  asks.forEach(([n, t, d]) => {
    s.addShape(SH.roundRect, { x: M, y, w: 7.4, h: 1.08, rectRadius: 0.09, fill: { color: '17404C' }, line: { type: 'none' } });
    s.addShape(SH.ellipse, { x: M + 0.24, y: y + 0.28, w: 0.52, h: 0.52, fill: { color: P.amberBright }, line: { type: 'none' } });
    txt(s, n, { x: M + 0.24, y: y + 0.28, w: 0.52, h: 0.52, fontSize: 15, bold: true, color: P.ink, align: 'center', valign: 'middle' });
    txt(s, t, { x: M + 0.94, y: y + 0.16, w: 6.2, h: 0.4, fontSize: 14.5, bold: true, color: 'FFFFFF', valign: 'middle' });
    txt(s, d, { x: M + 0.94, y: y + 0.56, w: 6.2, h: 0.4, fontSize: 11.5, color: 'A9C4CB' });
    y += 1.2;
  });
  s.addShape(SH.roundRect, { x: 8.3, y: 1.75, w: 4.4, h: 3.48, rectRadius: 0.1, fill: { color: 'FFFFFF' }, line: { type: 'none' } });
  iconCircle(s, 8.56, 1.97, 0.46, P.rust, 'scale');
  txt(s, 'DECISIONS NEEDED TODAY', { x: 9.16, y: 1.97, w: 3.3, h: 0.46, fontSize: 11.5, bold: true, color: P.rust, charSpacing: 0.8, valign: 'middle' });
  bullets(s, ['The AI boundary for bug fixing: confirm the P1 and P2 rule.',
    'Initial gate thresholds for coverage and duplication.',
    'The four names on the AI Governance Council.',
    'The three pilot features, one per surface.'],
    { x: 8.58, y: 2.6, w: 3.9, h: 2.5, fontSize: 12, color: P.ink, lineSpacing: 15, paraSpaceAfter: 8 });
  s.addShape(SH.roundRect, { x: M, y: 5.5, w: 12.1, h: 1.0, rectRadius: 0.1, fill: { color: P.amberBright }, line: { type: 'none' } });
  txt(s, 'We are not slowing AI down. We are making its output something we can sign our names to — so that the enhancement we are asked for in year three is routine work, not a critical project.',
    { x: M + 0.4, y: 5.5, w: 11.3, h: 1.0, fontSize: 14, bold: true, color: '3A2A08', valign: 'middle', lineSpacing: 18 });
  txt(s, 'Next: Context Pack v1.0 review session — one week from today.', { x: M, y: 6.7, w: 8.0, h: 0.4, fontSize: 12, color: '7FA0AA' });
  s.addNotes('Close on the year-three line. Then take the four decisions one at a time; do not let the meeting end without them.');
}

/* ======================= BUILD ======================= */
(async () => {
  await renderIcons(ICON_SPEC);
  sCover(); sAgenda();
  divider('01', 'Where we stand', 'The process that kept us consistent, and the checkpoints AI outran', 'Where we stand');
  sThenNow(); sGaps();
  divider('02', 'Pros, cons and the control for each', 'An honest view of AI, and the named control that removes every risk', 'AI pros cons controls');
  sPros(); sCons(); sControls(); sPrinciples();
  divider('03', 'The framework', 'Nine stages, one repeatable pattern, no output without a gate', 'The framework');
  sFramework(); sAnatomy();
  divider('04', 'The common context layer', 'How every developer gets consistent output from AI, without being told twice', 'Common context layer');
  sWhyContext(); sContextPack(); sSurfaces(); sPrompt();
  divider('05', 'Stage by stage', 'Inputs to AI, what AI produces, the manual review, the exit gate and the roles', 'Stage by stage');
  sStages(); sDefects();
  divider('06', 'Verification and governance', 'Traceability, standardised verification, automated gates and who owns what', 'Verification and governance');
  sTrace(); sLadder(); sGates(); sRaci(); sGovernance(); sMetrics();
  divider('07', 'Rollout and decisions', 'Ninety days, three pilots, four decisions we need from you today', 'Rollout and decisions');
  sRollout(); sDos(); sClose();
  const out = 'AI-SDLC-Framework-Session.pptx';
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log('written: ' + out);
})();
