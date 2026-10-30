import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApiProblem, Approval, AuditEvent, Burndown, ColumnView, CommitRecord, Card, Dashboard, DocumentRecord, DocumentsView, Endpoints,
  GateEvaluation, IntegrationEvent, LoginResponse, Page, ProcessDefinition, Project, Requirement, Role, Sprint, SystemEvent, UserView, Waiver, WorkItem,
} from './models';

type Params = Record<string, string | number | boolean | null | undefined>;

@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);

  private params(p: Params = {}) {
    let hp = new HttpParams();
    for (const [k, v] of Object.entries(p)) if (v !== null && v !== undefined && v !== '') hp = hp.set(k, String(v));
    return hp;
  }

  login(username: string, password: string) { return this.http.post<LoginResponse>('/api/auth/login', { username, password }); }
  changePassword(currentPassword: string, newPassword: string) { return this.http.post<void>('/api/users/me/password', { currentPassword, newPassword }); }
  users() { return this.http.get<UserView[]>('/api/users'); }
  createUser(u: { username: string; fullName: string; email?: string; password: string; roles: Role[] }) { return this.http.post<UserView>('/api/users', u); }
  updateUser(id: string, u: { fullName: string; email?: string; roles: Role[]; active: boolean }) { return this.http.put<UserView>(`/api/users/${id}`, u); }

  process() { return this.http.get<ProcessDefinition>('/api/process'); }
  projects() { return this.http.get<Project[]>('/api/projects'); }
  createProject(p: Partial<Project>) { return this.http.post<Project>('/api/projects', p); }
  updateProject(id: string, p: Partial<Project>) { return this.http.put<Project>(`/api/projects/${id}`, p); }
  updateIntegrations(id: string, i: Project['integrations']) { return this.http.put<Project>(`/api/projects/${id}/integrations`, i); }

  dashboard(pid: string) { return this.http.get<Dashboard>(`/api/projects/${pid}/dashboard`); }
  board(pid: string, sprintId?: string) { return this.http.get<ColumnView[]>(`/api/projects/${pid}/board`, { params: this.params({ sprintId }) }); }
  approvals(pid: string, mine: boolean) { return this.http.get<Approval[]>(`/api/projects/${pid}/approvals`, { params: this.params({ mine }) }); }
  workItems(pid: string, f: Params = {}) { return this.http.get<WorkItem[]>(`/api/projects/${pid}/work-items`, { params: this.params(f) }); }
  createWorkItem(pid: string, w: Record<string, unknown>) { return this.http.post<WorkItem>(`/api/projects/${pid}/work-items`, w); }
  workItem(key: string) { return this.http.get<WorkItem>(`/api/work-items/${key}`); }
  updateWorkItem(key: string, w: Record<string, unknown>) { return this.http.put<WorkItem>(`/api/work-items/${key}`, w); }
  move(key: string, column: string, rank?: number, reason?: string) { return this.http.post<Card>(`/api/work-items/${key}/move`, { column, rank, reason }); }
  activity(key: string) { return this.http.get<AuditEvent[]>(`/api/work-items/${key}/activity`); }
  startStage(key: string, s: string) { return this.http.post<WorkItem>(`/api/work-items/${key}/stages/${s}/start`, {}); }
  applicability(key: string, s: string, applicable: boolean, reason: string) { return this.http.post<WorkItem>(`/api/work-items/${key}/stages/${s}/applicability`, { applicable, reason }); }
  check(key: string, s: string, index: number, checked: boolean, evidence?: string) { return this.http.put<WorkItem>(`/api/work-items/${key}/stages/${s}/checklist/${index}`, { checked, evidence }); }
  aiUsage(key: string, s: string, aiUsage: string, aiOperator: string | null, unresolvedAssumptions: number) {
    return this.http.put<WorkItem>(`/api/work-items/${key}/stages/${s}/ai`, { aiUsage, aiOperator, unresolvedAssumptions });
  }
  gate(key: string, s: string) { return this.http.get<GateEvaluation>(`/api/work-items/${key}/stages/${s}/gate`); }
  submit(key: string, s: string) { return this.http.post<WorkItem>(`/api/work-items/${key}/stages/${s}/submit`, {}); }
  decide(key: string, s: string, decision: string, comment: string, reviewer: string) { return this.http.post<WorkItem>(`/api/work-items/${key}/stages/${s}/decision`, { decision, comment, reviewer }); }
  linkRequirement(key: string, reqId: string) { return this.http.post<WorkItem>(`/api/work-items/${key}/requirements`, { reqId }); }
  unlinkRequirement(key: string, reqId: string) { return this.http.delete<WorkItem>(`/api/work-items/${key}/requirements/${reqId}`); }

  documents(key: string) { return this.http.get<DocumentsView>(`/api/work-items/${key}/documents`); }
  upload(key: string, stageId: string, file: File, f: { templateId?: string; title?: string; direction: string; comment?: string }) {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<DocumentRecord>(`/api/work-items/${key}/stages/${stageId}/documents`, body, { params: this.params(f) });
  }
  baseline(id: string, comment?: string) { return this.http.post<DocumentRecord>(`/api/documents/${id}/baseline`, { comment }); }
  docFileUrl(id: string, version: string) { return `/api/documents/${id}/versions/${version}/file`; }
  templateUrl(id: string) { return `/api/templates/${id}/file`; }
  blob(url: string) { return this.http.get(url, { responseType: 'blob', observe: 'response' }); }

  bugLink(key: string, bugId: number) { return this.http.post<WorkItem>(`/api/work-items/${key}/bugs`, { bugId }); }
  bugUnlink(key: string, bugId: number) { return this.http.delete<WorkItem>(`/api/work-items/${key}/bugs/${bugId}`); }
  bugCreate(key: string) { return this.http.post<WorkItem>(`/api/work-items/${key}/bugs/create`, {}); }
  bugRefresh(key: string) { return this.http.post<WorkItem>(`/api/work-items/${key}/bugs/refresh`, {}); }
  bugzillaImport(pid: string) { return this.http.post<{ found: number; imported: number; alreadyLinked: number; created: string[] }>(`/api/projects/${pid}/bugzilla/import`, {}); }
  bugzillaTest(pid: string) { return this.http.post<{ ok: boolean; version?: string; message: string }>(`/api/projects/${pid}/bugzilla/test`, {}); }

  requirements(pid: string) { return this.http.get<Requirement[]>(`/api/projects/${pid}/requirements`); }
  saveRequirement(pid: string, r: Requirement) { return this.http.post<Requirement>(`/api/projects/${pid}/requirements`, r); }
  rtmCsvUrl(pid: string) { return `/api/projects/${pid}/requirements/export`; }

  sprints(pid: string) { return this.http.get<Sprint[]>(`/api/projects/${pid}/sprints`); }
  createSprint(pid: string, s: Partial<Sprint>) { return this.http.post<Sprint>(`/api/projects/${pid}/sprints`, s); }
  startSprint(id: string) { return this.http.post<Sprint>(`/api/sprints/${id}/start`, {}); }
  closeSprint(id: string) { return this.http.post<Sprint>(`/api/sprints/${id}/close`, {}); }
  burndown(id: string) { return this.http.get<Burndown>(`/api/sprints/${id}/burndown`); }

  waivers(pid: string) { return this.http.get<Waiver[]>(`/api/projects/${pid}/waivers`); }
  requestWaiver(pid: string, w: Partial<Waiver>) { return this.http.post<Waiver>(`/api/projects/${pid}/waivers`, w); }
  decideWaiver(id: string, approve: boolean, comment: string) { return this.http.post<Waiver>(`/api/waivers/${id}/decision`, { approve, comment }); }
  closeWaiver(id: string, outcome: string) { return this.http.post<Waiver>(`/api/waivers/${id}/close`, { outcome }); }
  waivable() { return this.http.get<string[]>('/api/waivers/conditions'); }

  audit(f: Params) { return this.http.get<Page<AuditEvent>>('/api/audit', { params: this.params(f) }); }
  auditCsvUrl(f: Params) { return '/api/audit/export?' + this.params(f).toString(); }
  systemEvents(f: Params) { return this.http.get<Page<SystemEvent>>('/api/system-events', { params: this.params(f) }); }

  integrationEvents(pid: string, source?: string) { return this.http.get<IntegrationEvent[]>(`/api/projects/${pid}/integration-events`, { params: this.params({ source }) }); }
  commits(pid: string) { return this.http.get<CommitRecord[]>(`/api/projects/${pid}/commits`); }
  endpoints(pid: string) { return this.http.get<Endpoints>(`/api/projects/${pid}/integration-endpoints`); }

  /** Authenticated download: fetch as blob, then save with the server's file name. */
  download(url: string, fallbackName: string): Observable<void> {
    return new Observable<void>(sub => {
      this.blob(url).subscribe({
        next: res => {
          const cd = res.headers.get('Content-Disposition') ?? '';
          const m = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
          const name = m ? decodeURIComponent(m[1]) : fallbackName;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(res.body as Blob);
          a.download = name;
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 2000);
          sub.next(); sub.complete();
        },
        error: e => sub.error(e),
      });
    });
  }
}

/** Human-readable message from an RFC 7807 problem response. */
export function problem(e: unknown): { text: string; detail?: string } {
  const err = e as HttpErrorResponse;
  const p = (err?.error ?? {}) as ApiProblem;
  if (err?.status === 0) return { text: 'The server cannot be reached. Check that the API is running.' };
  const details = Array.isArray(p.details) && p.details.length
    ? p.details.map(d => typeof d === 'string' ? d : (d as { label?: string; detail?: string }).label
        ? `${(d as { label: string }).label}: ${(d as { detail: string }).detail}` : JSON.stringify(d)).join(' · ')
    : undefined;
  return { text: p.detail ?? p.title ?? err?.message ?? 'Something went wrong.', detail: [details, p.correlationId ? `Ref ${p.correlationId}` : ''].filter(Boolean).join(' — ') || undefined };
}
