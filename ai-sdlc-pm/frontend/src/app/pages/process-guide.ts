import { Component, computed, inject, signal } from '@angular/core';
import { Api, problem } from '../core/api';
import { AppContext } from '../core/context';
import { COLUMN_HELP, ROLE_LABEL, human } from '../core/labels';
import { Column } from '../core/models';
import { ToastService } from '../core/toast';

@Component({
  selector: 'app-process-guide',
  template: `
    <div class="page">
      <div class="page-head"><div><h1>AI SDLC process guide</h1><p>Process {{ ctx.process()?.version }} — the same definition the gates enforce. Templates download as blank Word/Excel files.</p></div></div>
      <div class="flow">
        @for (s of ctx.stages(); track s.id) {
          <button class="node" [class.sel]="sel() === s.id" (click)="sel.set(s.id)"><b>{{ s.gate }}</b><span>{{ s.short }}</span><small>{{ col(s.boardColumn) }}</small></button>
        }
      </div>
      @if (stage(); as s) {
        <div class="grid grid-2">
          <section class="card">
            <h2>{{ s.id }} {{ s.name }}</h2>
            <p>{{ s.purpose }}</p>
            <div class="row small"><span>Board column <b>{{ col(s.boardColumn) }}</b> <span class="tip" [attr.data-tip]="colHelp[s.boardColumn]">?</span></span>
              <span>R <b>{{ roleLabel[s.responsibleRole] }}</b></span><span>A <b>{{ roleLabel[s.accountableRole] }}</b></span>
              @if (s.prerequisites.length) { <span>After {{ s.prerequisites.join(', ') }}</span> }</div>
            <h3>Entry criteria</h3><ul>@for (e of s.entry; track e) { <li>{{ e }}</li> }</ul>
            <h3>Activities</h3>
            <table class="data"><tbody>@for (a of s.activities; track $index) { <tr><td>{{ a.activity }}</td><td class="small">{{ a.performedBy }}</td><td><span class="badge" [attr.data-tip]="modeHelp(a.mode)">{{ a.mode }}</span></td></tr> }</tbody></table>
            <div class="callout small" style="margin-top:12px"><b>AI rule.</b> {{ s.aiRule }}</div>
            <div class="callout good small" style="margin-top:8px"><b>Gate.</b> {{ s.gateText }}</div>
          </section>
          <section class="card">
            <h3>Inputs</h3>
            <table class="data"><tbody>@for (i of s.inputs; track $index) { <tr><td>{{ i.item }}</td><td class="small">{{ i.source }}</td><td><span class="badge">{{ i.mode }}</span></td></tr> }</tbody></table>
            <h3>Outputs</h3>
            <table class="data"><tbody>@for (o of s.outputs; track $index) { <tr><td>{{ o.output }}</td><td class="small">{{ o.template }}</td><td><span class="badge">{{ o.mode }}</span></td></tr> }</tbody></table>
            <h3>Review checklist</h3><ol class="small">@for (c of s.checklist; track c) { <li>{{ c }}</li> }</ol>
            @if (s.automatedChecks.length) { <h3>Automated checks</h3><div class="row">@for (a of s.automatedChecks; track a) { <span class="badge">{{ a }}</span> }</div> }
          </section>
        </div>
      }
      <section class="card lib">
        <h2>Template library</h2>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>ID</th><th>Template</th><th>Purpose</th><th>Stage</th><th>Work types</th><th>Owner</th><th></th></tr></thead>
          <tbody>@for (t of ctx.process()?.templates ?? []; track t.id) {
            <tr><td class="mono"><b>{{ t.id }}</b></td><td>{{ t.name }}</td><td class="small">{{ t.purpose }}</td><td class="small">{{ t.stage }}</td><td class="small">{{ t.workTypes }}</td><td class="small">{{ t.owner }}</td>
              <td><button class="btn sm" (click)="download(t.id)">⤓ Download</button></td></tr>
          }</tbody></table></div>
      </section>
    </div>`,
  styles: [`
    .flow { display: grid; grid-template-columns: repeat(10, minmax(90px, 1fr)); gap: 6px; margin-bottom: 16px; overflow-x: auto; }
    .node { display: flex; flex-direction: column; gap: 2px; padding: 10px 8px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface-1); cursor: pointer; font: inherit; text-align: left; }
    .node b { color: var(--brand-primary); } .node span { font-size: 12px; } .node small { color: var(--text-muted); font-size: 10px; text-transform: uppercase; letter-spacing: .05em; }
    .node.sel { border-color: var(--brand-primary); box-shadow: inset 0 -3px 0 var(--brand-accent); background: var(--brand-primary-soft); }
    h3 { margin-top: 14px; } ul, ol { padding-left: 20px; } .lib { margin-top: 16px; }
  `],
})
export class ProcessGuidePage {
  private api = inject(Api);
  private toast = inject(ToastService);
  ctx = inject(AppContext);
  roleLabel = ROLE_LABEL; colHelp = COLUMN_HELP;
  sel = signal('S0');
  stage = computed(() => this.ctx.stage(this.sel()));
  col(c: Column) { return human(c); }
  modeHelp(m: string) {
    return ({ M: 'Manual: done by a person', 'AI-G': 'AI generates, a person validates', 'AI-A': 'AI assists, a person writes', AUTO: 'Automated tool or pipeline', 'AI-X': 'AI not permitted' } as Record<string, string>)[m] ?? m;
  }
  download(id: string) { this.api.download(this.api.templateUrl(id), id).subscribe({ error: e => this.toast.bad(problem(e).text) }); }
}
