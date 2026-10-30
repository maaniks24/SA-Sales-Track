import { Component, Injectable, inject, signal } from '@angular/core';

export interface Toast { id: number; kind: 'good' | 'bad' | 'info'; text: string; detail?: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private seq = 0;
  good(text: string) { this.push('good', text); }
  info(text: string) { this.push('info', text); }
  bad(text: string, detail?: string) { this.push('bad', text, detail, 9000); }
  dismiss(id: number) { this.toasts.update(t => t.filter(x => x.id !== id)); }
  private push(kind: Toast['kind'], text: string, detail?: string, ms = 4500) {
    const id = ++this.seq;
    this.toasts.update(t => [...t, { id, kind, text, detail }]);
    setTimeout(() => this.dismiss(id), ms);
  }
}

@Component({
  selector: 'app-toasts',
  template: `
    <div class="toasts" aria-live="polite">
      @for (t of svc.toasts(); track t.id) {
        <div class="toast" [class]="t.kind" role="status">
          <div class="grow"><div>{{ t.text }}</div>@if (t.detail) {<div class="small detail">{{ t.detail }}</div>}</div>
          <button class="icon-btn" (click)="svc.dismiss(t.id)" aria-label="Dismiss">✕</button>
        </div>
      }
    </div>`,
  styles: [`
    .toasts { position: fixed; right: 16px; bottom: 16px; display: flex; flex-direction: column; gap: 8px; z-index: 100; width: min(420px, calc(100vw - 32px)); }
    .toast { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border-radius: 8px; background: var(--surface-1); box-shadow: var(--shadow-lg);
      border-left: 4px solid var(--info); }
    .toast.good { border-left-color: var(--good); } .toast.bad { border-left-color: var(--critical); }
    .detail { color: var(--text-secondary); margin-top: 2px; }
  `],
})
export class Toasts { svc = inject(ToastService); }
