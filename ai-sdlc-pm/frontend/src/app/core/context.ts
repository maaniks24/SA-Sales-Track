import { Injectable, computed, inject, signal } from '@angular/core';
import { Api } from './api';
import { Project, ProcessDefinition, StageDef, UserView } from './models';

const KEY = 'aisdlc.project';

/** The selected project, the process definition and the user directory, shared by every page. */
@Injectable({ providedIn: 'root' })
export class AppContext {
  private api = inject(Api);
  readonly projects = signal<Project[]>([]);
  readonly projectId = signal<string | null>(this.stored());
  readonly project = computed<Project | null>(() => this.projects().find(p => p.id === this.projectId()) ?? this.projects().at(0) ?? null);
  readonly process = signal<ProcessDefinition | null>(null);
  readonly users = signal<UserView[]>([]);
  readonly stages = computed<StageDef[]>(() => this.process()?.stages ?? []);

  load() {
    this.api.projects().subscribe(p => {
      this.projects.set(p);
      if (!p.some(x => x.id === this.projectId()) && p.length) this.select(p[0].id);
    });
    if (!this.process()) this.api.process().subscribe(d => this.process.set(d));
    this.api.users().subscribe(u => this.users.set(u));
  }
  select(id: string) { this.projectId.set(id); try { localStorage.setItem(KEY, id); } catch { /* ignore */ } }
  stage(id: string) { return this.stages().find(s => s.id === id); }
  template(id: string) { return this.process()?.templates.find(t => t.id === id); }
  userName(username?: string | null) { return username ? this.users().find(u => u.username === username)?.fullName ?? username : '—'; }
  private stored() { try { return localStorage.getItem(KEY); } catch { return null; } }
}
