import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppContext } from './context';
import { Card } from './models';

@Component({
  selector: 'app-card',
  imports: [RouterLink],
  template: `
    @let c = card();
    <div class="kc" [class.review]="c.inReview" [class]="'t-' + c.type">
      <div class="top">
        <span class="badge" [class]="'type-' + c.type" [attr.data-tip]="c.type === 'SR' ? (c.srKind === 'SERVICE' ? 'Service request' : 'Defect') : c.type === 'NF' ? 'New feature' : 'Change request'">{{ c.type }}{{ c.srKind === 'SERVICE' ? '·S' : '' }}</span>
        <a class="key" [routerLink]="['/work-items', c.key]" (mousedown)="$event.stopPropagation()">{{ c.key }}</a>
        @if (c.severity) { <span class="badge" [class.critical]="c.severity === 'P1'" [class.warning]="c.severity === 'P2'">{{ c.severity }}</span> }
        <span class="grow"></span>
        @if (c.storyPoints) { <span class="pts" data-tip="Story points">{{ c.storyPoints }}</span> }
      </div>
      <div class="title">{{ c.title }}</div>
      <div class="meta">
        @if (c.activeStage) {
          <span class="badge" [class.warning]="c.inReview" [class.info]="!c.inReview" [attr.data-tip]="c.inReview ? 'Submitted: waiting for the gate decision' : 'Stage in progress'">
            {{ c.activeStage }} {{ c.inReview ? 'review' : '' }}</span>
        }
        <span class="prog" [attr.data-tip]="c.gatesDone + ' of ' + c.gatesTotal + ' applicable gates approved'">
          <span [style.width.%]="c.gatesTotal ? (c.gatesDone / c.gatesTotal) * 100 : 0"></span></span>
        @if (c.readyToMove && c.column !== 'DONE') { <span class="ready" data-tip="All gates for this column are approved: ready to move right">➜</span> }
        @if (c.bugs) { <span class="badge" data-tip="Linked Bugzilla bugs">🐞 {{ c.bugs }}</span> }
        @if (c.reworkCount) { <span class="badge serious" data-tip="Gate rejections or backward moves">↺ {{ c.reworkCount }}</span> }
        <span class="grow"></span>
        <span class="who" [attr.data-tip]="ctx.userName(c.assigneeId)">{{ initials(ctx.userName(c.assigneeId)) }}</span>
      </div>
    </div>`,
  styles: [`
    .kc { background: var(--surface-1); border: 1px solid var(--border); border-left: 3px solid var(--type-nf); border-radius: 6px; padding: 8px 10px; box-shadow: var(--shadow); cursor: grab; }
    .kc.t-CR { border-left-color: var(--type-cr); } .kc.t-SR { border-left-color: var(--type-sr); }
    .kc.review { background: linear-gradient(0deg, var(--warning-soft), var(--surface-1) 60%); }
    .top, .meta { display: flex; align-items: center; gap: 6px; }
    .key { font-weight: 700; font-size: 12px; color: var(--text-primary); }
    .title { margin: 6px 0; font-size: 13px; line-height: 1.35; }
    .pts { font-size: 11px; background: var(--surface-2); border-radius: 9px; padding: 0 6px; font-weight: 700; color: var(--text-secondary); }
    .prog { width: 48px; height: 5px; background: var(--surface-2); border-radius: 3px; overflow: hidden; border: 1px solid var(--border); }
    .prog span { display: block; height: 100%; background: var(--good); }
    .ready { color: var(--good); font-weight: 700; }
    .who { width: 22px; height: 22px; border-radius: 50%; background: var(--brand-primary-soft); color: var(--brand-primary); font-size: 10px; font-weight: 700; display: grid; place-items: center; }
  `],
})
export class KanbanCard {
  card = input.required<Card>();
  ctx = inject(AppContext);
  initials(n: string) { return n === '—' ? '–' : n.split(/[ .]/).map(s => s[0]?.toUpperCase()).slice(0, 2).join(''); }
}
