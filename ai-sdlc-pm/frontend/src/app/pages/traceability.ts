import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api, problem } from '../core/api';
import { AppContext } from '../core/context';
import { human, tone } from '../core/labels';
import { Requirement } from '../core/models';
import { ToastService } from '../core/toast';

@Component({
  selector: 'app-traceability',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-head">
        <div><h1>Traceability matrix</h1><p>Requirement → specification → work item → code → test → release. Git and Jenkins fill the code and test columns automatically.</p></div>
        <div class="row">
          <button class="btn" (click)="csv()">⤓ Export CSV</button>
          <button class="btn primary" (click)="edit = { reqId: '', title: '', module: ctx.project()?.modules?.[0], priority: 'MUST', status: 'DRAFT', revision: 'r1' }">+ Requirement</button>
        </div>
      </div>
      <div class="row filters">
        <input type="search" placeholder="Filter REQ-ID, title, work item…" [(ngModel)]="q" class="grow" aria-label="Filter">
        <select [(ngModel)]="cov" aria-label="Coverage"><option value="">All coverage</option><option value="OK">Complete</option><option value="GAP">Gaps</option><option value="RETIRED">Retired</option></select>
        <span class="badge good">✓ {{ count('OK') }} complete</span><span class="badge critical">! {{ count('GAP') }} gaps</span>
      </div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>REQ-ID</th><th>Title</th><th>Module</th><th>Priority</th><th>Status</th><th>SFVD</th><th>Work items</th><th>Code</th><th>Tests</th><th>Last result</th><th>Release</th><th>Coverage <span class="tip" data-tip="Complete = at least one commit or PR, at least one test case, and the last test result PASS.">?</span></th></tr></thead>
          <tbody>
            @for (r of rows(); track r.reqId) {
              <tr (click)="edit = clone(r)" class="click">
                <td class="mono nowrap"><b>{{ r.reqId }}</b><span class="muted">{{ r.revision ? '.' + r.revision : '' }}</span></td>
                <td>{{ r.title }}</td><td>{{ r.module }}</td><td>{{ r.priority }}</td>
                <td><span class="badge" [class.warning]="r.status === 'UNREGISTERED'">{{ human(r.status) }}</span></td>
                <td class="small">{{ r.sfvdRef }}</td>
                <td>@for (k of r.workItemKeys ?? []; track k) { <a [routerLink]="['/work-items', k]" (click)="$event.stopPropagation()">{{ k }}</a> }</td>
                <td class="small"><span [attr.data-tip]="(r.commits ?? []).join(', ')">{{ r.commits?.length ?? 0 }} commits</span> · {{ r.pullRequests?.length ?? 0 }} PR</td>
                <td class="small" [attr.data-tip]="(r.testCases ?? []).join(', ')">{{ r.testCases?.length ?? 0 }}</td>
                <td><span class="badge" [class]="tone(r.lastTestResult)">{{ human(r.lastTestResult) }}</span></td>
                <td class="small">{{ r.release }}</td>
                <td><span class="badge" [class]="tone(r.coverage)">{{ r.coverage === 'OK' ? '✓ Complete' : r.coverage === 'GAP' ? '! Gap' : human(r.coverage) }}</span></td>
              </tr>
            } @empty { <tr><td colspan="12"><div class="empty">No requirements yet. Register them from T01 with “+ Requirement”.</div></td></tr> }
          </tbody>
        </table>
      </div>
    </div>
    @if (edit; as e) {
      <div class="backdrop" (click)="edit = null">
        <form class="dialog" (click)="$event.stopPropagation()" (ngSubmit)="save()">
          <h2>{{ e.id ? 'Edit ' + e.reqId : 'Register requirement' }}</h2>
          <div class="form-grid">
            <label class="field">REQ-ID <input name="id" [(ngModel)]="e.reqId" [readonly]="!!e.id" placeholder="DEP-REQ-214" required></label>
            <label class="field">Revision <input name="rev" [(ngModel)]="e.revision"></label>
            <label class="field">Module <select name="m" [(ngModel)]="e.module">@for (m of ctx.project()?.modules ?? []; track m) { <option>{{ m }}</option> }</select></label>
            <label class="field">Surface <input name="s" [(ngModel)]="e.surface" placeholder="WEB, MOBILE, API…"></label>
            <label class="field">Priority <select name="p" [(ngModel)]="e.priority"><option>MUST</option><option>SHOULD</option><option>COULD</option><option>WONT</option></select></label>
            <label class="field">Status <select name="st" [(ngModel)]="e.status"><option>DRAFT</option><option>APPROVED</option><option>IN_PROGRESS</option><option>DONE</option><option>RETIRED</option></select></label>
            <label class="field">SFVD reference <input name="sf" [(ngModel)]="e.sfvdRef" placeholder="T02 §4.2"></label>
            <label class="field">Release <input name="rel" [(ngModel)]="e.release"></label>
          </div>
          <label class="field" style="margin-top:12px">Title <input name="t" [(ngModel)]="e.title" required></label>
          <div class="form-actions"><button type="button" class="btn" (click)="edit = null">Cancel</button><button class="btn primary">Save</button></div>
        </form>
      </div>
    }`,
  styles: [`.filters { margin-bottom: 12px; } tr.click { cursor: pointer; } td a { margin-right: 6px; }`],
})
export class TraceabilityPage {
  private api = inject(Api);
  private toast = inject(ToastService);
  ctx = inject(AppContext);
  human = human; tone = tone;
  all = signal<Requirement[]>([]);
  q = ''; cov = '';
  edit: Requirement | null = null;
  rows = () => this.filtered();
  constructor() { effect(() => { if (this.ctx.project()) this.load(); }); }
  load() { const p = this.ctx.project(); if (p) this.api.requirements(p.id).subscribe(r => this.all.set(r)); }
  filtered() {
    const q = this.q.trim().toLowerCase();
    return this.all().filter(r => (!this.cov || r.coverage === this.cov) && (!q || [r.reqId, r.title, ...(r.workItemKeys ?? [])].join(' ').toLowerCase().includes(q)));
  }
  count(c: string) { return this.all().filter(r => r.coverage === c).length; }
  clone(r: Requirement) { return { ...r }; }
  save() {
    const p = this.ctx.project(); if (!p || !this.edit) return;
    this.api.saveRequirement(p.id, this.edit).subscribe({
      next: r => { this.toast.good(`${r.reqId} saved.`); this.edit = null; this.load(); },
      error: e => { const x = problem(e); this.toast.bad(x.text, x.detail); },
    });
  }
  csv() { const p = this.ctx.project(); if (p) this.api.download(this.api.rtmCsvUrl(p.id), `${p.key}-rtm.csv`).subscribe(); }
}
