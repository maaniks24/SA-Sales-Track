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
  ban: ['FaBan', 'FFFFFF'], key: ['FaKey', 'FFFFFF'], jira: ['FaTasks', 'FFFFFF'], git: ['FaCodeBranch', 'FFFFFF'], jenkins: ['FaCogs', 'FFFFFF'], folder: ['FaFolderOpen', 'FFFFFF'], table: ['FaTable', 'FFFFFF'], play: ['FaPlay', 'FFFFFF'], user: ['FaUserTie', 'FFFFFF']
};

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';            // 13.3 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = 'Product Engineering';
pres.company = 'Fixed Assets Product Engineering';
pres.subject = 'AI SDLC Process and Implementation';
pres.title = 'AI SDLC Process: How We Will Work';
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
  { text: { text: 'AI SDLC Process  ·  Implementation Briefing  ·  Fixed Assets Suite', options: { x: M, y: 6.98, w: 8.0, h: 0.3, fontSize: 9, color: '8CA4AC', margin: 0 } } }
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


/* ======================= DIVIDERS ======================= */
function divider(num, title, sub, secName) {
  section(secName);
  const s = slide('SECTION');
  s.addText(num, PH.secNum);
  s.addText(title, PH.secTitle);
  s.addText(sub, PH.secSub);
  return s;
}

