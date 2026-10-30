import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api, problem } from '../core/api';
import { AuthService } from '../core/auth';
import { BurndownChart } from '../core/charts';
import { AppContext } from '../core/context';
import { human, tone } from '../core/labels';
import { Burndown, Sprint, WorkItem } from '../core/models';
import { ToastService } from '../core/toast';

@Component({
  selector: 'app-sprints',
  imports: [FormsModule, RouterLink, DatePipe, BurndownChart],
  template: `
    <div class="page">
      <div class="page-head">
        <div><h1>Sprints & backlog</h1><p>Plan time-boxed sprints. Gates still decide when work moves; the sprint decides what the team commits to.</p></div>
        @if (lead()) { <button class="btn primary" (click)="newSprint = blank()">+ New sprint</button> }
      </div>
      <div class="grid layout">
        <div class="stack">
          @for (s of sprints(); track s.id) {
            <section class="card sprint" [class.active]="s.status === 'ACTIVE'">
              <div class="card-head">
                <div><h2>{{ s.name }} <span class="badge" [class]="tone(s.status)">{{ human(s.status) }}</span></h2>
                  <div class="small muted">{{ s.start | date: 'd MMM' }} – {{ s.end | date: 'd MMM y' }} · capacity {{ s.capacity ?? '—' }} pts</div></div>
                <div class="row">
                  @if (lead() && s.status === 'PLANNED') { <button class="btn sm" (click)="start(s)">Start</button> }
                  @if (lead() && s.status === 'ACTIVE') { <button class="btn sm" (click)="close(s)">Close sprint</button> }
                </div>
              </div>
              @if (s.goal) { <p class="goal">🎯 {{ s.goal }}</p> }
              @if (burn()[s.id]; as b) {
                <div class="row small"><span><b>{{ b.completed }}</b> / {{ b.committed }} pts done</span><span><b>{{ b.itemsDone }}</b> / {{ b.items }} items</span>
                  @if (s.capacity && b.committed > s.capacity) { <span class="badge warning">Over capacity by {{ b.committed - s.capacity }} pts</span> }</div>
                @if (s.status !== 'PLANNED' && b.actual.length) { <app-burndown [points]="b.actual" [start]="s.start" [end]="s.end" [committed]="b.committed" /> }
              }
              <table class="data compact">
                <tbody>
                  @for (w of inSprint(s.id); track w.id) {
                    <tr><td class="nowrap"><span class="badge" [class]="'type-' + w.type">{{ w.type }}</span> <a [routerLink]="['/work-items', w.key]">{{ w.key }}</a></td><td>{{ w.title }}</td>
                      <td class="nowrap">{{ human(w.column) }}</td><td class="right">{{ w.storyPoints ?? '–' }}</td>
                      <td>@if (s.status !== 'CLOSED' && w.column !== 'DONE') { <button class="icon-btn" (click)="assign(w, null)" data-tip="Back to backlog">↩</button> }</td></tr>
                  } @empty { <tr><td><div class="empty small">Nothing planned. Assign items from the backlog.</div></td></tr> }
                </tbody>
              </table>
            </section>
          } @empty { <div class="empty">No sprints yet.</div> }
        </div>
        <section class="card backlog">
          <div class="card-head"><h2>Backlog</h2><span class="small muted">{{ backlog().length }} items · {{ backlogPoints() }} pts</span></div>
          @for (w of backlog(); track w.id) {
            <div class="bl">
              <span class="badge" [class]="'type-' + w.type">{{ w.type }}</span>
              <a [routerLink]="['/work-items', w.key]"><b>{{ w.key }}</b></a>
              <span class="grow ell">{{ w.title }}</span>
              <span class="small muted">{{ w.storyPoints ?? '–' }} pts</span>
              @if (openSprints().length) {
                <select (change)="assign(w, $any($event.target).value); $any($event.target).value = ''" aria-label="Add to sprint">
                  <option value="">Add to…</option>@for (s of openSprints(); track s.id) { <option [value]="s.id">{{ s.name }}</option> }</select>
              }
            </div>
          } @empty { <div class="empty small">Backlog is empty.</div> }
        </section>
      </div>
    </div>
    @if (newSprint; as n) {
      <div class="backdrop" (click)="newSprint = null">
        <form class="dialog" (click)="$event.stopPropagation()" (ngSubmit)="create()">
          <h2>New sprint</h2>
          <div class="form-grid">
            <label class="field">Name <input name="n" [(ngModel)]="n.name" required></label>
            <label class="field">Capacity (points) <input name="c" type="number" [(ngModel)]="n.capacity"></label>
            <label class="field">Start <input name="s" type="date" [(ngModel)]="n.start" required></label>
            <label class="field">End <input name="e" type="date" [(ngModel)]="n.end" required></label>
          </div>
          <label class="field" style="margin-top:12px">Goal <input name="g" [(ngModel)]="n.goal" placeholder="One sentence the team commits to"></label>
          <div class="form-actions"><button type="button" class="btn" (click)="newSprint = null">Cancel</button><button class="btn primary">Create</button></div>
        </form>
      </div>
    }`,
  styles: [`
    .layout { grid-template-columns: minmax(0, 1.4fr) minmax(320px, 1fr); align-items: start; }
    @media (max-width: 1100px) { .layout { grid-template-columns: 1fr; } }
    .sprint.active { border-color: var(--brand-primary); box-shadow: 0 0 0 1px var(--brand-primary); }
    .goal { margin: 0 0 8px; }
    table.compact td { padding: 5px 6px; }
    .backlog { position: sticky; top: 60px; max-height: calc(100vh - 80px); overflow: auto; }
    .bl { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--border); min-width: 0; }
    .bl select { min-height: 26px; padding: 2px 4px; font-size: 12px; }
    .ell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  `],
})
export class SprintsPage {
  private api = inject(Api);
  private toast = inject(ToastService);
  private auth = inject(AuthService);
  ctx = inject(AppContext);
  human = human; tone = tone;
  sprints = signal<Sprint[]>([]);
  items = signal<WorkItem[]>([]);
  burn = signal<Record<string, Burndown>>({});
  newSprint: { name: string; goal: string; start: string; end: string; capacity: number | null } | null = null;
  lead = computed(() => this.auth.has('DELIVERY_MANAGER', 'PRODUCT_OWNER', 'TECH_LEAD', 'ARCHITECT'));
  openSprints = computed(() => this.sprints().filter(s => s.status !== 'CLOSED'));
  backlog = computed(() => this.items().filter(w => !w.sprintId && w.column !== 'DONE'));
  backlogPoints = computed(() => this.backlog().reduce((a, w) => a + (w.storyPoints ?? 0), 0));

  constructor() { effect(() => { if (this.ctx.project()) this.load(); }); }

  load() {
    const p = this.ctx.project(); if (!p) return;
    this.api.sprints(p.id).subscribe(s => {
      this.sprints.set(s);
      for (const x of s) this.api.burndown(x.id).subscribe(b => this.burn.update(m => ({ ...m, [x.id]: b })));
    });
    this.api.workItems(p.id).subscribe(i => this.items.set(i));
  }
  inSprint(id: string) { return this.items().filter(w => w.sprintId === id); }
  blank() {
    const d = new Date(), e = new Date(Date.now() + 13 * 86400000), iso = (x: Date) => x.toISOString().slice(0, 10);
    return { name: `Sprint ${this.sprints().length + 14}`, goal: '', start: iso(d), end: iso(e), capacity: 40 as number | null };
  }
  private done(ok: string) { return { next: () => { this.toast.good(ok); this.load(); }, error: (e: unknown) => { const p = problem(e); this.toast.bad(p.text, p.detail); } }; }
  create() { const p = this.ctx.project(); if (p && this.newSprint) { this.api.createSprint(p.id, this.newSprint as Partial<Sprint>).subscribe(this.done('Sprint created.')); this.newSprint = null; } }
  start(s: Sprint) { this.api.startSprint(s.id).subscribe(this.done(`${s.name} started.`)); }
  close(s: Sprint) { if (confirm(`Close ${s.name}? Unfinished items go back to the backlog.`)) this.api.closeSprint(s.id).subscribe(this.done(`${s.name} closed.`)); }
  assign(w: WorkItem, sprintId: string | null) { if (sprintId === '') return; this.api.updateWorkItem(w.key, { sprintId: sprintId ?? '' }).subscribe(this.done(sprintId ? `${w.key} added to the sprint.` : `${w.key} back in the backlog.`)); }
}
