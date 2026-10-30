import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api, problem } from '../core/api';
import { AuthService } from '../core/auth';
import { KanbanCard } from '../core/card';
import { AppContext } from '../core/context';
import { COLUMNS, COLUMN_HELP, human } from '../core/labels';
import { Card, Column, ColumnView, Sprint } from '../core/models';
import { ToastService } from '../core/toast';

@Component({
  selector: 'app-board',
  imports: [CdkDropListGroup, CdkDropList, CdkDrag, KanbanCard, FormsModule, RouterLink],
  template: `
    <div class="page wide">
      <div class="page-head">
        <div><h1>Kanban board</h1><p>Drag a card right when its gates are approved. Moving left is rework and needs a reason.</p></div>
        <div class="row">
          <input type="search" placeholder="Filter by key, title…" [(ngModel)]="q" aria-label="Filter cards">
          <select [(ngModel)]="type" aria-label="Work type"><option value="">All types</option><option value="NF">New features</option><option value="CR">Change requests</option><option value="SR">Issues / SRs</option></select>
          <select [ngModel]="sprintId()" (ngModelChange)="sprintId.set($event); load()" aria-label="Sprint">
            <option value="">All work</option>@for (s of sprints(); track s.id) { <option [value]="s.id">{{ s.name }}{{ s.status === 'ACTIVE' ? ' (active)' : '' }}</option> }
          </select>
          <label class="row small"><input type="checkbox" [(ngModel)]="mine"> Mine</label>
          <a class="btn primary" routerLink="/work-items" [queryParams]="{ create: 1 }">+ New work item</a>
        </div>
      </div>
      <div class="board" cdkDropListGroup>
        @for (col of columns(); track col.column) {
          <section class="col" [class.over]="col.overLimit">
            <header>
              <b>{{ human(col.column) }}</b>
              <span class="tip" [attr.data-tip]="help[col.column]">?</span>
              <span class="grow"></span>
              <span class="cnt" [class.bad]="col.overLimit" [attr.data-tip]="col.wipLimit ? 'Work-in-progress limit ' + col.wipLimit : 'No WIP limit'">{{ col.count }}{{ col.wipLimit ? ' / ' + col.wipLimit : '' }}</span>
            </header>
            <div class="list" cdkDropList [cdkDropListData]="col.column" (cdkDropListDropped)="drop($event)" [id]="'col-' + col.column">
              @for (c of visible(col.cards); track c.key) {
                <app-card cdkDrag [cdkDragData]="c" [card]="c" />
              } @empty { <div class="none small muted">Drop here</div> }
            </div>
          </section>
        }
      </div>
    </div>
    @if (rework(); as r) {
      <div class="backdrop">
        <form class="dialog" (ngSubmit)="confirmRework()">
          <h2>Move {{ r.card.key }} back to {{ human(r.to) }}?</h2>
          <p class="muted">Moving work back is rework. It is counted on the card and recorded in the audit log.</p>
          <label class="field">Reason <textarea name="reason" [(ngModel)]="reason" required minlength="5" placeholder="What has to be redone and why"></textarea></label>
          <div class="form-actions"><button type="button" class="btn" (click)="rework.set(null)">Cancel</button><button class="btn primary" [disabled]="reason.trim().length < 5">Move back</button></div>
        </form>
      </div>
    }`,
  styles: [`
    .page.wide { max-width: none; }
    .board { display: grid; grid-template-columns: repeat(7, minmax(172px, 1fr)); gap: 12px; overflow-x: auto; padding-bottom: 12px; align-items: start; }
    .col { background: #eaeef3; border-radius: 8px; padding: 8px; min-height: 60vh; display: flex; flex-direction: column; }
    .col.over { background: var(--critical-soft); }
    header { display: flex; align-items: center; gap: 6px; padding: 2px 4px 8px; font-size: 13px; }
    .cnt { font-size: 12px; font-weight: 700; color: var(--text-secondary); background: var(--surface-1); border-radius: 10px; padding: 0 8px; }
    .cnt.bad { color: #fff; background: var(--critical); }
    .list { display: flex; flex-direction: column; gap: 8px; flex: 1; min-height: 120px; }
    .none { border: 1px dashed var(--border-strong); border-radius: 6px; padding: 16px; text-align: center; }
    .cdk-drag-preview { box-shadow: var(--shadow-lg); border-radius: 6px; }
    .cdk-drag-placeholder { opacity: .35; }
    .cdk-drop-list-dragging app-card:not(.cdk-drag-placeholder) { transition: transform 200ms cubic-bezier(0, 0, .2, 1); }
  `],
})
export class BoardPage {
  private api = inject(Api);
  private toast = inject(ToastService);
  private auth = inject(AuthService);
  ctx = inject(AppContext);
  help = COLUMN_HELP; human = human;
  columns = signal<ColumnView[]>([]);
  sprints = signal<Sprint[]>([]);
  sprintId = signal('');
  q = ''; type = ''; mine = false;
  rework = signal<{ card: Card; to: Column; rank: number } | null>(null);
  reason = '';
  active = computed(() => this.sprints().find(s => s.status === 'ACTIVE'));

  constructor() {
    effect(() => {
      const p = this.ctx.project(); if (!p) return;
      this.api.sprints(p.id).subscribe(s => this.sprints.set(s));
      this.load();
    });
  }

  load() { const p = this.ctx.project(); if (p) this.api.board(p.id, this.sprintId() || undefined).subscribe(c => this.columns.set(c)); }

  visible(cards: Card[]) {
    const q = this.q.trim().toLowerCase(); const me = this.auth.user()?.username;
    return cards.filter(c => (!this.type || c.type === this.type) && (!this.mine || c.assigneeId === me)
      && (!q || (c.key + ' ' + c.title + ' ' + (c.processId ?? '')).toLowerCase().includes(q)));
  }

  drop(ev: CdkDragDrop<Column>) {
    const card = ev.item.data as Card;
    const to = ev.container.data;
    const target = this.visible(this.columns().find(c => c.column === to)!.cards).filter(c => c.key !== card.key);
    const before = target[ev.currentIndex - 1], after = target[ev.currentIndex];
    if (to === card.column && ev.previousIndex === ev.currentIndex) return;
    // rank between the neighbours at the drop position (ranks are epoch-millisecond based)
    const rank = before && after ? (before.rank + after.rank) / 2 : before ? before.rank + 1000 : after ? after.rank - 1000 : Date.now();
    if (COLUMNS.indexOf(to) < COLUMNS.indexOf(card.column)) { this.reason = ''; this.rework.set({ card, to, rank }); return; }
    this.doMove(card, to, rank);
  }

  confirmRework() { const r = this.rework(); if (!r) return; this.rework.set(null); this.doMove(r.card, r.to, r.rank, this.reason.trim()); }


  private doMove(card: Card, to: Column, rank: number, reason?: string) {
    this.api.move(card.key, to, rank, reason).subscribe({
      next: () => { if (to !== card.column) this.toast.good(`${card.key} moved to ${human(to)}.`); this.load(); },
      error: e => { const p = problem(e); this.toast.bad(p.text, p.detail); this.load(); },
    });
  }
}
