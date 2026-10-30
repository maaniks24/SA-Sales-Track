import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Api, problem } from '../core/api';
import { AuthService } from '../core/auth';
import { AppContext } from '../core/context';
import { ROLE_LABEL } from '../core/labels';
import { ToastService } from '../core/toast';

interface NavItem { path: string; label: string; icon: string; help: string; }

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <div class="shell" [class.collapsed]="collapsed()">
      <aside class="side">
        <a class="brand" routerLink="/dashboard">
          <span class="logo" aria-hidden="true">◆</span>
          @if (!collapsed()) { <span><b>AI SDLC</b><small>Workbench</small></span> }
        </a>
        <nav>
          @for (group of nav; track group.title) {
            @if (!collapsed()) { <div class="group">{{ group.title }}</div> }
            @for (n of group.items; track n.path) {
              <a [routerLink]="n.path" routerLinkActive="active" [attr.data-tip]="collapsed() ? n.label : null" [title]="n.help">
                <span class="ico" aria-hidden="true">{{ n.icon }}</span>
                @if (!collapsed()) { <span>{{ n.label }}</span> }
                @if (n.path === '/approvals' && pending() > 0) { <span class="count">{{ pending() }}</span> }
              </a>
            }
          }
        </nav>
        <button class="collapse" (click)="collapsed.set(!collapsed())" [attr.aria-label]="collapsed() ? 'Expand menu' : 'Collapse menu'">{{ collapsed() ? '»' : '« Collapse' }}</button>
      </aside>
      <div class="main">
        <header class="top">
          <label class="project">
            <span class="small muted">Project</span>
            <select [ngModel]="ctx.project()?.id" (ngModelChange)="ctx.select($event)" aria-label="Current project">
              @for (p of ctx.projects(); track p.id) { <option [value]="p.id">{{ p.key }} · {{ p.name }}</option> }
            </select>
          </label>
          @if (ctx.project(); as p) {
            <span class="badge info" data-tip="Release the board is working towards">{{ p.currentRelease || 'No release set' }}</span>
            <span class="badge" data-tip="Context Pack version every AI prompt must use">{{ p.contextPackVersion }}</span>
          }
          <span class="grow"></span>
          <a class="btn ghost" routerLink="/process" title="Open the process guide">? Process guide</a>
          <div class="user">
            <button class="btn ghost" (click)="menu.set(!menu())" aria-haspopup="true" [attr.aria-expanded]="menu()">
              <span class="avatar">{{ initials() }}</span> {{ auth.user()?.fullName }} ▾
            </button>
            @if (menu()) {
              <div class="menu" role="menu">
                <div class="small muted">Signed in as <b>{{ auth.user()?.username }}</b></div>
                <div class="roles">@for (r of auth.user()?.roles ?? []; track r) { <span class="badge">{{ roleLabel[r] }}</span> }</div>
                <button class="btn sm" (click)="pwOpen.set(true); menu.set(false)">Change password</button>
                <button class="btn sm" (click)="auth.logout()">Sign out</button>
              </div>
            }
          </div>
        </header>
        <main><router-outlet /></main>
      </div>
    </div>
    @if (pwOpen()) {
      <div class="backdrop" (click)="pwOpen.set(false)">
        <form class="dialog" (click)="$event.stopPropagation()" (ngSubmit)="changePassword()">
          <h2>Change password</h2>
          <div class="stack">
            <label class="field">Current password <input type="password" name="cur" [(ngModel)]="pw.current" required autocomplete="current-password"></label>
            <label class="field">New password (8+ characters) <input type="password" name="next" [(ngModel)]="pw.next" required minlength="8" autocomplete="new-password"></label>
          </div>
          <div class="form-actions"><button type="button" class="btn" (click)="pwOpen.set(false)">Cancel</button><button class="btn primary">Change</button></div>
        </form>
      </div>
    }
  `,
  styles: [`
    .shell { display: grid; grid-template-columns: 232px 1fr; min-height: 100vh; }
    .shell.collapsed { grid-template-columns: 60px 1fr; }
    .side { background: var(--brand-primary); color: var(--brand-on-primary); display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
    .brand { display: flex; align-items: center; gap: 10px; padding: 16px; color: inherit; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,.12); }
    .brand b { display: block; font-size: 15px; letter-spacing: .03em; } .brand small { display: block; opacity: .75; font-size: 11px; }
    .logo { color: var(--brand-accent); font-size: 22px; }
    nav { padding: 8px; flex: 1; }
    .group { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; opacity: .55; padding: 12px 10px 4px; }
    nav a { display: flex; align-items: center; gap: 10px; padding: 7px 10px; border-radius: 6px; color: rgba(255,255,255,.86); text-decoration: none; font-weight: 500; }
    nav a:hover { background: rgba(255,255,255,.08); color: #fff; }
    nav a.active { background: rgba(255,255,255,.14); color: #fff; box-shadow: inset 3px 0 0 var(--brand-accent); }
    .ico { width: 20px; text-align: center; }
    .count { margin-left: auto; background: var(--brand-accent); color: #fff; border-radius: 9px; padding: 0 6px; font-size: 11px; font-weight: 700; }
    .collapse { margin: 8px; background: none; border: 1px solid rgba(255,255,255,.2); color: rgba(255,255,255,.8); border-radius: 6px; padding: 6px; cursor: pointer; font: inherit; }
    .main { min-width: 0; display: flex; flex-direction: column; }
    .top { display: flex; align-items: center; gap: 10px; padding: 8px 20px; background: var(--surface-1); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 20; }
    .project { display: flex; align-items: center; gap: 8px; } .project select { min-width: 240px; font-weight: 600; }
    .user { position: relative; }
    .avatar { display: inline-grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; background: var(--brand-primary-soft); color: var(--brand-primary); font-size: 11px; font-weight: 700; }
    .menu { position: absolute; right: 0; top: 38px; background: var(--surface-1); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow-lg); padding: 12px; width: 260px; display: flex; flex-direction: column; gap: 8px; z-index: 30; }
    .roles { display: flex; flex-wrap: wrap; gap: 4px; }
    @media (max-width: 900px) { .shell { grid-template-columns: 60px 1fr; } .project select { min-width: 140px; } }
  `],
})
export class Shell {
  auth = inject(AuthService);
  ctx = inject(AppContext);
  private api = inject(Api);
  private toast = inject(ToastService);
  private router = inject(Router);
  roleLabel = ROLE_LABEL;
  collapsed = signal(false);
  menu = signal(false);
  pwOpen = signal(false);
  pending = signal(0);
  pw = { current: '', next: '' };
  initials = computed(() => (this.auth.user()?.fullName ?? '?').split(' ').map(s => s[0]).slice(0, 2).join(''));

  nav: { title: string; items: NavItem[] }[] = [
    { title: 'Track', items: [
      { path: '/dashboard', label: 'Dashboard', icon: '▦', help: 'Health of the project at a glance' },
      { path: '/board', label: 'Kanban board', icon: '▥', help: 'Drag work through the process columns; gates guard every move' },
      { path: '/sprints', label: 'Sprints & backlog', icon: '⟳', help: 'Plan sprints, assign backlog items, follow the burndown' },
      { path: '/work-items', label: 'Work items', icon: '☰', help: 'Search and create new features, change requests and issues' },
      { path: '/approvals', label: 'Approvals', icon: '✔', help: 'Gates waiting for your decision' },
    ] },
    { title: 'Govern', items: [
      { path: '/traceability', label: 'Traceability', icon: '⇄', help: 'Requirement → code → test → release matrix' },
      { path: '/waivers', label: 'Waivers', icon: '⚑', help: 'Time-boxed exceptions to gate conditions' },
      { path: '/audit', label: 'Audit & logs', icon: '⌕', help: 'Who did what and when; system errors' },
    ] },
    { title: 'Configure', items: [
      { path: '/integrations', label: 'Integrations', icon: '⚙', help: 'Git, Jenkins and Bugzilla connections and event log' },
      { path: '/process', label: 'Process guide', icon: '📘', help: 'Stages, gates, checklists and templates' },
      { path: '/admin', label: 'Administration', icon: '👤', help: 'Users, roles and projects' },
    ] },
  ];

  constructor() {
    this.ctx.load();
    const tick = () => { const p = this.ctx.project(); if (p) this.api.approvals(p.id, true).subscribe({ next: a => this.pending.set(a.length), error: () => {} }); };
    setTimeout(tick, 800);
    setInterval(tick, 60000);
    this.router.events.subscribe(() => this.menu.set(false));
  }

  changePassword() {
    this.api.changePassword(this.pw.current, this.pw.next).subscribe({
      next: () => { this.toast.good('Password changed.'); this.pwOpen.set(false); this.pw = { current: '', next: '' }; },
      error: e => { const p = problem(e); this.toast.bad(p.text, p.detail); },
    });
  }
}
