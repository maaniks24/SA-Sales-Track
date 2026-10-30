import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api, problem } from '../core/api';
import { AuthService } from '../core/auth';
import { AppContext } from '../core/context';
import { AI_LABEL, CONDITION_HELP, ROLE_LABEL, STATUS_LABEL, STATUS_TONE, TYPE_LABEL, human, tone } from '../core/labels';
import { AuditEvent, DocumentRecord, DocumentsView, GateEvaluation, Sprint, StageDef, StageState, WorkItem } from '../core/models';
import { ToastService } from '../core/toast';

type Tab = 'stage' | 'code' | 'bugs' | 'reqs' | 'activity';

@Component({
  selector: 'app-work-item-detail',
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './work-item-detail.html',
  styleUrl: './work-item-detail.scss',
})
export class WorkItemDetailPage {
  key = input.required<string>();
  stage = input<string>();                       // ?stage=S4 deep link
  private api = inject(Api);
  private toast = inject(ToastService);
  private router = inject(Router);
  auth = inject(AuthService);
  ctx = inject(AppContext);
  human = human; tone = tone; statusLabel = STATUS_LABEL; statusTone = STATUS_TONE; roleLabel = ROLE_LABEL; aiLabel = AI_LABEL; condHelp = CONDITION_HELP; typeLabel = TYPE_LABEL;

  w = signal<WorkItem | null>(null);
  docs = signal<DocumentsView>({ documents: [], inputs: [] });
  gate = signal<GateEvaluation | null>(null);
  activity = signal<AuditEvent[]>([]);
  sprints = signal<Sprint[]>([]);
  selected = signal('S0');
  tab = signal<Tab>('stage');
  busy = signal(false);
  openVersions = signal<string | null>(null);

  def = computed<StageDef | undefined>(() => this.ctx.stage(this.selected()));
  st = computed<StageState | undefined>(() => this.w()?.stages[this.selected()]);
  stageDocs = computed(() => this.docs().documents.filter(d => d.stageId === this.selected()));
  /** Inputs from earlier stages, leaving out templates whose producing stages are all not applicable to this item. */
  stageInputs = computed(() => this.docs().inputs.filter(i => {
    if (i.stageId !== this.selected()) return false;
    if (i.source) return true;
    const producers = Object.entries((this.ctx.process()?.docMap?.[i.templateId] ?? {}) as Record<string, string>).filter(([, v]) => v === 'P').map(([k]) => k);
    return !producers.length || producers.some(st => this.w()?.stages[st]?.status !== 'SKIPPED');
  }));
  required = computed(() => { const w = this.w(), d = this.def(); return w && d ? d.requiredDocs[this.wtKey(w)] ?? [] : []; });
  checkedCount = computed(() => this.st()?.checklist.filter(c => c.checked).length ?? 0);
  outputTemplates = computed(() => {
    const ids = new Set<string>([...this.required(), 'T11']);
    for (const o of this.def()?.outputs ?? []) for (const m of o.template.match(/\b[TX]\d\d\b/g) ?? []) ids.add(m);
    return [...ids].sort();
  });
  editable = computed(() => this.st()?.status === 'IN_PROGRESS');
  canDecide = computed(() => { const d = this.def(); return !!d && this.auth.has(d.accountableRole); });

  ai = { aiUsage: 'NONE', aiOperator: '', unresolved: 0 };
  upload = { templateId: '', title: '', direction: 'OUTPUT', comment: '', file: null as File | null };
  decision = { decision: 'APPROVED', comment: '', reviewer: '' };
  skip = { open: false, reason: '' };
  edit: Record<string, unknown> | null = null;
  bugId: number | null = null;
  reqId = '';

  constructor() {
    effect(() => { const k = this.key(); if (k) this.load(true); });
  }

  wtKey(w: WorkItem) { return w.type === 'SR' ? (w.srKind === 'SERVICE' ? 'SR_SERVICE' : 'SR_DEFECT') : w.type; }

  load(first = false) {
    this.api.workItem(this.key()).subscribe({
      next: w => {
        this.w.set(w);
        if (first) {
          const pick = this.stage() ?? Object.values(w.stages).find(s => s.status === 'IN_REVIEW' || s.status === 'IN_PROGRESS')?.stageId ?? 'S0';
          this.select(pick, false);
          if (!this.sprints().length) this.api.sprints(w.projectId).subscribe(s => this.sprints.set(s));
        } else { this.syncForms(); this.loadGate(); }
      },
      error: e => this.toast.bad(problem(e).text),
    });
    this.api.documents(this.key()).subscribe(d => this.docs.set(d));
    this.api.activity(this.key()).subscribe(a => this.activity.set(a));
  }

  select(id: string, nav = true) {
    this.selected.set(id);
    this.tab.set('stage');
    this.syncForms();
    this.loadGate();
    if (nav) this.router.navigate([], { queryParams: { stage: id }, replaceUrl: true });
  }

  private syncForms() {
    const s = this.st();
    this.ai = { aiUsage: s?.aiUsage ?? 'NONE', aiOperator: s?.aiOperator ?? '', unresolved: s?.unresolvedAssumptions ?? 0 };
    this.upload = { templateId: this.required().find(t => !this.stageDocs().some(d => d.templateId === t && d.baselined)) ?? '', title: '', direction: 'OUTPUT', comment: '', file: null };
    this.decision = { decision: 'APPROVED', comment: '', reviewer: '' };
  }

  loadGate() { this.api.gate(this.key(), this.selected()).subscribe({ next: g => this.gate.set(g), error: () => this.gate.set(null) }); }

  private run<T>(obs: import('rxjs').Observable<T>, ok: string, after?: (v: T) => void) {
    this.busy.set(true);
    obs.subscribe({
      next: v => { this.busy.set(false); if (ok) this.toast.good(ok); after?.(v); this.load(); },
      error: e => { this.busy.set(false); const p = problem(e); this.toast.bad(p.text, p.detail); this.loadGate(); },
    });
  }

  start() { this.run(this.api.startStage(this.key(), this.selected()), `${this.selected()} started.`); }
  toggleCheck(i: number, checked: boolean, evidence?: string) { this.run(this.api.check(this.key(), this.selected(), i, checked, evidence), ''); }
  saveAi() {
    this.run(this.api.aiUsage(this.key(), this.selected(), this.ai.aiUsage, this.ai.aiUsage === 'NONE' ? null : this.ai.aiOperator, this.ai.unresolved || 0), 'AI usage recorded.');
  }
  setApplicable(applicable: boolean) {
    this.run(this.api.applicability(this.key(), this.selected(), applicable, this.skip.reason), applicable ? 'Stage made applicable.' : 'Stage marked not applicable.', () => this.skip = { open: false, reason: '' });
  }
  submit() { this.run(this.api.submit(this.key(), this.selected()), `${this.def()?.gate} submitted for review.`); }
  decide() {
    const d = this.decision;
    this.run(this.api.decide(this.key(), this.selected(), d.decision, d.comment, d.reviewer), `${this.def()?.gate} ${human(d.decision).toLowerCase()}.`);
  }

  pick(ev: Event) { this.upload.file = (ev.target as HTMLInputElement).files?.[0] ?? null; }
  doUpload(form: HTMLFormElement) {
    const u = this.upload; if (!u.file) return;
    this.run(this.api.upload(this.key(), this.selected(), u.file, { templateId: u.templateId || undefined, title: u.title || undefined, direction: u.direction, comment: u.comment || undefined }),
      `${u.file.name} uploaded.`, () => form.reset());
  }
  baseline(d: DocumentRecord) { this.run(this.api.baseline(d.id), `${d.title} baselined.`); }
  download(d: DocumentRecord, version: string) {
    const v = d.versions.find(x => x.version === version);
    this.api.download(this.api.docFileUrl(d.id, version), v?.fileName ?? d.title).subscribe({ error: e => this.toast.bad(problem(e).text) });
  }
  template(id: string) { this.api.download(this.api.templateUrl(id), id).subscribe({ error: e => this.toast.bad(problem(e).text) }); }
  docFor(t: string) { return this.stageDocs().find(d => d.templateId === t); }
  tplName(id: string) { return this.ctx.template(id)?.name ?? id; }

  openEdit() {
    const w = this.w()!;
    this.edit = { title: w.title, description: w.description ?? '', module: w.module ?? '', priority: w.priority, severity: w.severity ?? '', crClass: w.crClass ?? '',
      assigneeId: w.assigneeId ?? '', storyPoints: w.storyPoints ?? null, sprintId: w.sprintId ?? '', missedGate: w.missedGate ?? '' };
  }
  saveEdit() {
    const e = this.edit!;
    this.run(this.api.updateWorkItem(this.key(), { ...e }), 'Saved.', () => this.edit = null);
  }

  linkBug() { if (this.bugId) this.run(this.api.bugLink(this.key(), this.bugId), `Bug ${this.bugId} linked.`, () => this.bugId = null); }
  unlinkBug(id: number) { this.run(this.api.bugUnlink(this.key(), id), `Bug ${id} unlinked.`); }
  createBug() { this.run(this.api.bugCreate(this.key()), 'Bug raised in Bugzilla.'); }
  refreshBugs() { this.run(this.api.bugRefresh(this.key()), 'Bug status refreshed.'); }
  linkReq() { if (this.reqId.trim()) this.run(this.api.linkRequirement(this.key(), this.reqId.trim()), `${this.reqId.trim().toUpperCase()} linked.`, () => this.reqId = ''); }
  unlinkReq(r: string) { this.run(this.api.unlinkRequirement(this.key(), r), `${r} unlinked.`); }

  stageList() { return this.ctx.stages().map(d => ({ d, s: this.w()?.stages[d.id] })); }
  checks(b: { checks: Record<string, string> }) { return Object.entries(b.checks ?? {}); }
  latestBuilds() { return [...(this.w()?.builds ?? [])].reverse(); }
}
