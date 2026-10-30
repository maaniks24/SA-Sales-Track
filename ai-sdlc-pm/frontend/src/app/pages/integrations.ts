import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api, problem } from '../core/api';
import { AuthService } from '../core/auth';
import { AppContext } from '../core/context';
import { tone } from '../core/labels';
import { CommitRecord, Endpoints, IntegrationEvent, Project } from '../core/models';
import { ToastService } from '../core/toast';

@Component({
  selector: 'app-integrations',
  imports: [FormsModule, DatePipe, RouterLink],
  template: `
    <div class="page">
      <div class="page-head"><div><h1>Integrations</h1><p>Source control, Jenkins and Bugzilla feed the work items, the gates and the traceability matrix.</p></div></div>
      @if (cfg; as c) {
      <div class="grid grid-3">
        <section class="card">
          <h2>Source control</h2>
          <p class="small muted">Commits and pull requests are linked when the message, branch or PR title carries the work item key (e.g. <code>{{ ctx.project()?.key }}-12</code>) or a REQ-ID.</p>
          <div class="stack">
            <label class="field">Provider <select [(ngModel)]="c.git.provider" [disabled]="!canEdit()"><option value="GITHUB">GitHub</option><option value="GITLAB">GitLab</option><option value="BITBUCKET">Bitbucket Cloud</option></select></label>
            <label class="field">Repository URL <input [(ngModel)]="c.git.repoUrl" [disabled]="!canEdit()"></label>
            <label class="field">Default branch <input [(ngModel)]="c.git.defaultBranch" [disabled]="!canEdit()"></label>
            <label class="field">Webhook secret {{ ep()?.gitSecretSet ? '(set — leave blank to keep)' : '(not set)' }}<input type="password" [(ngModel)]="c.git.webhookSecret" [disabled]="!canEdit()" autocomplete="new-password"></label>
          </div>
          <div class="endpoint"><span class="small muted">Payload URL (content type application/json)</span><code>{{ ep()?.gitWebhook }}</code><button class="btn sm" (click)="copy(ep()?.gitWebhook)">Copy</button></div>
          <p class="small muted">Events: GitHub <i>push, pull_request</i> · GitLab <i>Push, Merge request</i> · Bitbucket <i>repo:push, pullrequest:*</i>. GitHub/Bitbucket sign with HMAC-SHA256; GitLab sends the secret as X-Gitlab-Token.</p>
        </section>
        <section class="card">
          <h2>Jenkins (CI/CD)</h2>
          <p class="small muted">The pipeline posts each build with its check results; gates G4–G9 read them. Before promoting, the pipeline asks whether the gate is approved.</p>
          <div class="stack">
            <label class="field">Jenkins URL <input [(ngModel)]="c.ci.url" [disabled]="!canEdit()"></label>
            <label class="field">Job name <input [(ngModel)]="c.ci.jobName" [disabled]="!canEdit()"></label>
            <label class="field">CI token (X-CI-Token) {{ ep()?.ciTokenSet ? '(set — leave blank to keep)' : '(not set)' }}<input type="password" [(ngModel)]="c.ci.token" [disabled]="!canEdit()" autocomplete="new-password"></label>
          </div>
          <div class="endpoint"><span class="small muted">Build result webhook (POST)</span><code>{{ ep()?.ciWebhook }}</code><button class="btn sm" (click)="copy(ep()?.ciWebhook)">Copy</button></div>
          <div class="endpoint"><span class="small muted">Gate check (GET)</span><code>{{ ep()?.gateCheck }}</code><button class="btn sm" (click)="copy(ep()?.gateCheck)">Copy</button></div>
          <details><summary class="small">Jenkinsfile snippet</summary><pre>{{ jenkinsfile() }}</pre></details>
        </section>
        <section class="card">
          <h2>Bugzilla</h2>
          <p class="small muted">Issues are tracked in Bugzilla. Link bugs to SR work items, raise new ones, import open bugs as SR defects; status syncs every 15 minutes.</p>
          <div class="stack">
            <label class="row"><input type="checkbox" [(ngModel)]="c.bugzilla.enabled" [disabled]="!canEdit()"> Enabled</label>
            <label class="field">Base URL <input [(ngModel)]="c.bugzilla.baseUrl" placeholder="https://bugzilla.example.com" [disabled]="!canEdit()"></label>
            <div class="form-grid">
              <label class="field">Product <input [(ngModel)]="c.bugzilla.product" [disabled]="!canEdit()"></label>
              <label class="field">Component <input [(ngModel)]="c.bugzilla.component" [disabled]="!canEdit()"></label>
            </div>
            <label class="field">API key {{ ep()?.bugzillaKeySet ? '(set — leave blank to keep)' : '(not set)' }}<input type="password" [(ngModel)]="c.bugzilla.apiKey" [disabled]="!canEdit()" autocomplete="new-password"></label>
            <label class="row small"><input type="checkbox" [(ngModel)]="c.bugzilla.resolveOnClose" [disabled]="!canEdit()"> Resolve linked bugs as FIXED when G9 is approved</label>
            <div class="row"><button class="btn sm" (click)="testBz()">Test connection</button><button class="btn sm" (click)="importBz()">Import open bugs</button></div>
          </div>
        </section>
      </div>
      @if (canEdit()) { <div class="form-actions"><button class="btn primary" (click)="save()">Save integration settings</button></div> }
      }
      <div class="grid grid-2 lower">
        <section class="card">
          <div class="card-head"><h2>Integration events</h2>
            <select [(ngModel)]="source" (change)="loadEvents()" aria-label="Source"><option value="">All sources</option><option>GIT</option><option>CI</option><option>BUGZILLA</option></select></div>
          <div class="table-wrap"><table class="data">
            <thead><tr><th>When</th><th>Source</th><th>Type</th><th>Status</th><th>Summary</th></tr></thead>
            <tbody>
              @for (e of events(); track e.id) { <tr><td class="small nowrap">{{ e.at | date: 'd MMM HH:mm' }}</td><td>{{ e.source }}</td><td>{{ e.type }}</td><td><span class="badge" [class]="tone(e.status)">{{ e.status }}</span></td><td class="small">{{ e.summary }}</td></tr> }
              @empty { <tr><td colspan="5"><div class="empty">No events yet.</div></td></tr> }
            </tbody></table></div>
        </section>
        <section class="card">
          <div class="card-head"><h2>Recent commits</h2><span class="badge" [class]="idRate() >= 95 ? 'good' : 'warning'" data-tip="Share of commits whose message carries a work item key or process ID">ID discipline {{ idRate() }}%</span></div>
          <div class="table-wrap"><table class="data">
            <thead><tr><th>SHA</th><th>Message</th><th>Author</th><th>Linked</th></tr></thead>
            <tbody>
              @for (c of commits(); track c.id) {
                <tr><td class="mono small"><a [href]="c.url" target="_blank" rel="noopener">{{ c.sha.slice(0, 8) }}</a></td><td class="small">{{ c.message }}</td><td class="small">{{ c.author }}</td>
                  <td>@for (k of c.workItemKeys; track k) { <a [routerLink]="['/work-items', k]">{{ k }}</a> } @if (!c.validId) { <span class="badge critical">no ID</span> }</td></tr>
              } @empty { <tr><td colspan="4"><div class="empty">No commits received.</div></td></tr> }
            </tbody></table></div>
        </section>
      </div>
    </div>`,
  styles: [`
    .endpoint { display: grid; grid-template-columns: 1fr auto; gap: 4px 8px; align-items: center; margin-top: 12px; }
    .endpoint span { grid-column: 1 / 3; } .endpoint code { background: var(--surface-2); border: 1px solid var(--border); border-radius: 4px; padding: 5px 7px; font-size: 11px; overflow-wrap: anywhere; }
    pre { font-size: 11px; background: #1d2733; color: #e6edf3; padding: 10px; border-radius: 6px; overflow: auto; }
    details { margin-top: 12px; } .lower { margin-top: 16px; } .lower .table-wrap { max-height: 560px; }
    td a { margin-right: 6px; }
  `],
})
export class IntegrationsPage {
  private api = inject(Api);
  private toast = inject(ToastService);
  private auth = inject(AuthService);
  ctx = inject(AppContext);
  tone = tone;
  cfg: Project['integrations'] | null = null;
  ep = signal<Endpoints | null>(null);
  events = signal<IntegrationEvent[]>([]);
  commits = signal<CommitRecord[]>([]);
  source = '';
  canEdit = computed(() => this.auth.has('ARCHITECT', 'DEVOPS'));
  idRate = computed(() => { const c = this.commits(); return c.length ? Math.round((c.filter(x => x.validId).length * 100) / c.length) : 100; });

  constructor() {
    effect(() => {
      const p = this.ctx.project(); if (!p) return;
      this.cfg = structuredClone(p.integrations);
      this.api.endpoints(p.id).subscribe(e => this.ep.set(e));
      this.api.commits(p.id).subscribe(c => this.commits.set(c));
      this.loadEvents();
    });
  }
  loadEvents() { const p = this.ctx.project(); if (p) this.api.integrationEvents(p.id, this.source || undefined).subscribe(e => this.events.set(e)); }
  copy(t?: string) { if (t) navigator.clipboard?.writeText(t).then(() => this.toast.info('Copied.')); }
  save() {
    const p = this.ctx.project(); if (!p || !this.cfg) return;
    this.api.updateIntegrations(p.id, this.cfg).subscribe({
      next: np => { this.toast.good('Integration settings saved.'); this.ctx.projects.update(l => l.map(x => x.id === np.id ? np : x)); },
      error: e => { const x = problem(e); this.toast.bad(x.text, x.detail); },
    });
  }
  testBz() { const p = this.ctx.project(); if (p) this.api.bugzillaTest(p.id).subscribe({ next: r => r.ok ? this.toast.good(r.message) : this.toast.bad(r.message), error: e => this.toast.bad(problem(e).text) }); }
  importBz() {
    const p = this.ctx.project(); if (!p) return;
    this.api.bugzillaImport(p.id).subscribe({ next: r => { this.toast.good(`Imported ${r.imported} of ${r.found} open bugs.`); this.loadEvents(); }, error: e => { const x = problem(e); this.toast.bad(x.text, x.detail); } });
  }
  jenkinsfile() {
    const e = this.ep(); const key = this.ctx.project()?.key ?? 'KEY';
    return `// Jenkins: credentials id 'aisdlc-ci-token' holds the CI token
def workItem = (env.BRANCH_NAME =~ /${key}-\\d+/) ? (env.BRANCH_NAME =~ /${key}-\\d+/)[0] : ''

post {
  always {
    withCredentials([string(credentialsId: 'aisdlc-ci-token', variable: 'T')]) {
      sh """curl -sf -X POST '${e?.ciWebhook}' \\
        -H 'Content-Type: application/json' -H "X-CI-Token: $T" \\
        -d '{"job":"$JOB_NAME","buildNumber":$BUILD_NUMBER,"status":"\${currentBuild.currentResult}",
             "url":"$BUILD_URL","branch":"$BRANCH_NAME","commit":"$GIT_COMMIT","workItem":"\${workItem}",
             "checks":{"PMD":"PASS","SONAR":"PASS","COVERAGE":"PASS","SECRET_SCAN":"PASS","ID_CHECK":"PASS"}}'"""
    }
  }
}

stage('Gate G8 approved?') {
  steps {
    withCredentials([string(credentialsId: 'aisdlc-ci-token', variable: 'T')]) {
      sh """curl -sf -H "X-CI-Token: $T" \\
        '${(e?.gateCheck ?? '').replace('{KEY}', '${workItem}').replace('{G}', 'G8')}' | grep -q '"allowed":true'"""
    }
  }
}`;
  }
}
