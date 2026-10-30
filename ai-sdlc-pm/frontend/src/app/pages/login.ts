import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Api, problem } from '../core/api';
import { AuthService } from '../core/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="wrap">
      <section class="intro">
        <div class="logo">◆ AI SDLC Workbench</div>
        <h1>Every stage, every gate, every document — in one place.</h1>
        <ul>
          <li>Kanban board guarded by the ten AI SDLC gates (G0–G9)</li>
          <li>Checklists, AI usage declarations and separation of duties</li>
          <li>Versioned input and output documents for each stage</li>
          <li>Git, Jenkins and Bugzilla linked to the traceability matrix</li>
        </ul>
      </section>
      <form class="card login" (ngSubmit)="submit()">
        <h2>Sign in</h2>
        @if (reason) { <div class="callout warn small">Your session ended. Sign in again to continue.</div> }
        @if (error()) { <div class="callout bad small" role="alert">{{ error() }}</div> }
        <label class="field">User name <input name="u" [(ngModel)]="username" autocomplete="username" required autofocus></label>
        <label class="field">Password <input name="p" type="password" [(ngModel)]="password" autocomplete="current-password" required></label>
        <button class="btn primary" [disabled]="busy() || !username || !password">{{ busy() ? 'Signing in…' : 'Sign in' }}</button>
        <p class="small muted">Demo: <code>admin</code>, <code>ravi.ba</code>, <code>kiran.tl</code>, <code>lakshmi.qa</code>, <code>nandini.dm</code> … password <code>Demo&#64;2026</code></p>
      </form>
    </div>`,
  styles: [`
    .wrap { min-height: 100vh; display: grid; grid-template-columns: 1.1fr 1fr; background: var(--surface-0); }
    .intro { background: var(--brand-primary); color: var(--brand-on-primary); padding: 10vh 8vw; display: flex; flex-direction: column; justify-content: center; }
    .intro h1 { color: inherit; font-size: 1.9rem; margin: 18px 0; max-width: 520px; }
    .intro ul { padding-left: 18px; line-height: 1.9; opacity: .9; }
    .logo { color: var(--brand-accent); font-weight: 700; letter-spacing: .04em; }
    .login { align-self: center; justify-self: center; width: min(380px, 90vw); display: flex; flex-direction: column; gap: 14px; padding: 28px; }
    .login .btn { height: 38px; justify-content: center; }
    @media (max-width: 800px) { .wrap { grid-template-columns: 1fr; } .intro { padding: 32px 24px; } }
  `],
})
export class Login {
  private api = inject(Api);
  private auth = inject(AuthService);
  private router = inject(Router);
  reason = inject(ActivatedRoute).snapshot.queryParamMap.get('reason');
  username = '';
  password = '';
  busy = signal(false);
  error = signal('');

  submit() {
    this.busy.set(true); this.error.set('');
    this.api.login(this.username.trim(), this.password).subscribe({
      next: s => { this.auth.set(s); this.router.navigateByUrl('/dashboard'); },
      error: e => { this.busy.set(false); this.error.set(e.status === 401 ? 'User name or password is wrong.' : problem(e).text); },
    });
  }
}
