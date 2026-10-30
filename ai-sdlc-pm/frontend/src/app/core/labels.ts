import { Column, Role, StageStatus } from './models';

export const COLUMNS: Column[] = ['BACKLOG', 'INTAKE', 'DEFINE', 'BUILD', 'TEST', 'RELEASE', 'DONE'];
export const COLUMN_HELP: Record<Column, string> = {
  BACKLOG: 'Captured but not yet taken into the process.',
  INTAKE: 'S0 Intake & triage. Leaves when G0 is approved.',
  DEFINE: 'S1 Requirements and S2 Functional spec (SFVD). Leaves when G1 and G2 are approved or not applicable.',
  BUILD: 'S3 Design, S4 Development, S5 Code review. Leaves when G3–G5 are approved or not applicable.',
  TEST: 'S6 Test design and S7 Test execution. Leaves when G6 and G7 are approved.',
  RELEASE: 'S8 Release readiness and S9 Deploy & verify. Moves to Done when G8 and G9 are approved.',
  DONE: 'Released and verified in production.',
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administrator', PRODUCT_OWNER: 'Product Owner', BUSINESS_ANALYST: 'Business Analyst', TECH_WRITER: 'Technical Writer',
  ARCHITECT: 'Architect', TECH_LEAD: 'Tech Lead', DEVELOPER: 'Developer', REVIEWER: 'Reviewer', QA_LEAD: 'QA Lead', QA_ENGINEER: 'QA Engineer',
  AUTOMATION_ENGINEER: 'Automation Engineer', DOMAIN_SME: 'Domain SME', RELEASE_MANAGER: 'Release Manager', DEVOPS: 'DevOps',
  SECURITY: 'Security', DELIVERY_MANAGER: 'Delivery Manager', COUNCIL: 'AI Governance Council',
};
export const ROLES = Object.keys(ROLE_LABEL) as Role[];

export const STATUS_LABEL: Record<StageStatus, string> = {
  NOT_STARTED: 'Not started', IN_PROGRESS: 'In progress', IN_REVIEW: 'In review', APPROVED: 'Approved', SKIPPED: 'Not applicable',
};
export const STATUS_TONE: Record<StageStatus, string> = { NOT_STARTED: '', IN_PROGRESS: 'info', IN_REVIEW: 'warning', APPROVED: 'good', SKIPPED: '' };

export const TYPE_LABEL: Record<string, string> = { NF: 'New feature', CR: 'Change request', SR: 'Issue / SR', SR_DEFECT: 'Defect', SR_SERVICE: 'Service request' };

export const AI_LABEL: Record<string, string> = {
  NONE: 'No AI used', AI_A: 'AI-assisted (AI-A): AI suggested, a person wrote the output', AI_G: 'AI-generated (AI-G): AI drafted the output, a person reviewed it',
};

export const CONDITION_HELP: Record<string, string> = {
  PREREQUISITES: 'Earlier gates this stage depends on must be approved or marked not applicable.',
  STAGE_ACTIVE: 'The stage must be started before it can be submitted.',
  CHECKLIST: 'Every item of the stage review checklist must be ticked by the reviewer.',
  DOCUMENTS: 'Required output documents must be uploaded and baselined (v1.0 or later).',
  AI_DECLARATION: 'If the output is AI-generated, a T11 AI usage declaration is attached and every AI assumption is resolved.',
  CI_CHECKS: 'Latest Jenkins results for the checks this gate needs must be PASS.',
  GIT_EVIDENCE: 'A pull request whose title or branch carries the work item key must be raised (G4) or merged (G5).',
};

export function tone(v: string | undefined | null): string {
  switch ((v ?? '').toUpperCase()) {
    case 'PASS': case 'SUCCESS': case 'APPROVED': case 'PROCESSED': case 'OK': case 'MERGED': case 'RESOLVED': case 'VERIFIED': case 'DONE': return 'good';
    case 'FAIL': case 'FAILURE': case 'REJECTED': case 'GAP': case 'ERROR': case 'EXPIRED': case 'P1': case 'HIGHEST': return 'critical';
    case 'UNSTABLE': case 'IN_REVIEW': case 'REQUESTED': case 'WARN': case 'P2': case 'HIGH': case 'OPEN': case 'APPROVED_WITH_CONDITIONS': return 'warning';
    case 'IN_PROGRESS': case 'ACTIVE': case 'INFO': return 'info';
    default: return '';
  }
}

export function human(v: string | undefined | null): string {
  if (!v) return '';
  const s = v.replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
