import { DatePipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Api, problem } from '../core/api';
import { AuthService } from '../core/auth';
import { AppContext } from '../core/context';
import { CONDITION_HELP, human, tone } from '../core/labels';
import { Waiver } from '../core/models';
import { ToastService } from '../core/toast';

@Component({
  selector: 'app-waivers',
  imports: [FormsModule, RouterLink, DatePipe],
  template: `
    <div class="page">
      <div class="page-head">
        <div><h1>Waivers</h1><p>A waiver lets a gate pass without one of its conditions, for a limited time, with compensating controls. The AI Governance Council or the Architect decides; the requester cannot.</p></div>
        <button class="btn primary" (click)="openRequest()">+ Request waiver</button>
      </div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Waiver</th><th>Work item / stage</th><th>Conditions waived</th><th>Risk</th><th>Reason & controls</th><th>Expiry</th><th>Status</th><th>Requested</th><th></th></tr></thead>
          <tbody>
            @for (w of list(); track w.id) {
              <tr>
                <td><b>{{ w.key }}</b></td>
                <td><a [routerLink]="['/work-items', w.workItemKey]" [queryParams]="{ stage: w.stageId }">{{ w.workItemKey }}</a> {{ w.stageId }}</td>
                <td>@for (c of w.conditions; track c) { <span class="badge" [attr.data-tip]="help[c]">{{ c }}</span> }</td>
                <td><span class="badge" [class.critical]="w.risk === 'HIGH'" [class.warning]="w.risk === 'MEDIUM'">{{ w.risk }}</span></td>
                <td class="small">{{ w.reason }}@if (w.compensatingControls) { <div class="muted">Controls: {{ w.compensatingControls }}</div> }
                  @if (w.decisionComment) { <div class="muted">Decision: {{ w.decisionComment }}</div> }</td>
                <td class="nowrap">{{ w.expiry | date: 'd MMM y' }}</td>
                <td><span class="badge" [class]="tone(w.status)">{{ human(w.status) }}</span></td>
                <td class="small">{{ ctx.userName(w.requestedBy) }}<div class="muted">{{ w.requestedAt | date: 'd MMM' }}</div></td>
                <td class="nowrap">
                  @if (w.status === 'REQUESTED' && auth.has('COUNCIL', 'ARCHITECT') && w.requestedBy !== auth.user()?.username) {
                    <button class="btn sm good" (click)="decide(w, true)">Approve</button> <button class="btn sm danger" (click)="decide(w, false)">Reject</button>
                  }
                  @if (w.status === 'APPROVED' || w.status === 'EXPIRED') { <button class="btn sm" (click)="close(w)">Close</button> }
                </td>
              </tr>
            } @empty { <tr><td colspan="9"><div class="empty">No waivers. That is a good sign.</div></td></tr> }
          </tbody>
        </table>
      </div>
    </div>
    @if (req; as r) {
      <div class="backdrop" (click)="req = null">
        <form class="dialog" (click)="$event.stopPropagation()" (ngSubmit)="submit()">
          <h2>Request a waiver</h2>
          <p class="small muted">Schedule pressure alone is not a reason. Expiry is at most 90 days away.</p>
          <div class="form-grid">
            <label class="field">Work item <input name="wi" [(ngModel)]="r.workItemKey" placeholder="FAS-12" required></label>
            <label class="field">Stage <select name="st" [(ngModel)]="r.stageId">@for (s of ctx.stages(); track s.id) { <option [value]="s.id">{{ s.gate }} {{ s.short }}</option> }</select></label>
            <label class="field">Risk <select name="risk" [(ngModel)]="r.risk"><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></label>
            <label class="field">Expiry <input name="exp" type="date" [(ngModel)]="r.expiry" required></label>
          </div>
          <div class="conds">
            @for (c of conditions(); track c) {
              <label class="row" [attr.data-tip]="help[c]"><input type="checkbox" [checked]="r.conditions.includes(c)" (change)="toggle(c)"> {{ c }}</label>
            }
          </div>
          <label class="field">Reason <textarea name="reason" [(ngModel)]="r.reason" required></textarea></label>
          <label class="field" style="margin-top:10px">Compensating controls <textarea name="cc" [(ngModel)]="r.compensatingControls" placeholder="What reduces the risk while the waiver is open"></textarea></label>
          <div class="form-actions"><button type="button" class="btn" (click)="req = null">Cancel</button><button class="btn primary" [disabled]="!r.conditions.length">Request</button></div>
        </form>
      </div>
    }`,
  styles: [`.conds { display: flex; flex-wrap: wrap; gap: 14px; margin: 14px 0; font-size: 13px; }`],
})
export class WaiversPage {
  private api = inject(Api);
  private toast = inject(ToastService);
  auth = inject(AuthService);
  ctx = inject(AppContext);
  help = CONDITION_HELP; human = human; tone = tone;
  list = signal<Waiver[]>([]);
  conditions = signal<string[]>([]);
  req: { workItemKey: string; stageId: string; conditions: string[]; risk: string; expiry: string; reason: string; compensatingControls: string } | null = null;
  private qp = inject(ActivatedRoute).snapshot.queryParamMap;

  constructor() {
    this.api.waivable().subscribe(c => this.conditions.set(c));
    effect(() => { if (this.ctx.project()) this.load(); });
    if (this.qp.get('request')) this.openRequest(this.qp.get('workItem') ?? '', this.qp.get('stage') ?? 'S0');
  }
  load() { const p = this.ctx.project(); if (p) this.api.waivers(p.id).subscribe(w => this.list.set(w)); }
  openRequest(workItemKey = '', stageId = 'S0') {
    this.req = { workItemKey, stageId, conditions: [], risk: 'LOW', expiry: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10), reason: '', compensatingControls: '' };
  }
  toggle(c: string) { const r = this.req!; r.conditions = r.conditions.includes(c) ? r.conditions.filter(x => x !== c) : [...r.conditions, c]; }
  private h(ok: string) { return { next: () => { this.toast.good(ok); this.load(); }, error: (e: unknown) => { const p = problem(e); this.toast.bad(p.text, p.detail); } }; }
  submit() { const p = this.ctx.project(); if (p && this.req) { this.api.requestWaiver(p.id, { ...this.req, workItemKey: this.req.workItemKey.toUpperCase() } as Partial<Waiver>).subscribe(this.h('Waiver requested.')); this.req = null; } }
  decide(w: Waiver, approve: boolean) {
    const comment = prompt(approve ? 'Comment (optional)' : 'Why is the waiver rejected?') ?? '';
    if (!approve && !comment.trim()) return;
    this.api.decideWaiver(w.id, approve, comment).subscribe(this.h(`${w.key} ${approve ? 'approved' : 'rejected'}.`));
  }
  close(w: Waiver) { const o = prompt('Outcome: was the waived condition met afterwards?'); if (o !== null) this.api.closeWaiver(w.id, o).subscribe(this.h(`${w.key} closed.`)); }
}
