import { DatePipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../core/api';
import { AppContext } from '../core/context';
import { ROLE_LABEL } from '../core/labels';
import { Approval } from '../core/models';

@Component({
  selector: 'app-approvals',
  imports: [RouterLink, DatePipe, FormsModule],
  template: `
    <div class="page">
      <div class="page-head">
        <div><h1>Approvals</h1><p>Stages submitted for a gate decision. Open one to review the conditions, documents and checklist before deciding.</p></div>
        <label class="row"><input type="checkbox" [ngModel]="mine()" (ngModelChange)="mine.set($event); load()"> Only gates I can decide</label>
      </div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Gate</th><th>Work item</th><th>Stage</th><th>Accountable</th><th>Submitted</th><th>Waiting</th><th></th></tr></thead>
          <tbody>
            @for (a of items(); track a.key + a.stageId) {
              <tr>
                <td><span class="badge warning">{{ a.gate }}</span></td>
                <td><span class="badge" [class]="'type-' + a.type">{{ a.type }}</span> <b>{{ a.key }}</b> {{ a.title }}</td>
                <td>{{ a.stageId }} {{ a.stageName }}</td>
                <td>{{ roleLabel[a.accountableRole] }}</td>
                <td class="nowrap">{{ a.submittedAt | date: 'd MMM, HH:mm' }}</td>
                <td><span class="badge" [class.critical]="age(a) > 3" [class.warning]="age(a) > 1 && age(a) <= 3">{{ age(a) }} d</span></td>
                <td><a class="btn sm primary" [routerLink]="['/work-items', a.key]" [queryParams]="{ stage: a.stageId }">Review</a></td>
              </tr>
            } @empty { <tr><td colspan="7"><div class="empty">Nothing is waiting{{ mine() ? ' for you' : '' }}. 🎉</div></td></tr> }
          </tbody>
        </table>
      </div>
    </div>`,
})
export class ApprovalsPage {
  private api = inject(Api);
  ctx = inject(AppContext);
  roleLabel = ROLE_LABEL;
  items = signal<Approval[]>([]);
  mine = signal(true);
  constructor() { effect(() => { if (this.ctx.project()) this.load(); }); }
  load() { const p = this.ctx.project(); if (p) this.api.approvals(p.id, this.mine()).subscribe(a => this.items.set(a)); }
  age(a: Approval) { return a.submittedAt ? Math.floor((Date.now() - Date.parse(a.submittedAt)) / 86400000) : 0; }
}
