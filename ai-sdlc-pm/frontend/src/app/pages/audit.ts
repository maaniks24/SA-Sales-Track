import { DatePipe, JsonPipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api, problem } from '../core/api';
import { AuthService } from '../core/auth';
import { AppContext } from '../core/context';
import { tone } from '../core/labels';
import { AuditEvent, Page, SystemEvent } from '../core/models';
import { ToastService } from '../core/toast';

@Component({
  selector: 'app-audit',
  imports: [FormsModule, DatePipe, JsonPipe, RouterLink],
  template: `
    <div class="page">
      <div class="page-head"><div><h1>Audit & system log</h1><p>The audit log is append-only: every gate decision, checklist tick, document version, board move and integration call is recorded with who, when and a correlation ID.</p></div></div>
      <div class="tabs">
        <button [class.active]="tab() === 'audit'" (click)="tab.set('audit')">Audit log</button>
        @if (canSystem) { <button [class.active]="tab() === 'system'" (click)="tab.set('system'); loadSystem()">System log (errors & warnings)</button> }
      </div>
      @if (tab() === 'audit') {
        <div class="row filters">
          <select [(ngModel)]="f.actor" aria-label="User"><option value="">Any user</option>@for (u of ctx.users(); track u.id) { <option [value]="u.username">{{ u.fullName }}</option> }<option value="system">system</option></select>
          <input [(ngModel)]="f.action" placeholder="Action, e.g. GATE_APPROVED" aria-label="Action">
          <select [(ngModel)]="f.entityType" aria-label="Entity"><option value="">Any entity</option>@for (t of entities; track t) { <option>{{ t }}</option> }</select>
          <input [(ngModel)]="f.entityId" placeholder="Entity ID, e.g. FAS-3" aria-label="Entity ID">
          <label class="row small">From <input type="date" [(ngModel)]="f.from"></label>
          <label class="row small">To <input type="date" [(ngModel)]="f.to"></label>
          <button class="btn primary" (click)="page = 0; load()">Apply</button>
          <button class="btn" (click)="csv()">⤓ CSV</button>
        </div>
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Entity</th><th>Summary</th><th>Correlation</th></tr></thead>
            <tbody>
              @for (e of audit()?.items ?? []; track e.id) {
                <tr (click)="open.set(open() === e.id ? null : e.id)" class="click">
                  <td class="nowrap small">{{ e.at | date: 'd MMM y, HH:mm:ss' }}</td><td>{{ ctx.userName(e.actor) }}</td>
                  <td><span class="badge" [class]="tone(e.action.split('_').at(-1))">{{ e.action }}</span></td>
                  <td class="nowrap">@if (e.entityType === 'WORK_ITEM') { <a [routerLink]="['/work-items', e.entityId]" (click)="$event.stopPropagation()">{{ e.entityId }}</a> } @else { <span class="small muted">{{ e.entityType }}</span> {{ e.entityId.length > 14 ? e.entityId.slice(0, 8) + '…' : e.entityId }} }</td>
                  <td>{{ e.summary }}@if (open() === e.id && e.details) { <pre>{{ e.details | json }}</pre> }</td>
                  <td class="mono small">{{ e.correlationId?.slice(0, 8) }}</td>
                </tr>
              } @empty { <tr><td colspan="6"><div class="empty">No events match.</div></td></tr> }
            </tbody>
          </table>
        </div>
        <div class="row pager"><span class="small muted">{{ audit()?.total ?? 0 }} events</span><span class="grow"></span>
          <button class="btn sm" [disabled]="page === 0" (click)="page = page - 1; load()">‹ Newer</button>
          <span class="small">Page {{ page + 1 }}</span>
          <button class="btn sm" [disabled]="((page + 1) * 50) >= (audit()?.total ?? 0)" (click)="page = page + 1; load()">Older ›</button></div>
      } @else {
        <div class="row filters"><select [(ngModel)]="level" (change)="loadSystem()" aria-label="Level"><option value="">All levels</option><option>ERROR</option><option>WARN</option><option>INFO</option></select>
          <span class="small muted">Unexpected errors show the correlation ID users see in error messages, so support can find the matching server log line.</span></div>
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th>When</th><th>Level</th><th>Source</th><th>Message</th><th>Path</th><th>User</th><th>Correlation</th></tr></thead>
            <tbody>
              @for (e of system()?.items ?? []; track e.id) {
                <tr><td class="nowrap small">{{ e.at | date: 'd MMM, HH:mm:ss' }}</td><td><span class="badge" [class]="tone(e.level)">{{ e.level }}</span></td><td>{{ e.source }}</td>
                  <td>{{ e.message }}@if (e.exception) { <div class="small muted mono">{{ e.exception }}</div> }</td><td class="mono small">{{ e.path }}</td><td>{{ e.actor }}</td><td class="mono small">{{ e.correlationId }}</td></tr>
              } @empty { <tr><td colspan="7"><div class="empty">No system events.</div></td></tr> }
            </tbody>
          </table>
        </div>
      }
    </div>`,
  styles: [`.filters { margin-bottom: 12px; } .pager { margin-top: 10px; } tr.click { cursor: pointer; } pre { font-size: 11px; background: var(--surface-2); padding: 8px; border-radius: 4px; white-space: pre-wrap; }`],
})
export class AuditPage {
  private api = inject(Api);
  private toast = inject(ToastService);
  ctx = inject(AppContext);
  tone = tone;
  canSystem = inject(AuthService).has('COUNCIL', 'DEVOPS');
  tab = signal<'audit' | 'system'>('audit');
  audit = signal<Page<AuditEvent> | null>(null);
  system = signal<Page<SystemEvent> | null>(null);
  open = signal<string | null>(null);
  entities = ['WORK_ITEM', 'DOCUMENT', 'WAIVER', 'REQUIREMENT', 'SPRINT', 'PROJECT', 'USER'];
  f = { actor: '', action: '', entityType: '', entityId: '', from: '', to: '' };
  page = 0;
  level = '';

  constructor() { effect(() => { if (this.ctx.project()) this.load(); }); }
  private params() {
    return { projectId: this.ctx.project()?.id, actor: this.f.actor, action: this.f.action.trim().toUpperCase(), entityType: this.f.entityType, entityId: this.f.entityId.trim().toUpperCase() || this.f.entityId,
      from: this.f.from ? this.f.from + 'T00:00:00Z' : '', to: this.f.to ? this.f.to + 'T23:59:59Z' : '', page: this.page, size: 50 };
  }
  load() { this.api.audit(this.params()).subscribe({ next: a => this.audit.set(a), error: e => this.toast.bad(problem(e).text) }); }
  loadSystem() { this.api.systemEvents({ level: this.level, size: 100 }).subscribe({ next: s => this.system.set(s), error: e => this.toast.bad(problem(e).text) }); }
  csv() { this.api.download(this.api.auditCsvUrl({ projectId: this.ctx.project()?.id, action: this.f.action.trim().toUpperCase() }), 'audit.csv').subscribe(); }
}
