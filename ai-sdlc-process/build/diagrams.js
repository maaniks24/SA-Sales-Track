/* Builds every process diagram as SVG and rasterises to PNG (2x). Output: ../diagrams/*.png */
const fs = require('fs'); const path = require('path'); const sharp = require('sharp');
const L = require('./svglib'); const { C } = L;
const OUT = path.join(__dirname, '..', 'diagrams');
const D = {};

/* ---------- D1 master flow (portrait 1300) ---------- */
D['D1-master-flow'] = () => {
  const W = 1300, H = 1090; let s = '';
  s += L.rect(150, 18, 1100, 56, { fill: C.ink, r: 10 }) + L.stack(150, 18, 1100, 56, [{ t: 'COMMON CONTEXT PACK (/ai-context, version-stamped) — loaded into every AI step', size: 22, bold: true, color: '#FFFFFF' }], { pad: 6 });
  const c = [150, 530, 910], bw = 340, bh = 160;
  const box = (x, y, w, id, gate, title, out, pills) => {
    let t = L.rect(x, y, w, bh, { fill: '#FFFFFF', stroke: C.line, sw: 2.5, r: 14 });
    t += L.chip(x + 16, y + 16, id) + L.gate(x + w - 32, y + 33, gate);
    t += L.stack(x + 84, y + 12, w - 150, 44, [{ t: title, size: 27, bold: true, color: C.ink }], { pad: 0, align: 'start' });
    t += L.stack(x + 16, y + 58, w - 32, 56, [{ t: out, size: 21, color: C.muted }], { pad: 0, align: 'start' });
    t += L.pillRow(x + 16, y + bh - 44, pills);
    return t;
  };
  const r1 = 110, r2 = 330, r2b = 545, r3 = 790;
  s += box(c[0], r1, bw, 'S0', 'G0', 'Intake', 'Classified item and process path (T01 / T05)', ['M', 'AI-A']);
  s += box(c[1], r1, bw, 'S1', 'G1', 'Requirements', 'Requirement Register with REQ-IDs (T01)', ['AI-G', 'M']);
  s += box(c[2], r1, bw, 'S2', 'G2', 'SFVD', 'Screens, fields, validations baselined (T02)', ['AI-G', 'M']);
  s += box(c[0], r2, bw, 'S3', 'G3', 'Design', 'Design note and API contract (T03)', ['AI-G', 'AUTO', 'M']);
  s += box(c[1], r2, bw, 'S4', 'G4', 'Development', 'Code, unit tests, pull request (T09)', ['AI-G', 'AUTO', 'M']);
  s += box(c[2], r2, bw, 'S5', 'G5', 'Code review', 'Independently approved and merged', ['AI-A', 'AUTO', 'M']);
  s += box(c[0], r2b, 720, 'S6', 'G6', 'Test design (in parallel)', 'Test cases and test data from the baselined SFVD and contract (T07, T08)', ['AI-G', 'M']);
  s += box(c[0], r3, bw, 'S7', 'G7', 'Test execution', 'Executed suite, automation, parity report', ['AI-G', 'AUTO', 'M']);
  s += box(c[1], r3, bw, 'S8', 'G8', 'Release', 'Signed release package and notes (T12)', ['AI-G', 'AUTO', 'M']);
  s += box(c[2], r3, bw, 'S9', 'G9', 'Deploy + close', 'Smoke passed, RTM frozen (T13)', ['AI-A', 'M']);
  const ph = [['DEFINE', r1], ['BUILD', r2], ['DESIGN', r2b, 'TESTS'], ['PROVE', r3, '+ SHIP']];
  ph.forEach(([a, y, b]) => { s += L.label(92, y + 62, a, { size: 21, bold: true, color: C.slate }); if (b) s += L.label(92, y + 88, b, { size: 21, bold: true, color: C.slate }); });
  const my = (y) => y + bh / 2;
  s += L.path([[490, my(r1)], [528, my(r1)]]) + L.path([[870, my(r1)], [908, my(r1)]]);
  s += L.path([[1080, r1 + bh], [1080, 300], [320, 300], [320, r2 - 2]]);
  s += L.path([[1250, my(r1)], [1278, my(r1)], [1278, my(r2b)], [872, my(r2b)]]);
  s += L.path([[490, my(r2)], [528, my(r2)]]) + L.path([[870, my(r2)], [908, my(r2)]]);
  s += L.path([[1080, r2 + bh], [1080, 748], [320, 748], [320, r3 - 2]]);
  s += L.path([[510, r2b + bh], [510, 748]], { head: false });
  s += L.path([[490, my(r3)], [528, my(r3)]]) + L.path([[870, my(r3)], [908, my(r3)]]);
  s += L.path([[1080, r3 + bh], [1080, 992], [28, 992], [28, r1 + 132], [148, r1 + 132]], { color: 'rust', dash: '10 8' });
  s += L.label(560, 982, 'Feedback, defects and new change requests re-enter at Intake', { size: 20, italic: true, color: C.rust });
  s += L.rect(150, 1016, 1100, 56, { fill: C.surface, stroke: C.line, r: 10 }) + L.stack(150, 1016, 1100, 56, [{ t: 'TRACEABILITY MATRIX (X01) — the REQ-ID links every artifact from S1 to S9', size: 22, bold: true, color: C.slate }], { pad: 6 });
  return L.svgDoc(W, H, s);
};

/* ---------- D2 stage anatomy (portrait 1300) ---------- */
D['D2-stage-anatomy'] = () => {
  const W = 1300, H = 640; let s = '';
  const bw = 222, gap = 38, y = 70, bh = 290; const xs = [0, 1, 2, 3, 4].map(i => 18 + i * (bw + gap));
  const defs = [
    [C.slate, 'Approved input', 'Signed artifact from the previous stage, with its ID and version', ['M']],
    [C.plum, 'Context + prompt', 'Context Pack version and the standard stage prompt (CP-50)', ['M']],
    [C.teal, 'AI draft', 'Output in the standard template, plus declared assumptions (T11)', ['AI-G']],
    [C.rust, 'Validate', '', []],
    [C.amber, 'Gate sign-off', 'L4 recorded in T10. Baselined. Becomes the next stage input.', ['M']]
  ];
  defs.forEach(([col, t, d, p], i) => {
    s += L.rect(xs[i], y, bw, bh, { stroke: col, sw: 3.5, r: 16 });
    s += L.stack(xs[i], y + 14, bw, 50, [{ t, size: 26, bold: true, color: col }], { pad: 8 });
    if (i !== 3) { s += L.stack(xs[i], y + 70, bw, 150, [{ t: d, size: 21, color: C.text }], { pad: 16, valign: 'top' }); s += L.pillRow(xs[i] + bw / 2, y + bh - 46, p, { align: 'center' }); }
    if (i < 4) s += L.path([[xs[i] + bw + 4, y + bh / 2], [xs[i + 1] - 4, y + bh / 2]]);
  });
  const vx = xs[3]; [['L1 Automated checks', 'AUTO'], ['L2 Role checklist', 'M'], ['L3 Independent review', 'M']].forEach(([t, m], j) => {
    const yy = y + 72 + j * 68;
    s += L.rect(vx + 12, yy, bw - 24, 58, { fill: L.MODE[m].t, r: 10 });
    s += L.stack(vx + 12, yy, bw - 24, 58, [{ t, size: 20, bold: true, color: C.ink }], { pad: 6 });
  });
  s += L.gate(xs[4] + bw - 8, y - 4, 'Gn');
  s += L.label(xs[0] + bw / 2, 48, 'From stage N-1', { size: 21, bold: true });
  s += L.label(xs[4] + bw / 2, 48, 'To stage N+1', { size: 21, bold: true, color: C.amber });
  const rx = vx + bw / 2;
  s += L.path([[rx, y + bh + 4], [rx, 440], [xs[2] + bw / 2, 440], [xs[2] + bw / 2, y + bh + 6]], { color: 'rust' });
  s += L.label((rx + xs[2] + bw / 2) / 2, 476, 'Rejected: reason recorded, regenerate', { size: 21, color: C.rust, bold: true });
  s += L.path([[vx + bw - 30, y + bh + 4], [vx + bw - 30, 520], [xs[1] + bw / 2, 520], [xs[1] + bw / 2, y + bh + 6]], { color: 'plum', dash: '10 8' });
  s += L.label((vx + bw - 30 + xs[1] + bw / 2) / 2, 560, 'Context gap? Raise T14 so the fix reaches every developer', { size: 21, color: C.plum, bold: true });
  s += L.label(650, 620, 'The reviewer at L3 is never the person who ran the AI prompt.', { size: 21, italic: true, color: C.muted });
  return L.svgDoc(W, H, s);
};

/* ---------- D3 work-type routing (portrait 1300) ---------- */
D['D3-work-type-routing'] = () => {
  const W = 1300, H = 1060; let s = '';
  s += L.rect(390, 16, 520, 76, { fill: C.surface, stroke: C.line }) + L.stack(390, 16, 520, 76, [{ t: 'New work item raised in Jira', size: 25, bold: true, color: C.ink }]);
  s += L.path([[650, 94], [650, 134]]);
  s += L.rect(300, 138, 700, 118, { stroke: C.rust, sw: 3 }) + L.stack(300, 138, 640, 80, [{ t: 'S0 Intake and triage', size: 26, bold: true, color: C.ink }, { t: 'Summarise, search duplicates, classify, assign owner', size: 21, color: C.muted, gap: 2 }]);
  s += L.pillRow(650, 216, ['M', 'AI-A'], { align: 'center' }) + L.gate(970, 168, 'G0');
  s += L.path([[650, 258], [650, 288]]);
  s += L.diamond(650, 365, 440, 150, 'What kind of work is it?');
  s += L.path([[650, 440], [650, 486]], { head: false });
  const cx = [160, 485, 810, 1135];
  s += L.path([[cx[0], 486], [975, 486]], { head: false });
  s += L.path([[cx[0], 486], [cx[0], 752]]) + L.path([[cx[1], 486], [cx[1], 752]]) + L.path([[975, 486], [975, 520]]);
  s += L.diamond(975, 590, 320, 130, 'Code change needed?', { size: 21 });
  s += L.path([[975, 655], [975, 690]], { head: false }) + L.path([[cx[2], 690], [cx[3], 690]], { head: false });
  s += L.path([[cx[2], 690], [cx[2], 752]]) + L.path([[cx[3], 690], [cx[3], 752]]);
  s += L.label(cx[2] - 26, 728, 'Yes', { size: 21, bold: true, color: C.ink }) + L.label(cx[3] + 26, 728, 'No', { size: 21, bold: true, color: C.ink });
  s += L.label(cx[0], 470, 'Does not exist yet', { size: 20, italic: true }) + L.label(cx[1], 470, 'Existing behaviour changes', { size: 20, italic: true });
  s += L.label(975, 470, 'Broken, or operational request', { size: 20, italic: true });
  const term = [
    [C.teal, 'New feature (NF)', 'Capability does not exist yet', 'Full flow S1 to S9', 'Section 5.1'],
    [C.plum, 'Change request (CR)', 'Baselined behaviour must change', 'Impact analysis T04, then delta S1 to S9', 'Section 5.2'],
    [C.rust, 'Issue fix (defect)', 'Behaviour differs from the baseline', 'T05, then manual RCA T06, then S4 to S9 by severity', 'Section 5.3'],
    [C.slate, 'Service request', 'Data, configuration or access change', 'T05, scripted reviewed change, verify', 'Section 5.3']
  ];
  term.forEach(([col, t, w, p, ref], i) => {
    const x = cx[i] - 152;
    s += L.rect(x, 756, 304, 200, { stroke: col, sw: 3.5, r: 14 });
    s += L.stack(x, 762, 304, 190, [{ t, size: 24, bold: true, color: col }, { t: 'When: ' + w, size: 20, color: C.text, gap: 8 }, { t: 'Path: ' + p, size: 20, color: C.text, gap: 6 }, { t: ref, size: 19, italic: true, color: C.muted, gap: 6 }], { pad: 12 });
  });
  s += L.rect(150, 980, 1000, 62, { fill: '#FDF6E6', stroke: C.amber, r: 10 }) + L.stack(150, 980, 1000, 62, [{ t: 'Unsure? The Architect decides within one working day. Default to the stricter path.', size: 22, bold: true, color: C.ink }], { pad: 6 });
  return L.svgDoc(W, H, s);
};

/* ---------- swimlane renderer for D4 / D5 (landscape 1800) ---------- */
function swimlane(lanes, cols, boxes, edges, note) {
  const W = 1800, LW = 210, HH = 58, LH = 146, CWID = (W - LW) / cols.length;
  const H = HH + lanes.length * LH + (note ? 108 : 70); let s = '';
  cols.forEach((c, i) => {
    s += L.rect(LW + i * CWID + 3, 4, CWID - 6, HH - 10, { fill: i % 2 ? C.surface : '#E4ECEF', r: 8 });
    s += L.stack(LW + i * CWID, 4, CWID, HH - 10, [{ t: c, size: 20, bold: true, color: C.slate }], { pad: 2 });
  });
  lanes.forEach((ln, i) => {
    const y = HH + i * LH;
    s += `<rect x="0" y="${y}" width="${W}" height="${LH}" fill="${i % 2 ? '#F7FAFB' : '#FFFFFF'}" stroke="${C.line}" stroke-width="1.5"/>`;
    s += L.rect(4, y + 6, LW - 14, LH - 12, { fill: C.ink, r: 10 }) + L.stack(4, y + 6, LW - 14, LH - 12, [{ t: ln, size: 21, bold: true, color: '#FFFFFF' }], { pad: 10 });
  });
  const geo = {};
  boxes.forEach(b => {
    const span = b.span || 1, x = LW + b.col * CWID + 9, w = span * CWID - 18, y = HH + b.lane * LH + 12, h = LH - 24;
    geo[b.id] = { x, y, w, h };
    const m = L.MODE[b.mode[0]];
    s += L.rect(x, y, w, h, { fill: m.t, stroke: m.c, sw: 2.5, r: 12, dash: b.dashed ? '9 6' : null });
    s += L.stack(x, y + 2, w, h - 38, [{ t: b.t, size: 20, bold: true, color: C.ink }], { pad: 8 });
    s += L.pillRow(x + 8, y + h - 36, b.mode, { size: 18 });
    if (b.gate) s += L.gate(x + w - 4, y + 4, b.gate, 19);
  });
  edges.forEach(([a, b, o = {}]) => {
    const A = geo[a], B = geo[b];
    const ay = A.y + A.h / 2, by = B.y + B.h / 2;
    if (o.v) {
      const x = o.vx ?? (A.x + A.w / 2);
      s += by > ay ? L.path([[x, A.y + A.h], [x, B.y - 3]]) : L.path([[x, A.y], [x, B.y + B.h + 3]]);
    } else if (Math.abs(ay - by) < 2) s += L.path([[A.x + A.w, ay], [B.x - 3, by]]);
    else { const mx = o.mx ?? (A.x + A.w + B.x) / 2; s += L.path([[A.x + A.w, ay], [mx, ay], [mx, by], [B.x - 3, by]]); }
  });
  const ly = HH + lanes.length * LH + 18; let lx = 10;
  [['M', 'Manual'], ['AI-G', 'AI-generated, then validated'], ['AI-A', 'AI-assisted'], ['AUTO', 'Automated tooling'], ['AI-X', 'AI not permitted']].forEach(([c, t]) => {
    s += L.pill(lx, ly, c, 18); lx += L.pillW(c, 18) + 8; s += L.label(lx, ly + 22, t, { size: 19, anchor: 'start', color: C.text }); lx += t.length * 9.5 + 26;
  });
  s += L.gate(lx + 18, ly + 14, 'Gn', 17); s += L.label(lx + 44, ly + 22, 'Gate with recorded sign-off (T10)', { size: 19, anchor: 'start', color: C.text });
  if (note) s += L.label(10, ly + 62, note, { size: 19, anchor: 'start', italic: true });
  return L.svgDoc(W, H, s);
}
const LANES = ['Business / Product Owner', 'BA / Tech Writer', 'Architect / Tech Lead', 'Developer', 'QA / Automation', 'Release / DevOps'];
const COLS = ['S0 Intake', 'S1 Require.', 'S2 SFVD', 'S3 Design', 'S4 Develop', 'S5 Review', 'S7 Test run', 'S8 Release', 'S9 Deploy'];
D['D4-flow-new-feature'] = () => swimlane(LANES, COLS, [
  { id: 'a', col: 0, lane: 0, t: 'Raise need and review points', mode: ['M'] },
  { id: 'b', col: 0, lane: 1, t: 'Intake and classify as NF', mode: ['M', 'AI-A'], gate: 'G0' },
  { id: 'c', col: 1, lane: 1, t: 'Draft register, reconcile', mode: ['AI-G', 'M'] },
  { id: 'd', col: 1, lane: 0, t: 'Answer questions, approve', mode: ['M'], gate: 'G1' },
  { id: 'e', col: 2, lane: 1, t: 'Draft SFVD, then verify', mode: ['AI-G', 'M'], gate: 'G2' },
  { id: 'f', col: 3, lane: 2, t: 'Draft design + contract, review', mode: ['AI-G', 'M'], gate: 'G3' },
  { id: 'g', col: 3, lane: 4, span: 2, t: 'S6 Test design (parallel): draft cases and data, then review', mode: ['AI-G', 'M'], gate: 'G6' },
  { id: 'h', col: 4, lane: 3, t: 'Generate code and tests, self-review', mode: ['AI-G', 'AUTO'], gate: 'G4' },
  { id: 'i', col: 5, lane: 2, t: 'Independent code review', mode: ['M', 'AI-A'], gate: 'G5' },
  { id: 'j', col: 6, lane: 4, t: 'Automate, execute, parity check', mode: ['AI-G', 'AUTO'], gate: 'G7' },
  { id: 'k', col: 7, lane: 5, t: 'Package and release notes', mode: ['AI-G', 'M'], gate: 'G8' },
  { id: 'l', col: 8, lane: 5, t: 'Deploy and smoke test', mode: ['M', 'AUTO'] },
  { id: 'm', col: 8, lane: 0, t: 'Business sign-off, RTM frozen', mode: ['M'], gate: 'G9' }
], [['a', 'b', { v: 1 }], ['b', 'c'], ['c', 'd', { v: 1 }], ['d', 'e'], ['e', 'f'], ['e', 'g'], ['f', 'h'], ['h', 'i'], ['i', 'j'], ['g', 'j'], ['j', 'k'], ['k', 'l'], ['l', 'm', { v: 1 }]],
  'Rejection at any gate returns to the same activity (Figure 2)');
D['D5-flow-change-request'] = () => swimlane(LANES, COLS, [
  { id: 'a', col: 0, lane: 0, t: 'Raise change request', mode: ['M'] },
  { id: 'b', col: 0, lane: 1, t: 'Intake: classify CR, link baseline', mode: ['M', 'AI-A'], gate: 'G0' },
  { id: 'c', col: 1, lane: 2, t: 'Impact analysis (T04)', mode: ['M', 'AI-A'] },
  { id: 'd', col: 1, lane: 0, t: 'Approve scope and impact', mode: ['M'], gate: 'G1' },
  { id: 'e', col: 2, lane: 1, t: 'Delta SFVD, change-marked', mode: ['AI-G', 'M'], gate: 'G2' },
  { id: 'f', col: 3, lane: 2, t: 'Design delta, if contract changes', mode: ['AI-G', 'M'], gate: 'G3', dashed: true },
  { id: 'g', col: 3, lane: 4, span: 2, t: 'S6: new cases + impacted regression selection', mode: ['AI-G', 'AI-A', 'M'], gate: 'G6' },
  { id: 'h', col: 4, lane: 3, t: 'Code change and unit tests', mode: ['AI-G', 'AUTO'], gate: 'G4' },
  { id: 'i', col: 5, lane: 2, t: 'Review + backward compatibility', mode: ['M', 'AI-A'], gate: 'G5' },
  { id: 'j', col: 6, lane: 4, t: 'Impacted regression, parity', mode: ['AI-G', 'AUTO'], gate: 'G7' },
  { id: 'k', col: 7, lane: 5, t: 'Version bump, release notes', mode: ['AI-G', 'M'], gate: 'G8' },
  { id: 'l', col: 8, lane: 5, t: 'Deploy and smoke test', mode: ['M', 'AUTO'] },
  { id: 'm', col: 8, lane: 0, t: 'Business acceptance', mode: ['M'], gate: 'G9' }
], [['a', 'b', { v: 1 }], ['b', 'c'], ['c', 'd', { v: 1 }], ['d', 'e'], ['e', 'f'], ['e', 'g'], ['f', 'h'], ['h', 'i'], ['i', 'j'], ['g', 'j'], ['j', 'k'], ['k', 'l'], ['l', 'm', { v: 1 }]],
  'Dashed border: conditional on the impact analysis');

/* ---------- D6 issue / SR flow (portrait 1300, full page) ---------- */
D['D6-flow-issue-sr'] = () => {
  const W = 1300, H = 1760; let s = '';
  const B = (x, y, w, h, t, sub, modes, col, g) => {
    let r = L.rect(x, y, w, h, { fill: L.MODE[modes[0]].t, stroke: col || L.MODE[modes[0]].c, sw: 3, r: 12 });
    r += L.stack(x, y + 2, w, h - 42, [{ t, size: 22, bold: true, color: C.ink }].concat(sub ? [{ t: sub, size: 19, color: C.muted, gap: 2 }] : []), { pad: 10 });
    r += L.pillRow(x + w / 2, y + h - 38, modes, { align: 'center', size: 18 });
    if (g) r += L.gate(x + w - 6, y + 6, g, 19);
    return r;
  };
  s += B(380, 16, 540, 104, 'Issue or service request reported', 'Jira ticket from business, support or monitoring', ['M']);
  s += L.path([[650, 122], [650, 150]]);
  s += B(300, 154, 700, 116, 'Triage (T05): reproduce, classify, provisional severity', 'AI may summarise logs; a person classifies', ['M', 'AI-A'], null, 'G0');
  s += L.path([[650, 272], [650, 302]]);
  s += L.diamond(650, 378, 420, 148, 'Code change needed?');
  const lx = 40, lw = 380, lc = lx + lw / 2;
  s += L.path([[440, 378], [lc, 378], [lc, 498]]); s += L.label(400, 362, 'No', { size: 22, bold: true, color: C.ink });
  s += L.path([[860, 378], [930, 378], [930, 498]]); s += L.label(892, 362, 'Yes', { size: 22, bold: true, color: C.ink });
  s += L.label(lc + 14, 476, 'SERVICE REQUEST', { size: 21, bold: true, color: C.slate, anchor: 'start' }) + L.label(944, 476, 'DEFECT FIX', { size: 21, bold: true, color: C.rust, anchor: 'start' });
  const ly = [502, 642, 782, 922, 1062];
  [['Classify SR type', 'Data, config, access, report, upload', ['M']],
   ['Prepare scripted change', 'Reversible. AI-X if it changes values', ['M', 'AI-G']],
   ['Peer review + dry run in test', 'Before / after evidence captured', ['M'], 'G5'],
   ['Execute under change record', 'By an authorised admin', ['M']],
   ['Verify with the requester', 'Evidence attached to T05', ['M'], 'G7']].forEach(([t, sub, m, g], i) => {
    s += B(lx, ly[i], lw, 112, t, sub, m, null, g);
    if (i < 4) s += L.path([[lc, ly[i] + 114], [lc, ly[i + 1] - 3]]);
  });
  const rx = 560, rw = 740, rc = rx + rw / 2 - 2;
  [['Reproduce and write the failing test', 'Test committed before any fix', ['M']],
   ['Root cause analysis (T06), manual only', 'What broke, why not caught, which gate missed it', ['AI-X']],
   ['Approve RCA and confirm severity', 'Tech Lead; Architect for P1 / P2', ['M'], 'G1']].forEach(([t, sub, m, g], i) => {
    s += B(rx, ly[i], rw - 20, 112, t, sub, m, null, g);
    if (i < 2) s += L.path([[930, ly[i] + 114], [930, ly[i + 1] - 3]]);
  });
  s += L.path([[930, ly[2] + 114], [930, 922]]);
  s += L.diamond(930, 986, 300, 124, 'Severity?', { size: 22 });
  const p1 = 560, p3 = 940, pw = 340;
  s += L.path([[780, 986], [p1 + pw / 2, 986], [p1 + pw / 2, 1078]]) + L.path([[1080, 986], [p3 + pw / 2, 986], [p3 + pw / 2, 1078]]);
  s += L.label(p1 + pw / 2 + 8, 1040, 'P1 / P2', { size: 21, bold: true, color: C.red, anchor: 'start' }) + L.label(p3 + pw / 2 + 8, 1040, 'P3 / P4', { size: 21, bold: true, color: C.teal, anchor: 'start' });
  const sy = [1082, 1214, 1346];
  [[['Hotfix: manual fix only', 'AI not permitted', ['AI-X']], ['Planned fix', 'AI-G allowed after RCA approval', ['AI-G', 'M']]],
   [['Two engineers + Architect review', '', ['M'], 'G5'], ['Independent review', '', ['M', 'AI-A'], 'G5']],
   [['Targeted + regression, hotfix release', '', ['AUTO', 'M'], 'G8'], ['Regression pack, scheduled release', '', ['AUTO', 'M'], 'G8']]].forEach((pair, i) => {
    [[p1, pair[0]], [p3, pair[1]]].forEach(([x, [t, sub, m, g]]) => {
      s += B(x, sy[i], pw, 112, t, sub, m, null, g);
      if (i < 2) s += L.path([[x + pw / 2, sy[i] + 114], [x + pw / 2, sy[i + 1] - 3]]);
    });
  });
  s += L.path([[lc, 1176], [lc, 1500], [298, 1500]]);
  s += L.path([[p1 + pw / 2, 1460], [p1 + pw / 2, 1475]]) + L.path([[p3 + pw / 2, 1460], [p3 + pw / 2, 1530], [1002, 1530]]);
  s += B(300, 1478, 700, 112, 'Deploy, smoke, extended monitoring (T13)', 'Hotfix: emergency change approval', ['M', 'AUTO'], null, 'G9');
  s += L.path([[650, 1592], [650, 1622]]);
  s += B(250, 1626, 800, 112, 'Close: RTM and SFVD updated, gate improved, context gap raised on T14', '', ['M']);
  return L.svgDoc(W, H, s);
};

/* ---------- D7 validation funnel (portrait 1300) ---------- */
D['D7-validation-levels'] = () => {
  const W = 1300, H = 720; let s = '';
  const lv = [
    ['L1', 'Automated checks', 'Lint, PMD, Checkstyle, Sonar, OpenAPI diff, SQL lint, secret scan, ID link check, parity check', 'Jenkins', 'AUTO', C.slate],
    ['L2', 'Role checklist', 'The stage checklist in T10, each item ticked by the named role with evidence', 'Stage owner', 'M', C.teal],
    ['L3', 'Independent review', 'A second person, never the AI operator, compares output with the approved input using V1 to V10', 'Reviewer', 'M', C.rust],
    ['L4', 'Recorded sign-off', 'T10 gate record: artifact version, Context Pack version, reviewer, date, decision', 'Gate owner', 'M', C.amber]
  ];
  lv.forEach(([id, t, d, who, m, col], i) => {
    const inset = i * 50, x = 20 + inset, w = 1260 - inset * 2, y = 20 + i * 150;
    s += L.rect(x, y, w, 128, { stroke: col, sw: 3.5, r: 16 });
    s += L.rect(x + 18, y + 26, 76, 76, { fill: col, r: 12 }) + L.stack(x + 18, y + 26, 76, 76, [{ t: id, size: 30, bold: true, color: '#FFFFFF' }], { pad: 0 });
    s += L.stack(x + 112, y + 8, 360, 50, [{ t, size: 27, bold: true, color: col }], { pad: 0, align: 'start' });
    s += L.stack(x + 112, y + 52, w - 300, 70, [{ t: d, size: 21, color: C.text }], { pad: 0, align: 'start', valign: 'top' });
    s += L.label(x + w - 24, y + 42, 'By: ' + who, { size: 21, bold: true, anchor: 'end', color: C.ink });
    s += L.pill(x + w - 24 - L.pillW(m), y + 66, m);
    if (i < 3) s += L.path([[650, y + 130], [650, y + 148]], { color: 'muted' });
  });
  s += L.rect(220, 630, 860, 72, { fill: C.ink, r: 12 }) + L.stack(220, 630, 860, 72, [{ t: 'The gate opens only when all four levels are complete and recorded', size: 24, bold: true, color: '#FFFFFF' }], { pad: 6 });
  s += L.path([[650, 600], [650, 626]], { color: 'muted' });
  return L.svgDoc(W, H, s);
};

/* ---------- D8 traceability chain (portrait 1300) ---------- */
D['D8-traceability-chain'] = () => {
  const W = 1300, H = 470; let s = '';
  const n = [['Requirement', 'DEP-REQ-214', 'Jira field + T01', C.slate], ['SFVD', 'SFVD-DEP-07 v2.1', 'Screen header', C.slate], ['API contract', 'x-req-ids tag', 'OpenAPI spec', C.plum],
  ['Commit + PR', '[DEP-REQ-214]', 'Branch + message', C.teal], ['Test case', 'TC-DEP-214-03', 'Test tool field', C.amber], ['Defect', 'BUG-DEP-118', 'Jira link', C.rust], ['Release', 'REL 4.7.0', 'Release note line', C.green]];
  const w = 156, gap = 26;
  n.forEach(([t, id, where, col], i) => {
    const x = 14 + i * (w + gap);
    s += L.rect(x, 30, w, 150, { fill: col, r: 14 });
    s += L.stack(x, 34, w, 76, [{ t, size: 23, bold: true, color: '#FFFFFF' }], { pad: 6 });
    s += L.stack(x, 108, w, 60, [{ t: id, size: 18, color: '#E8F1F3' }], { pad: 6 });
    s += L.stack(x, 194, w, 70, [{ t: where, size: 19, color: C.muted, italic: true }], { pad: 4, valign: 'top' });
    if (i < n.length - 1) s += L.path([[x + w + 3, 105], [x + w + gap - 3, 105]], { color: 'muted' });
  });
  s += L.label(650, 300, 'Italic labels show where each ID is recorded', { size: 20, bold: true, color: C.muted });
  s += L.rect(40, 330, 1220, 120, { fill: C.surface, stroke: C.line, r: 14 });
  s += L.stack(40, 330, 1220, 120, [{ t: 'Nightly link-check job (X01 RTM)', size: 24, bold: true, color: C.slate }, { t: 'Fails the release build if any requirement has no passed test, or any commit has no valid ID', size: 21, color: C.text, gap: 6 }]);
  return L.svgDoc(W, H, s);
};

/* ---------- D9 context layers (portrait 1300) ---------- */
D['D9-context-layers'] = () => {
  const W = 1300, H = 640; let s = '';
  const L4 = [
    ['Task prompt', 'CP-50 stage prompt + approved input', C.amber, 'Personal to the task; everything below is shared'],
    ['Surface profile', 'CP-99 golden example for service, mobile or internal web', C.plum, 'Where the three surfaces are allowed to differ'],
    ['Product context', 'CP-00, CP-20, CP-21, CP-23, CP-30, CP-31', C.slate, 'Domain, shared code, styles, registry, tests, data'],
    ['Organisation standards', 'CP-10, CP-11, CP-12, CP-22, CP-40', C.deep, 'Coding, naming, structure, APIs, security']
  ];
  const cx = 380;
  L4.forEach(([t, files, col, why], i) => {
    const top = 240 + i * 110, bot = top + 130, y = 30 + i * 150, h = 136;
    const pts = `${cx - top / 2},${y} ${cx + top / 2},${y} ${cx + bot / 2},${y + h} ${cx - bot / 2},${y + h}`;
    s += `<polygon points="${pts}" fill="${col}" stroke="#FFFFFF" stroke-width="4"/>`;
    s += L.stack(cx - top / 2, y, top, h, [{ t, size: 25, bold: true, color: '#FFFFFF' }], { pad: 6 });
    s += L.path([[cx + bot / 2 + 12, y + h / 2], [764, y + h / 2]], { color: 'muted', head: false, sw: 2, dash: '4 6' });
    s += L.rect(770, y + 12, 512, h - 24, { fill: C.surface, r: 12 });
    s += L.stack(770, y + 12, 512, h - 24, [{ t: files, size: 21, bold: true, color: col }, { t: why, size: 20, color: C.text, gap: 4 }], { pad: 16, align: 'start' });
  });
  return L.svgDoc(W, H, s);
};

/* ---------- D10 document lifecycle map (landscape 1800) ---------- */
D['D10-document-map'] = () => {
  const P = require('./process_data');
  const rows = [
    ['T01', 'Requirement Intake and Register', { S0: 'P', S1: 'P', S2: 'U', S6: 'U' }],
    ['T02', 'SFVD', { S2: 'P', S3: 'U', S4: 'U', S5: 'U', S6: 'U' }],
    ['T03', 'Solution Design Note', { S3: 'P', S4: 'U', S5: 'U', S6: 'U' }],
    ['T04', 'CR Impact Analysis (CR only)', { S0: 'P', S1: 'P', S2: 'U', S6: 'U' }],
    ['T05', 'Issue / SR Triage Form (SR only)', { S0: 'P', S4: 'U', S9: 'P' }],
    ['T06', 'Root Cause Analysis (defects only)', { S1: 'P', S4: 'U', S6: 'U', S9: 'U' }],
    ['T07', 'Test Case Specification', { S6: 'P', S7: 'U' }],
    ['T08', 'Test Data and Seed Specification', { S6: 'P', S7: 'U' }],
    ['T09', 'PR and Code Review Checklist', { S4: 'P', S5: 'P' }],
    ['T10', 'Stage Gate Checklists and Sign-off', Object.fromEntries(P.STAGES.map(x => [x.id, 'S']))],
    ['T11', 'AI Usage Declaration and Assumptions', { S1: 'P', S2: 'P', S3: 'P', S4: 'P', S6: 'P', S7: 'P', S8: 'P' }],
    ['T12', 'Release Note', { S8: 'P', S9: 'U' }],
    ['T13', 'Deployment Runbook and Smoke', { S8: 'P', S9: 'P' }],
    ['T14', 'Context Pack Change Request', 'any:Any stage when a context gap is found; reviewed at every S9'],
    ['T15', 'Waiver and Deviation Request', 'any:Any stage when a rule cannot be met; approved by the Council'],
    ['X01', 'Tracker workbook (RTM and registers)', { S0: 'P', S1: 'P', S2: 'P', S6: 'P', S7: 'P', S8: 'P', S9: 'P' }]
  ];
  const W = 1800, LW = 470, HH = 64, RH = 54, CWID = (W - LW - 10) / 10, H = HH + rows.length * RH + 70; let s = '';
  P.STAGES.forEach((st, i) => {
    const x = LW + i * CWID;
    s += L.rect(x + 3, 4, CWID - 6, HH - 10, { fill: C.ink, r: 8 }) + L.stack(x, 4, CWID, HH - 10, [{ t: st.id + ' ' + st.short, size: 19, bold: true, color: '#FFFFFF' }], { pad: 4 });
  });
  rows.forEach(([id, name, marks], r) => {
    const y = HH + r * RH;
    s += `<rect x="0" y="${y}" width="${W}" height="${RH}" fill="${r % 2 ? '#F4F8F9' : '#FFFFFF'}"/>`;
    s += L.label(12, y + 35, id, { size: 21, bold: true, color: C.teal, anchor: 'start' }) + L.label(74, y + 35, name, { size: 21, color: C.text, anchor: 'start' });
    if (typeof marks === 'string') {
      s += L.rect(LW + 10, y + 10, CWID * 10 - 20, RH - 20, { fill: '#ECE5F1', r: 16 }) + L.stack(LW + 10, y + 10, CWID * 10 - 20, RH - 20, [{ t: marks.slice(4), size: 19, italic: true, color: C.plum }], { pad: 4 });
      return;
    }
    P.STAGES.forEach((st, i) => {
      const m = marks[st.id]; if (!m) return; const cx = LW + i * CWID + CWID / 2, cy = y + RH / 2;
      if (m === 'P') s += `<circle cx="${cx}" cy="${cy}" r="15" fill="${C.teal}"/>`;
      if (m === 'U') s += `<circle cx="${cx}" cy="${cy}" r="13" fill="#FFFFFF" stroke="${C.slate}" stroke-width="4"/>`;
      if (m === 'S') s += `<rect x="${cx - 14}" y="${cy - 14}" width="28" height="28" rx="5" fill="${C.amberBright}"/>`;
    });
  });
  const ly = HH + rows.length * RH + 24;
  s += `<circle cx="30" cy="${ly + 14}" r="14" fill="${C.teal}"/>` + L.label(54, ly + 21, 'Produced or updated in this stage', { size: 20, anchor: 'start', color: C.text });
  s += `<circle cx="420" cy="${ly + 14}" r="12" fill="#FFFFFF" stroke="${C.slate}" stroke-width="4"/>` + L.label(444, ly + 21, 'Used as an input', { size: 20, anchor: 'start', color: C.text });
  s += `<rect x="640" y="${ly}" width="28" height="28" rx="5" fill="${C.amberBright}"/>` + L.label(680, ly + 21, 'Gate sign-off recorded', { size: 20, anchor: 'start', color: C.text });
  return L.svgDoc(W, H, s);
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const only = process.argv[2];
  for (const [name, fn] of Object.entries(D)) {
    if (only && !name.startsWith(only)) continue;
    const svg = fn();
    fs.writeFileSync(path.join(OUT, name + '.svg'), svg);
    const info = await sharp(Buffer.from(svg), { density: 144 }).png().toFile(path.join(OUT, name + '.png'));
    console.log(name, info.width + 'x' + info.height);
  }
})();
