import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api, problem } from '../core/api';
import { BurndownChart, HBars } from '../core/charts';
import { AppContext } from '../core/context';
import { COLUMNS, ROLE_LABEL, human, tone } from '../core/labels';
import { Dashboard } from '../core/models';
import { ToastService } from '../core/toast';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, HBars, BurndownChart],
  template: `
    <div class="page">
      <div class="page-head">
        <div><h1>{{ d()?.projectName ?? 'Dashboard' }}</h1><p>Process health for {{ d()?.projectKey }} · updated {{ d()?.generatedAt | date: 'shortTime' }}</p></div>
        <div class="row"><a class="btn" routerLink="/board">Open board</a><button class="btn" (click)="load()">↻ Refresh</button></div>
      </div>
      @if (d(); as d) {
        <section class="kpis">
          @for (k of d.kpis; track k.key) {
            <div class="card kpi" [class]="k.tone" [attr.data-tip]="k.hint">
              <div class="kl">{{ k.label }}</div>
              <div class="kv">{{ k.value }}</div>
              <div class="kh small">{{ k.hint }}</div>
            </div>
          }
        </section>

        <div class="grid grid-2">
          <section class="card">
            <div class="card-head"><h2>Work by board column <span class="tip" data-tip="Bars show items in each column; the black tick is the WIP limit.">?</span></h2>
              <span class="small muted">{{ total() }} items</span></div>
            <app-hbars [rows]="columnRows()" label="Work items per Kanban column" />
            <div class="types small">
              @for (t of typeRows(); track t.key) { <span><span class="badge" [class]="'type-' + t.key.slice(0, 2)">{{ t.key.replace('_', ' ') }}</span> {{ t.value }}</span> }
            </div>
          </section>

          <section class="card">
            <div class="card-head"><h2>Sprint burndown</h2>
              @if (d.activeSprint; as b) { <span class="small muted">{{ b.sprint.name }} · {{ b.itemsDone }}/{{ b.items }} items done</span> }</div>
            @if (d.activeSprint; as b) {
              <app-burndown [points]="b.actual" [start]="b.sprint.start" [end]="b.sprint.end" [committed]="b.committed" />
              <p class="small muted">{{ b.sprint.goal }}</p>
            } @else { <div class="empty">No active sprint. <a routerLink="/sprints">Start one</a> to see the burndown.</div> }
          </section>

          <section class="card">
            <div class="card-head"><h2>Stage flow <span class="tip" data-tip="Items currently in each stage, and average days from start to gate approval.">?</span></h2></div>
            <table class="data flow">
              <thead><tr><th>Stage</th><th class="right">In progress</th><th class="right">In review</th><th class="right">Approved</th><th class="right">Avg days</th></tr></thead>
              <tbody>
                @for (s of d.stageFlow; track s.stageId) {
                  <tr><td><b>{{ s.gate }}</b> {{ s.name }}</td><td class="right">{{ s.inProgress || '' }}</td>
                    <td class="right">@if (s.inReview) { <span class="badge warning">{{ s.inReview }}</span> }</td>
                    <td class="right">{{ s.approved }}</td><td class="right">{{ s.avgDays || '–' }}</td></tr>
                }
              </tbody>
            </table>
          </section>

          <section class="card">
            <div class="card-head"><h2>Traceability coverage</h2><a class="small" routerLink="/traceability">Open matrix →</a></div>
            <div class="meter" role="img" [attr.aria-label]="covOk() + ' complete, ' + covGap() + ' with gaps'">
              <span class="ok" [style.flex]="covOk() || 0.0001"></span><span class="gap" [style.flex]="covGap() || 0.0001"></span>
            </div>
            <div class="row small"><span class="badge good">✓ Complete {{ covOk() }}</span><span class="badge critical">! Gaps {{ covGap() }}</span>
              <span class="muted">Complete = linked to code and tests with a passing result.</span></div>
            <h3 class="sub">Gate decisions</h3>
            <div class="gates">
              @for (g of d.gates; track g.gate) {
                <div class="gate" [attr.data-tip]="g.approved + ' approved, ' + g.rejected + ' rejected, ' + g.withConditions + ' with conditions'">
                  <b>{{ g.gate }}</b><span>{{ g.approved }}</span>@if (g.rejected) { <span class="badge critical">{{ g.rejected }} ✕</span> }
                </div>
              }
            </div>
            <div class="row small sub">
              <span class="muted">AI usage on stages:</span>
              @for (a of aiRows(); track a.key) { <span class="badge">{{ a.key === 'NONE' ? 'Manual' : a.key.replace('_', '-') }} {{ a.value }}</span> }
              @for (m of missedRows(); track m.key) { <span class="badge serious" data-tip="Defects whose root cause analysis says this gate should have caught them">Escaped {{ m.key }}: {{ m.value }}</span> }
            </div>
          </section>

          <section class="card">
            <div class="card-head"><h2>Waiting for a gate decision</h2><a class="small" routerLink="/approvals">All approvals →</a></div>
            @for (a of d.pendingApprovals.slice(0, 6); track a.key + a.stageId) {
              <a class="line" [routerLink]="['/work-items', a.key]" [queryParams]="{ stage: a.stageId }">
                <span class="badge" [class]="'type-' + a.type">{{ a.type }}</span><b>{{ a.key }}</b><span class="grow ell">{{ a.title }}</span>
                <span class="badge warning">{{ a.gate }}</span><span class="small muted">{{ roleLabel[a.accountableRole] }}</span>
              </a>
            } @empty { <div class="empty">Nothing waiting.</div> }
            <h3 class="sub">Waivers needing attention</h3>
            @for (w of d.waiversAttention; track w.id) {
              <a class="line" routerLink="/waivers"><b>{{ w.key }}</b><span class="grow ell">{{ w.workItemKey }} {{ w.stageId }} · {{ w.conditions.join(', ') }}</span>
                <span class="badge" [class]="tone(w.status)">{{ human(w.status) }}</span><span class="small muted">to {{ w.expiry }}</span></a>
            } @empty { <div class="small muted">None.</div> }
          </section>

          <section class="card">
            <div class="card-head"><h2>Recent builds</h2><a class="small" routerLink="/integrations">Integrations →</a></div>
            @for (b of d.recentBuilds; track b.job + b.number) {
              <div class="line"><span class="badge" [class]="tone(b.status)">{{ b.status }}</span><span class="mono">{{ b.job }} #{{ b.number }}</span>
                <a [routerLink]="['/work-items', b.workItem]">{{ b.workItem }}</a><span class="grow"></span><span class="small muted">{{ b.at | date: 'd MMM, HH:mm' }}</span></div>
            } @empty { <div class="empty">No builds reported yet. Point Jenkins at the CI webhook.</div> }
            <h3 class="sub">Recent activity</h3>
            @for (e of d.recentActivity.slice(0, 8); track e.id) {
              <div class="act small"><span class="muted nowrap">{{ e.at | date: 'd MMM HH:mm' }}</span><b>{{ ctx.userName(e.actor) }}</b><span class="ell">{{ e.summary }}</span></div>
            }
          </section>
        </div>
      } @else if (!err()) { <div class="empty">Loading…</div> }
      @if (err()) { <div class="callout bad">{{ err() }}</div> }
    </div>`,
  styles: [`
    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .kpi { padding: 12px 14px; border-top: 3px solid var(--border-strong); }
    .kpi.good { border-top-color: var(--good); } .kpi.warn { border-top-color: var(--warning); } .kpi.bad { border-top-color: var(--critical); }
    .kl { font-size: 12px; color: var(--text-secondary); font-weight: 600; }
    .kv { font-size: 26px; font-weight: 700; margin: 2px 0; font-variant-numeric: tabular-nums; }
    .kh { color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .types { display: flex; gap: 14px; margin-top: 12px; flex-wrap: wrap; }
    .flow td, .flow th { padding: 5px 8px; }
    .meter { display: flex; gap: 2px; height: 14px; margin: 6px 0 8px; }
    .meter .ok { background: var(--good); border-radius: 4px 0 0 4px; } .meter .gap { background: var(--critical); border-radius: 0 4px 4px 0; }
    .sub { margin-top: 16px; }
    .gates { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
    .gate { display: flex; gap: 6px; align-items: center; justify-content: center; padding: 6px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface-2); font-size: 12px; }
    .line { display: flex; gap: 8px; align-items: center; padding: 6px 4px; border-bottom: 1px solid var(--border); color: inherit; text-decoration: none; min-width: 0; }
    a.line:hover { background: var(--surface-2); text-decoration: none; }
    .ell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
    .act { display: grid; grid-template-columns: 90px 110px 1fr; gap: 8px; padding: 4px 0; border-bottom: 1px dashed var(--border); }
  `],
})
export class DashboardPage {
  private api = inject(Api);
  private toast = inject(ToastService);
  ctx = inject(AppContext);
  roleLabel = ROLE_LABEL; tone = tone; human = human;
  d = signal<Dashboard | null>(null);
  err = signal('');
  total = computed(() => Object.values(this.d()?.byColumn ?? {}).reduce((a, b) => a + b, 0));
  columnRows = computed(() => COLUMNS.map(c => ({ label: human(c), value: this.d()?.byColumn[c] ?? 0, limit: this.d()?.wipLimits[c] || undefined })));
  typeRows = computed(() => Object.entries(this.d()?.byType ?? {}).map(([key, value]) => ({ key, value })));
  aiRows = computed(() => Object.entries(this.d()?.aiUsage ?? {}).map(([key, value]) => ({ key, value })));
  missedRows = computed(() => Object.entries(this.d()?.defectsByMissedGate ?? {}).map(([key, value]) => ({ key, value })));
  covOk = computed(() => this.d()?.rtmCoverage['OK'] ?? 0);
  covGap = computed(() => this.d()?.rtmCoverage['GAP'] ?? 0);

  constructor() { effect(() => { if (this.ctx.project()) this.load(); }); }

  load() {
    const p = this.ctx.project(); if (!p) return;
    this.api.dashboard(p.id).subscribe({ next: d => { this.d.set(d); this.err.set(''); }, error: e => { this.err.set(problem(e).text); this.toast.bad(problem(e).text); } });
  }
}
