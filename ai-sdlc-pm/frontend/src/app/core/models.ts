export type Role =
  | 'ADMIN' | 'PRODUCT_OWNER' | 'BUSINESS_ANALYST' | 'TECH_WRITER' | 'ARCHITECT' | 'TECH_LEAD' | 'DEVELOPER' | 'REVIEWER'
  | 'QA_LEAD' | 'QA_ENGINEER' | 'AUTOMATION_ENGINEER' | 'DOMAIN_SME' | 'RELEASE_MANAGER' | 'DEVOPS' | 'SECURITY' | 'DELIVERY_MANAGER' | 'COUNCIL';
export type WorkType = 'NF' | 'CR' | 'SR';
export type Column = 'BACKLOG' | 'INTAKE' | 'DEFINE' | 'BUILD' | 'TEST' | 'RELEASE' | 'DONE';
export type StageStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'IN_REVIEW' | 'APPROVED' | 'SKIPPED';

export interface UserView { id: string; username: string; fullName: string; email?: string; roles: Role[]; active?: boolean; }
export interface LoginResponse { token: string; expiresAt: string; user: UserView; }

export interface Project {
  id: string; key: string; name: string; description?: string; modules: string[]; surfaces: string[];
  wipLimits: Record<string, number | undefined>; contextPackVersion?: string; currentRelease?: string; createdAt?: string;
  integrations: {
    git: { provider?: string; repoUrl?: string; defaultBranch?: string; webhookSecret?: string; webhookSecretSet?: boolean };
    ci: { provider?: string; url?: string; jobName?: string; token?: string; tokenSet?: boolean };
    bugzilla: { enabled: boolean; baseUrl?: string; product?: string; component?: string; version?: string; resolveOnClose: boolean; apiKey?: string; apiKeySet?: boolean };
  };
}

export interface CheckItem { index: number; text: string; checked: boolean; checkedBy?: string; checkedAt?: string; evidence?: string; }
export interface GateDecision { decision: string; by?: string; byName?: string; reviewer?: string; comment?: string; waivedConditions: string[]; waiverKeys: string[]; at: string; }
export interface StageState {
  stageId: string; status: StageStatus; applicability: string; checklist: CheckItem[]; ownerId?: string; aiUsage: 'NONE' | 'AI_A' | 'AI_G';
  aiOperator?: string; unresolvedAssumptions?: number; skipReason?: string; lastDecision?: GateDecision; history: GateDecision[];
  startedAt?: string; submittedAt?: string; approvedAt?: string;
}
export interface CommitRef { sha: string; message: string; author: string; branch?: string; url?: string; at: string; validId: boolean; }
export interface PullRequestRef { provider?: string; number: string; title: string; url?: string; state: string; sourceBranch?: string; targetBranch?: string; author?: string; updatedAt?: string; }
export interface BuildRef { job: string; number: number; status: string; url?: string; branch?: string; commit?: string; checks: Record<string, string>; parity?: Record<string, number>; at: string; }
export interface BugRef { id: number; summary: string; status: string; resolution?: string; severity?: string; url?: string; syncedAt?: string; syncError?: string; }

export interface WorkItem {
  id: string; projectId: string; key: string; processId?: string; type: WorkType; srKind?: 'DEFECT' | 'SERVICE'; crClass?: string;
  title: string; description?: string; module?: string; surfaces: string[]; priority: string; severity?: string; column: Column; rank: number;
  assigneeId?: string; reporterId?: string; sprintId?: string; storyPoints?: number; labels: string[]; requirementIds: string[];
  stages: Record<string, StageState>; commits: CommitRef[]; pullRequests: PullRequestRef[]; builds: BuildRef[]; bugs: BugRef[];
  missedGate?: string; reworkCount: number; createdAt: string; updatedAt: string; closedAt?: string;
}

export interface Card {
  key: string; title: string; type: WorkType; srKind?: string; processId?: string; priority: string; severity?: string; assigneeId?: string;
  storyPoints?: number; column: Column; activeStage?: string; inReview: boolean; readyToMove: boolean; gatesDone: number; gatesTotal: number;
  labels: string[]; bugs: number; reworkCount: number; sprintId?: string; rank: number;
}
export interface ColumnView { column: Column; wipLimit: number; count: number; overLimit: boolean; cards: Card[]; }
export interface Approval { key: string; title: string; type: WorkType; stageId: string; gate: string; stageName: string; submittedAt?: string; submittedBy?: string; accountableRole: Role; }

export interface Condition { code: string; label: string; met: boolean; waived: boolean; detail: string; waiverKey?: string; }
export interface GateEvaluation { stageId: string; gate: string; status: StageStatus; readyForReview: boolean; canApprove: boolean; accountableRole: Role; conditions: Condition[]; approvalBlockers: string[]; }

export interface DocVersion { version: string; fileId: string; fileName: string; contentType: string; size: number; sha256: string; uploadedBy: string; uploadedAt: string; comment?: string; baseline: boolean; }
export interface DocumentRecord {
  id: string; workItemKey: string; stageId: string; templateId?: string; title: string; direction: 'INPUT' | 'OUTPUT'; baselined: boolean;
  currentVersion: string; versions: DocVersion[]; createdBy: string; createdAt: string; updatedAt: string;
}
export interface StageInput { stageId: string; templateId: string; templateName: string; source?: DocumentRecord; }
export interface DocumentsView { documents: DocumentRecord[]; inputs: StageInput[]; }

export interface Requirement {
  id?: string; reqId: string; revision?: string; title?: string; module?: string; surface?: string; priority?: string; status?: string; sfvdRef?: string;
  apiOperations?: string[]; commits?: string[]; pullRequests?: string[]; testCases?: string[]; lastTestResult?: string; defects?: string[]; release?: string;
  updatedAt?: string; workItemKeys?: string[]; coverage?: string;
}

export interface Sprint { id: string; projectId: string; name: string; goal?: string; start: string; end: string; capacity?: number; status: 'PLANNED' | 'ACTIVE' | 'CLOSED'; burndown: BurnPoint[]; }
export interface BurnPoint { date: string; remaining: number; completed: number; }
export interface Burndown { sprint: Sprint; committed: number; remaining: number; completed: number; items: number; itemsDone: number; actual: BurnPoint[]; }

export interface Waiver {
  id: string; key: string; projectId: string; workItemKey: string; stageId: string; conditions: string[]; reason: string; risk: string;
  compensatingControls?: string; owner?: string; expiry: string; status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'CLOSED' | 'EXPIRED';
  requestedBy: string; requestedAt: string; decidedBy?: string; decidedAt?: string; decisionComment?: string; closedAt?: string;
}

export interface AuditEvent { id: string; at: string; actor: string; action: string; entityType: string; entityId: string; projectId?: string; summary: string; details?: Record<string, unknown>; correlationId?: string; }
export interface SystemEvent { id: string; at: string; level: string; source: string; message: string; exception?: string; path?: string; correlationId?: string; actor?: string; }
export interface IntegrationEvent { id: string; projectId: string; source: string; type: string; status: string; summary: string; detail?: string; at: string; }
export interface CommitRecord { id: string; sha: string; message: string; author: string; branch?: string; url?: string; at: string; validId: boolean; workItemKeys: string[]; requirementIds: string[]; }
export interface Page<T> { items: T[]; page: number; size: number; total: number; }
export interface Endpoints { gitWebhook: string; ciWebhook: string; gateCheck: string; gitSecretSet: boolean; ciTokenSet: boolean; bugzillaKeySet: boolean; }

export interface Kpi { key: string; label: string; value: string; hint: string; tone: 'good' | 'warn' | 'bad' | 'neutral'; }
export interface StageFlow { stageId: string; gate: string; name: string; inProgress: number; inReview: number; approved: number; avgDays: number; }
export interface GateStat { gate: string; approved: number; rejected: number; withConditions: number; }
export interface BuildRow { workItem: string; job: string; number: number; status: string; at: string; url?: string; }
export interface Dashboard {
  projectId: string; projectKey: string; projectName: string; generatedAt: string; kpis: Kpi[]; byType: Record<string, number>; byColumn: Record<string, number>;
  wipLimits: Record<string, number>; stageFlow: StageFlow[]; gates: GateStat[]; rtmCoverage: Record<string, number>; defectsByMissedGate: Record<string, number>;
  aiUsage: Record<string, number>; pendingApprovals: Approval[]; waiversAttention: Waiver[]; activeSprint?: Burndown; recentBuilds: BuildRow[]; recentActivity: AuditEvent[];
}

export interface StageDef {
  id: string; gate: string; name: string; short: string; purpose: string; entry: string[];
  inputs: { item: string; source: string; preparedBy: string; mode: string }[];
  activities: { activity: string; performedBy: string; mode: string }[];
  outputs: { output: string; template: string; mode: string; owner: string }[];
  checklist: string[]; gateText: string; raci: Record<string, string>; aiRule: string; techniques: string[]; automatedChecks: string[];
  responsibleRole: Role; accountableRole: Role; prerequisites: string[]; boardColumn: Column; requiredDocs: Record<string, string[]>;
  requiredCiChecks: string[]; gitEvidence?: string; inputTemplates: string[];
}
export interface TemplateDef { id: string; name: string; purpose: string; stage: string; workTypes: string; owner: string; mode: string; }
export interface ProcessDefinition {
  version: string; modes: Record<string, unknown>; workTypes: Record<string, unknown>; stages: StageDef[]; templates: TemplateDef[];
  applicability: Record<string, Record<string, string>>; checklistOverrides: Record<string, Record<string, string[]>>; principles: string[][];
  idConventions: string[][]; severity: string[][]; docMap: Record<string, Record<string, string>>;
}
export interface ApiProblem { status: number; title?: string; detail?: string; code?: string; correlationId?: string; details?: unknown[]; }
