import { DatePipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api, problem } from '../core/api';
import { AppContext } from '../core/context';
import { COLUMNS, STATUS_TONE, human, tone } from '../core/labels';
import { Sprint, WorkItem } from '../core/models';
import { ToastService } from '../core/toast';

@Component({
  selector: 'app-work-items',
  imports: [FormsModule, RouterLink, DatePipe],
  template: `
    <div class="page">
      <div class="page-head">
        <div><h1>Work items</h1><p>New features (NF), change requests (CR) and issues / service requests (SR) in {{ ctx.project()?.key }}.</p></div>
        <button class="btn primary" (click)="open()">+ New work item</button>
      </div>
      <div class="row filters">
        <input type="search" placeholder="Search key, title, process ID or REQ-ID" [(ngModel)]="f.q" (keyup.enter)="load()" class="grow" aria-label="Search">
        <select [(ngModel)]="f.type" (change)="load()" aria-label="Type"><option value="">All types</option><option value="NF">NF</option><option value="CR">CR</option><option value="SR">SR</option></select>
        <select [(ngModel)]="f.column" (change)="load()" aria-label="Column"><option value="">All columns</option>@for (c of columns; track c) { <option [value]="c">{{ human(c) }}</option> }</select>
        <select [(ngModel)]="f.assignee" (change)="load()" aria-label="Assignee"><option value="">Anyone</option>@for (u of ctx.users(); track u.id) { <option [value]="u.username">{{ u.fullName }}</option> }</select>
        <button class="btn" (click)="load()">Search</button>
      </div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Key</th><th>Type</th><th>Title</th><th>Process ID</th><th>Module</th><th>Priority</th><th>Column</th><th>Current stage</th><th>Assignee</th><th>Updated</th></tr></thead>
          <tbody>
            @for (w of items(); track w.id) {
              <tr>
                <td><a [routerLink]="['/work-items', w.key]"><b>{{ w.key }}</b></a></td>
                <td><span class="badge" [class]="'type-' + w.type">{{ w.type }}</span> @if (w.srKind) { <span class="small muted">{{ human(w.srKind) }}</span> }</td>
                <td>{{ w.title }}</td>
                <td class="mono small">{{ w.processId || '—' }}</td>
                <td>{{ w.module }}</td>
                <td><span class="badge" [class]="tone(w.priority)">{{ human(w.priority) }}</span> @if (w.severity) { <span class="badge" [class]="tone(w.severity)">{{ w.severity }}</span> }</td>
                <td>{{ human(w.column) }}</td>
                <td>@if (current(w); as s) { <span class="badge" [class]="statusTone[s.status]">{{ s.stageId }} {{ human(s.status) }}</span> }</td>
                <td>{{ ctx.userName(w.assigneeId) }}</td>
                <td class="small muted nowrap">{{ w.updatedAt | date: 'd MMM, HH:mm' }}</td>
              </tr>
            } @empty { <tr><td colspan="10"><div class="empty">No work items match.</div></td></tr> }
          </tbody>
        </table>
      </div>
    </div>

    @if (creating()) {
      <div class="backdrop" (click)="creating.set(false)">
        <form class="dialog" (click)="$event.stopPropagation()" (ngSubmit)="create()">
          <h2>New work item</h2>
          <p class="muted small">The work type decides which stages apply (process section 3.5). The card starts in the backlog.</p>
          <div class="types">
            @for (t of typeChoices; track t.v) {
              <label class="choice" [class.on]="n.kind === t.v"><input type="radio" name="kind" [value]="t.v" [(ngModel)]="n.kind"><b>{{ t.label }}</b><span class="small muted">{{ t.help }}</span></label>
            }
          </div>
          <div class="stack">
            <label class="field">Title <input name="title" [(ngModel)]="n.title" required placeholder="Short, specific summary"></label>
            <label class="field">Description <textarea name="desc" [(ngModel)]="n.description" placeholder="Source request, business context, acceptance hints"></textarea></label>
            <div class="form-grid">
              <label class="field">Module <select name="module" [(ngModel)]="n.module">@for (m of ctx.project()?.modules ?? []; track m) { <option [value]="m">{{ m }}</option> }</select></label>
              <label class="field">Priority <select name="prio" [(ngModel)]="n.priority"><option>HIGHEST</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></label>
              @if (n.kind === 'SR_DEFECT') {
                <label class="field">Severity <span class="tip" data-tip="P1 production down · P2 major function broken · P3 workaround exists · P4 cosmetic">?</span>
                  <select name="sev" [(ngModel)]="n.severity" required><option value="P1">P1</option><option value="P2">P2</option><option value="P3">P3</option><option value="P4">P4</option></select></label>
              }
              @if (n.kind === 'CR') {
                <label class="field">CR class <span class="tip" data-tip="MAJOR changes go through S3 Design; MINOR changes skip it.">?</span>
                  <select name="crc" [(ngModel)]="n.crClass"><option>MINOR</option><option>MAJOR</option></select></label>
              }
              <label class="field">Assignee <select name="assignee" [(ngModel)]="n.assigneeId"><option value="">Unassigned</option>@for (u of ctx.users(); track u.id) { <option [value]="u.username">{{ u.fullName }}</option> }</select></label>
              <label class="field">Story points <input name="pts" type="number" min="0" max="100" [(ngModel)]="n.storyPoints"></label>
              <label class="field">Sprint <select name="sprint" [(ngModel)]="n.sprintId"><option value="">Backlog</option>@for (s of sprints(); track s.id) { @if (s.status !== 'CLOSED') { <option [value]="s.id">{{ s.name }}</option> } }</select></label>
            </div>
            <div class="row small">Surfaces:
              @for (s of ctx.project()?.surfaces ?? []; track s) { <label class="row"><input type="checkbox" [checked]="n.surfaces.includes(s)" (change)="toggle(s)"> {{ s }}</label> }
            </div>
          </div>
          <div class="form-actions"><button type="button" class="btn" (click)="creating.set(false)">Cancel</button><button class="btn primary" [disabled]="!n.title.trim() || busy()">Create</button></div>
        </form>
      </div>
    }`,
  styles: [`
    .filters { margin-bottom: 12px; }
    .types { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 12px 0; }
    .choice { display: flex; flex-direction: column; gap: 2px; border: 1px solid var(--border-strong); border-radius: 8px; padding: 8px 10px; cursor: pointer; }
    .choice.on { border-color: var(--brand-primary); background: var(--brand-primary-soft); }
    .choice input { display: none; }
    @media (max-width: 700px) { .types { grid-template-columns: 1fr 1fr; } }
  `],
})
export class WorkItemsPage {
  private api = inject(Api);
  private toast = inject(ToastService);
  private router = inject(Router);
  ctx = inject(AppContext);
  columns = COLUMNS; human = human; tone = tone; statusTone = STATUS_TONE;
  items = signal<WorkItem[]>([]);
  sprints = signal<Sprint[]>([]);
  creating = signal(false);
  busy = signal(false);
  f = { q: '', type: '', column: '', assignee: '' };
  typeChoices = [
    { v: 'NF', label: 'New feature', help: 'New capability or application' },
    { v: 'CR', label: 'Change request', help: 'Enhancement to existing behaviour' },
    { v: 'SR_DEFECT', label: 'Defect', help: 'Something is broken (SR)' },
    { v: 'SR_SERVICE', label: 'Service request', help: 'Configuration, data or access (SR)' },
  ];
  n = this.blank();

  constructor() {
    effect(() => { const p = this.ctx.project(); if (p) { this.load(); this.api.sprints(p.id).subscribe(s => this.sprints.set(s)); } });
    if (inject(ActivatedRoute).snapshot.queryParamMap.get('create')) this.open();
  }

  blank() { return { kind: 'NF', title: '', description: '', module: this.ctx?.project()?.modules[0] ?? '', priority: 'MEDIUM', severity: 'P3', crClass: 'MINOR', assigneeId: '', storyPoints: null as number | null, sprintId: '', surfaces: [] as string[] }; }
  open() { this.n = this.blank(); this.creating.set(true); }
  toggle(s: string) { this.n.surfaces = this.n.surfaces.includes(s) ? this.n.surfaces.filter(x => x !== s) : [...this.n.surfaces, s]; }
  current(w: WorkItem) { return Object.values(w.stages).find(s => s.status === 'IN_REVIEW' || s.status === 'IN_PROGRESS'); }

  load() { const p = this.ctx.project(); if (p) this.api.workItems(p.id, this.f).subscribe(i => this.items.set(i)); }

  create() {
    const p = this.ctx.project(); if (!p) return;
    const sr = this.n.kind.startsWith('SR');
    this.busy.set(true);
    this.api.createWorkItem(p.id, {
      type: sr ? 'SR' : this.n.kind, srKind: sr ? this.n.kind.slice(3) : null, title: this.n.title, description: this.n.description, module: this.n.module,
      surfaces: this.n.surfaces, priority: this.n.priority, severity: this.n.kind === 'SR_DEFECT' ? this.n.severity : null, crClass: this.n.kind === 'CR' ? this.n.crClass : null,
      assigneeId: this.n.assigneeId || null, storyPoints: this.n.storyPoints, sprintId: this.n.sprintId || null, labels: [],
    }).subscribe({
      next: w => { this.busy.set(false); this.creating.set(false); this.toast.good(`${w.key} created${w.processId ? ' as ' + w.processId : ''}.`); this.router.navigate(['/work-items', w.key]); },
      error: e => { this.busy.set(false); const pr = problem(e); this.toast.bad(pr.text, pr.detail); },
    });
  }
}
