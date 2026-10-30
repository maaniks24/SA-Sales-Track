import { Component, computed, input, signal } from '@angular/core';
import { BurnPoint } from './models';

/** Horizontal bars, one series. Value labels sit at the bar end in text ink; optional limit tick per row. */
@Component({
  selector: 'app-hbars',
  template: `
    <div class="bars" role="table" [attr.aria-label]="label()">
      @for (r of rows(); track r.label) {
        <div class="r" role="row" (mouseenter)="hover.set(r.label)" (mouseleave)="hover.set(null)" [class.dim]="hover() && hover() !== r.label">
          <span class="l" role="rowheader">{{ r.label }}</span>
          <span class="track" role="cell">
            <span class="fill" [style.width.%]="pct(r.value)"></span>
            @if (r.limit) { <span class="limit" [style.left.%]="pct(r.limit)" [attr.data-tip]="'WIP limit ' + r.limit"></span> }
          </span>
          <span class="v" role="cell">{{ r.value }}@if (r.limit) {<span class="muted"> / {{ r.limit }}</span>}
            @if (r.limit && r.value > r.limit) { <span class="badge critical" title="Over the work-in-progress limit">over</span> }</span>
        </div>
      }
    </div>`,
  styles: [`
    .bars { display: flex; flex-direction: column; gap: 6px; }
    .r { display: grid; grid-template-columns: 78px 1fr 84px; align-items: center; gap: 8px; font-size: 12px; transition: opacity .15s; }
    .r.dim { opacity: .45; }
    .l { color: var(--text-secondary); font-weight: 600; }
    .track { position: relative; height: 14px; }
    .fill { position: absolute; left: 0; top: 0; bottom: 0; background: var(--series-1); border-radius: 0 4px 4px 0; min-width: 2px; }
    .limit { position: absolute; top: -3px; bottom: -3px; width: 2px; background: var(--text-primary); }
    .v { font-variant-numeric: tabular-nums; display: flex; gap: 4px; align-items: center; }
  `],
})
export class HBars {
  rows = input.required<{ label: string; value: number; limit?: number }[]>();
  label = input('Bar chart');
  hover = signal<string | null>(null);
  max = computed(() => Math.max(1, ...this.rows().map(r => Math.max(r.value, r.limit ?? 0))));
  pct(v: number) { return (v / this.max()) * 100; }
}

/** Sprint burndown: ideal line (dashed, muted) and actual remaining points (series 1), crosshair tooltip on hover. */
@Component({
  selector: 'app-burndown',
  template: `
    <div class="legend small"><span><i class="sw ideal"></i>Ideal</span><span><i class="sw actual"></i>Remaining points</span></div>
    <svg [attr.viewBox]="'0 0 ' + W + ' ' + H" role="img" [attr.aria-label]="'Burndown: ' + (last()?.remaining ?? 0) + ' of ' + committed() + ' points remaining'"
         (mousemove)="move($event)" (mouseleave)="hi.set(-1)">
      @for (t of ticks(); track t) {
        <line class="grid" [attr.x1]="P" [attr.x2]="W - 8" [attr.y1]="y(t)" [attr.y2]="y(t)" />
        <text class="ax" [attr.x]="P - 6" [attr.y]="y(t) + 4" text-anchor="end">{{ t }}</text>
      }
      <line class="ideal" [attr.x1]="x(0)" [attr.y1]="y(committed())" [attr.x2]="x(days() - 1)" [attr.y2]="y(0)" />
      <polyline class="actual" [attr.points]="line()" />
      @for (p of pts(); track $index) { <circle [attr.cx]="x(p.i)" [attr.cy]="y(p.remaining)" r="4" class="dot" /> }
      @if (hi() >= 0 && pts()[hi()]; as p) {
        <line class="cross" [attr.x1]="x(p.i)" [attr.x2]="x(p.i)" [attr.y1]="8" [attr.y2]="H - 22" />
        <circle [attr.cx]="x(p.i)" [attr.cy]="y(p.remaining)" r="6" class="dot hi" />
      }
      <text class="ax" [attr.x]="x(0)" [attr.y]="H - 6">{{ dateLabel(0) }}</text>
      <text class="ax" [attr.x]="x(days() - 1)" [attr.y]="H - 6" text-anchor="end">{{ dateLabel(days() - 1) }}</text>
      @if (last(); as l) { <text class="lab" [attr.x]="x(lastIdx()) + 8" [attr.y]="y(l.remaining) - 6">{{ l.remaining }} left</text> }
    </svg>
    @if (hi() >= 0 && pts()[hi()]; as p) {
      <div class="tt small">{{ p.date }} · <b>{{ p.remaining }}</b> remaining · {{ p.completed }} done</div>
    }`,
  styles: [`
    :host { display: block; position: relative; }
    svg { width: 100%; height: auto; display: block; }
    .grid { stroke: var(--border); stroke-width: 1; }
    .ax { fill: var(--text-muted); font-size: 11px; }
    .lab { fill: var(--text-primary); font-size: 12px; font-weight: 600; }
    .ideal { stroke: var(--series-muted); stroke-width: 2; stroke-dasharray: 5 4; }
    .actual { fill: none; stroke: var(--series-1); stroke-width: 2; stroke-linejoin: round; }
    .dot { fill: var(--series-1); stroke: var(--surface-1); stroke-width: 2; } .dot.hi { stroke-width: 2; }
    .cross { stroke: var(--text-muted); stroke-width: 1; }
    .legend { display: flex; gap: 14px; color: var(--text-secondary); margin-bottom: 4px; }
    .sw { display: inline-block; width: 16px; height: 0; border-top: 2px solid var(--series-1); vertical-align: middle; margin-right: 5px; }
    .sw.ideal { border-top: 2px dashed var(--series-muted); }
    .tt { position: absolute; top: 22px; right: 4px; background: #1d2733; color: #fff; padding: 4px 8px; border-radius: 4px; }
  `],
})
export class BurndownChart {
  points = input.required<BurnPoint[]>();
  start = input.required<string>();
  end = input.required<string>();
  committed = input.required<number>();
  W = 520; H = 200; P = 34;
  hi = signal(-1);
  days = computed(() => Math.max(2, Math.round((Date.parse(this.end()) - Date.parse(this.start())) / 86400000) + 1));
  pts = computed(() => this.points().map(p => ({ ...p, i: Math.round((Date.parse(p.date) - Date.parse(this.start())) / 86400000) })).filter(p => p.i >= 0 && p.i < this.days()));
  last = computed(() => this.pts().at(-1));
  lastIdx = computed(() => this.last()?.i ?? 0);
  ticks = computed(() => { const m = Math.max(1, this.committed()); const s = Math.ceil(m / 4); return [0, s, 2 * s, 3 * s, 4 * s].filter(t => t <= m + s); });
  ymax = computed(() => Math.max(...this.ticks(), 1));
  x(i: number) { return this.P + (i / (this.days() - 1)) * (this.W - this.P - 50); }
  y(v: number) { return 8 + (1 - v / this.ymax()) * (this.H - 30); }
  line() { return this.pts().map(p => `${this.x(p.i)},${this.y(p.remaining)}`).join(' '); }
  dateLabel(i: number) { const d = new Date(Date.parse(this.start()) + i * 86400000); return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }); }
  move(ev: MouseEvent) {
    const svg = ev.currentTarget as SVGSVGElement; const r = svg.getBoundingClientRect();
    const vx = ((ev.clientX - r.left) / r.width) * this.W;
    let best = -1, d = 1e9;
    this.pts().forEach((p, k) => { const dd = Math.abs(this.x(p.i) - vx); if (dd < d) { d = dd; best = k; } });
    this.hi.set(d < 40 ? best : -1);
  }
}
