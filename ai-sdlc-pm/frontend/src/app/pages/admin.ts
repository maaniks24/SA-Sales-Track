import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api, problem } from '../core/api';
import { AuthService } from '../core/auth';
import { AppContext } from '../core/context';
import { COLUMNS, ROLES, ROLE_LABEL, human } from '../core/labels';
import { Project, Role, UserView } from '../core/models';
import { ToastService } from '../core/toast';

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="page-head"><div><h1>Administration</h1><p>Users and their process roles decide who may act on each stage and who may sign each gate.</p></div></div>
      <div class="tabs"><button [class.active]="tab() === 'users'" (click)="tab.set('users')">Users & roles</button><button [class.active]="tab() === 'projects'" (click)="tab.set('projects')">Projects</button></div>
      @if (tab() === 'users') {
        <div class="row" style="margin-bottom:12px"><span class="grow"></span>@if (isAdmin()) { <button class="btn primary" (click)="openUser()">+ New user</button> }</div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Name</th><th>User name</th><th>Email</th><th>Roles</th><th>Status</th><th></th></tr></thead>
          <tbody>@for (u of ctx.users(); track u.id) {
            <tr><td><b>{{ u.fullName }}</b></td><td class="mono">{{ u.username }}</td><td class="small">{{ u.email }}</td>
              <td>@for (r of u.roles; track r) { <span class="badge">{{ roleLabel[r] }}</span> }</td>
              <td><span class="badge" [class.good]="u.active" [class.critical]="!u.active">{{ u.active ? 'Active' : 'Disabled' }}</span></td>
              <td>@if (isAdmin()) { <button class="btn sm" (click)="openUser(u)">Edit</button> }</td></tr>
          }</tbody></table></div>
      } @else {
        <div class="row" style="margin-bottom:12px"><span class="grow"></span>@if (canProject()) { <button class="btn primary" (click)="openProject()">+ New project</button> }</div>
        <div class="grid grid-2">
          @for (p of ctx.projects(); track p.id) {
            <section class="card">
              <div class="card-head"><h2>{{ p.key }} · {{ p.name }}</h2>@if (canProject()) { <button class="btn sm" (click)="openProject(p)">Edit</button> }</div>
              <p class="small muted">{{ p.description }}</p>
              <div class="row small"><span>Modules: <b>{{ p.modules.join(', ') }}</b></span><span>Surfaces: <b>{{ p.surfaces.join(', ') }}</b></span></div>
              <div class="row small" style="margin-top:6px"><span>Release <b>{{ p.currentRelease || '—' }}</b></span><span>Context Pack <b>{{ p.contextPackVersion }}</b></span></div>
              <div class="row small" style="margin-top:6px">WIP limits: @for (c of wipCols; track c) { <span class="badge">{{ human(c) }} {{ p.wipLimits[c] ?? '–' }}</span> }</div>
            </section>
          }
        </div>
      }
    </div>
    @if (user; as u) {
      <div class="backdrop" (click)="user = null">
        <form class="dialog" (click)="$event.stopPropagation()" (ngSubmit)="saveUser()">
          <h2>{{ u.id ? 'Edit ' + u.username : 'New user' }}</h2>
          <div class="form-grid">
            <label class="field">Full name <input name="fn" [(ngModel)]="u.fullName" required></label>
            <label class="field">User name <input name="un" [(ngModel)]="u.username" [readonly]="!!u.id" required></label>
            <label class="field">Email <input name="em" type="email" [(ngModel)]="u.email"></label>
            @if (!u.id) { <label class="field">Initial password <input name="pw" type="password" [(ngModel)]="u.password" required minlength="8" autocomplete="new-password"></label> }
            @else { <label class="row"><input type="checkbox" name="ac" [(ngModel)]="u.active"> Active</label> }
          </div>
          <h3 style="margin-top:14px">Roles</h3>
          <div class="roles">@for (r of roles; track r) { <label class="row small"><input type="checkbox" [checked]="u.roles.includes(r)" (change)="toggleRole(u, r)"> {{ roleLabel[r] }}</label> }</div>
          <div class="form-actions"><button type="button" class="btn" (click)="user = null">Cancel</button><button class="btn primary" [disabled]="!u.roles.length">Save</button></div>
        </form>
      </div>
    }
    @if (proj; as p) {
      <div class="backdrop" (click)="proj = null">
        <form class="dialog" (click)="$event.stopPropagation()" (ngSubmit)="saveProject()">
          <h2>{{ p.id ? 'Edit ' + p.key : 'New project' }}</h2>
          <div class="form-grid">
            <label class="field">Key <input name="k" [(ngModel)]="p.key" [readonly]="!!p.id" required placeholder="FAS"></label>
            <label class="field">Name <input name="n" [(ngModel)]="p.name" required></label>
            <label class="field">Modules (comma separated) <input name="m" [(ngModel)]="p.modulesText"></label>
            <label class="field">Surfaces (comma separated) <input name="s" [(ngModel)]="p.surfacesText"></label>
            <label class="field">Current release <input name="r" [(ngModel)]="p.currentRelease"></label>
            <label class="field">Context Pack version <input name="cp" [(ngModel)]="p.contextPackVersion"></label>
          </div>
          <label class="field" style="margin-top:12px">Description <textarea name="d" [(ngModel)]="p.description"></textarea></label>
          <h3 style="margin-top:14px">WIP limits <span class="tip" data-tip="0 = no limit. Moves into a column at its limit are refused.">?</span></h3>
          <div class="form-grid">@for (c of wipCols; track c) { <label class="field">{{ human(c) }} <input type="number" min="0" [name]="'w' + c" [(ngModel)]="p.wipLimits[c]"></label> }</div>
          <div class="form-actions"><button type="button" class="btn" (click)="proj = null">Cancel</button><button class="btn primary">Save</button></div>
        </form>
      </div>
    }`,
  styles: [`.roles { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 6px; }`],
})
export class AdminPage {
  private api = inject(Api);
  private toast = inject(ToastService);
  private auth = inject(AuthService);
  ctx = inject(AppContext);
  roleLabel = ROLE_LABEL; roles = ROLES; human = human;
  wipCols = COLUMNS.filter(c => c !== 'BACKLOG' && c !== 'DONE');
  tab = signal<'users' | 'projects'>('users');
  isAdmin = computed(() => this.auth.user()?.roles.includes('ADMIN') ?? false);
  canProject = computed(() => this.auth.has('ARCHITECT', 'DELIVERY_MANAGER'));
  user: (Partial<UserView> & { roles: Role[]; password?: string; active?: boolean }) | null = null;
  proj: (Partial<Project> & { modulesText: string; surfacesText: string; wipLimits: Record<string, number | undefined> }) | null = null;

  openUser(u?: UserView) { this.user = u ? { ...u, roles: [...u.roles] } : { username: '', fullName: '', email: '', password: '', roles: [], active: true }; }
  toggleRole(u: { roles: Role[] }, r: Role) { u.roles = u.roles.includes(r) ? u.roles.filter(x => x !== r) : [...u.roles, r]; }
  private h(ok: string, after: () => void) { return { next: () => { this.toast.good(ok); after(); this.ctx.load(); }, error: (e: unknown) => { const p = problem(e); this.toast.bad(p.text, p.detail); } }; }
  saveUser() {
    const u = this.user!;
    const obs = u.id ? this.api.updateUser(u.id, { fullName: u.fullName!, email: u.email, roles: u.roles, active: u.active ?? true })
      : this.api.createUser({ username: u.username!, fullName: u.fullName!, email: u.email, password: u.password!, roles: u.roles });
    obs.subscribe(this.h('User saved.', () => this.user = null));
  }
  openProject(p?: Project) {
    this.proj = p ? { ...p, modulesText: p.modules.join(', '), surfacesText: p.surfaces.join(', '), wipLimits: { ...p.wipLimits } }
      : { key: '', name: '', description: '', modulesText: '', surfacesText: 'WEB, MOBILE, API', currentRelease: '', contextPackVersion: 'CP v1.0', wipLimits: { INTAKE: 10, DEFINE: 6, BUILD: 8, TEST: 6, RELEASE: 4 } };
  }
  saveProject() {
    const p = this.proj!;
    const split = (s: string) => s.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
    const body: Partial<Project> = { key: p.key, name: p.name, description: p.description, modules: split(p.modulesText), surfaces: split(p.surfacesText),
      currentRelease: p.currentRelease, contextPackVersion: p.contextPackVersion, wipLimits: p.wipLimits };
    (p.id ? this.api.updateProject(p.id, body) : this.api.createProject(body)).subscribe(this.h('Project saved.', () => this.proj = null));
  }
}
