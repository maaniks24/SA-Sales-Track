/* Exports the AI SDLC process (../ai-sdlc-process/build/process_data.js) into the backend as JSON,
   adds the gate rules the application enforces, and copies the blank templates.
   Run: node tools/export-process.js */
const fs = require('fs'); const path = require('path');
const SRC = path.join(__dirname, '..', '..', 'ai-sdlc-process');
const D = require(path.join(SRC, 'build', 'process_data.js'));
const { T } = require(path.join(SRC, 'build', 'templates_spec.js'));
const OUT = path.join(__dirname, '..', 'backend', 'src', 'main', 'resources');

const ROLE = {
  S0: ['BUSINESS_ANALYST', 'DELIVERY_MANAGER'], S1: ['BUSINESS_ANALYST', 'PRODUCT_OWNER'], S2: ['TECH_WRITER', 'BUSINESS_ANALYST'],
  S3: ['TECH_LEAD', 'ARCHITECT'], S4: ['DEVELOPER', 'TECH_LEAD'], S5: ['REVIEWER', 'TECH_LEAD'], S6: ['QA_ENGINEER', 'QA_LEAD'],
  S7: ['QA_ENGINEER', 'QA_LEAD'], S8: ['RELEASE_MANAGER', 'DELIVERY_MANAGER'], S9: ['DEVOPS', 'DELIVERY_MANAGER']
};
/* Gate rules: prerequisites, the board column a stage belongs to, documents that must exist and be baselined,
   CI checks (L1) that must pass, and Git evidence. Document rules are per work type: NF, CR, SR_DEFECT, SR_SERVICE. */
const RULES = {
  S0: { prereq: [], column: 'INTAKE', docs: { NF: ['T01'], CR: ['T04'], SR_DEFECT: ['T05'], SR_SERVICE: ['T05'] }, ci: [] },
  S1: { prereq: ['S0'], column: 'DEFINE', docs: { NF: ['T01'], CR: ['T04'], SR_DEFECT: ['T06'], SR_SERVICE: [] }, ci: [] },
  S2: { prereq: ['S1'], column: 'DEFINE', docs: { NF: ['T02'], CR: ['T02'], SR_DEFECT: ['T02'], SR_SERVICE: [] }, ci: [] },
  S3: { prereq: ['S2'], column: 'BUILD', docs: { NF: ['T03'], CR: ['T03'], SR_DEFECT: ['T03'], SR_SERVICE: [] }, ci: ['OPENAPI_DIFF'] },
  S4: { prereq: ['S3'], column: 'BUILD', docs: {}, ci: ['BUILD', 'PMD', 'SONAR', 'COVERAGE', 'DUPLICATION', 'SECRET_SCAN', 'ID_CHECK'], git: 'PR_OPEN' },
  S5: { prereq: ['S4'], column: 'BUILD', docs: {}, ci: ['SONAR', 'DUPLICATION', 'OPENAPI_DIFF'], git: 'PR_MERGED' },
  S6: { prereq: ['S2'], column: 'TEST', docs: { NF: ['T07', 'T08'], CR: ['T07', 'T08'], SR_DEFECT: ['T07'], SR_SERVICE: [] }, ci: [] },
  S7: { prereq: ['S5', 'S6'], column: 'TEST', docs: {}, ci: ['PARITY'] },
  S8: { prereq: ['S7'], column: 'RELEASE', docs: { NF: ['T12', 'T13'], CR: ['T12', 'T13'], SR_DEFECT: ['T12', 'T13'], SR_SERVICE: [] }, ci: ['RTM_LINK', 'PARITY'] },
  S9: { prereq: ['S8'], column: 'RELEASE', docs: { NF: ['T13'], CR: ['T13'], SR_DEFECT: ['T13'], SR_SERVICE: ['T05'] }, ci: ['SMOKE'] }
};
/* Default applicability per work type. Values: FULL, DELTA, LIGHT, CONDITIONAL (active by default), SKIP (can be activated with a reason). */
const APPLY = {
  NF: Object.fromEntries(D.STAGES.map(s => [s.id, 'FULL'])),
  CR: { S0: 'FULL', S1: 'DELTA', S2: 'DELTA', S3: 'CONDITIONAL', S4: 'FULL', S5: 'FULL', S6: 'DELTA', S7: 'DELTA', S8: 'FULL', S9: 'FULL' },
  SR_DEFECT: { S0: 'FULL', S1: 'FULL', S2: 'SKIP', S3: 'SKIP', S4: 'FULL', S5: 'FULL', S6: 'LIGHT', S7: 'LIGHT', S8: 'FULL', S9: 'FULL' },
  SR_SERVICE: { S0: 'FULL', S1: 'SKIP', S2: 'SKIP', S3: 'SKIP', S4: 'FULL', S5: 'FULL', S6: 'SKIP', S7: 'LIGHT', S8: 'SKIP', S9: 'FULL' }
};
const tplChecklist = id => (T.find(t => t.id === id) || {}).checklist || [];
const out = {
  version: 'PD-AISDLC-01 v1.0',
  modes: D.MODES, workTypes: D.WORK_TYPES, severity: D.SEVERITY, srTypes: D.SR_TYPES, techniques: D.TECHNIQUES,
  universalChecklist: D.UNIVERSAL_CHECKLIST, idConventions: D.ID_CONVENTIONS, contextPack: D.CONTEXT_PACK, principles: D.PRINCIPLES,
  stages: D.STAGES.map(s => ({
    id: s.id, gate: s.gate, name: s.name, short: s.short, purpose: s.purpose, entry: s.entry,
    inputs: s.inputs.map(r => ({ item: r[0], source: r[1], preparedBy: r[2], mode: D.MODES[r[3]].code })),
    activities: s.activities.map(r => ({ activity: r[0], performedBy: r[1], mode: D.MODES[r[2]].code })),
    outputs: s.outputs.map(r => ({ output: r[0], template: r[1], mode: D.MODES[r[2]].code, owner: r[3] })),
    checklist: s.checklist, gateText: s.gateText, raci: s.raci, aiRule: s.aiRule, techniques: s.techniques, automatedChecks: s.auto,
    responsibleRole: ROLE[s.id][0], accountableRole: ROLE[s.id][1],
    prerequisites: RULES[s.id].prereq, boardColumn: RULES[s.id].column, requiredDocs: RULES[s.id].docs, requiredCiChecks: RULES[s.id].ci, gitEvidence: RULES[s.id].git || null,
    inputTemplates: Object.entries(D.DOC_MAP).filter(([, m]) => typeof m !== 'string' && m[s.id] === 'U').map(([id]) => id)
  })),
  /* checklists that replace the stage checklist for specific work types */
  checklistOverrides: { CR: { S1: tplChecklist('T04') }, SR_DEFECT: { S0: tplChecklist('T05'), S1: tplChecklist('T06') }, SR_SERVICE: { S0: tplChecklist('T05'), S9: tplChecklist('T05') } },
  applicability: APPLY,
  templates: D.TEMPLATES.map(t => ({ id: t[0], name: t[1], purpose: t[2], stage: t[3], workTypes: t[4], owner: t[5], mode: t[6] })),
  docMap: D.DOC_MAP
};
fs.mkdirSync(path.join(OUT, 'process'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'process', 'process-definition.json'), JSON.stringify(out, null, 1));
fs.mkdirSync(path.join(OUT, 'templates'), { recursive: true });
fs.readdirSync(path.join(SRC, 'templates')).forEach(f => fs.copyFileSync(path.join(SRC, 'templates', f), path.join(OUT, 'templates', f)));
console.log('exported', out.stages.length, 'stages,', out.templates.length, 'templates');
