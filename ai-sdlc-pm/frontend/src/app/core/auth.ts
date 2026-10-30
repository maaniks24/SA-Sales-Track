import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { LoginResponse, Role, UserView } from './models';

const KEY = 'aisdlc.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  readonly session = signal<LoginResponse | null>(this.restore());
  readonly user = computed<UserView | null>(() => this.session()?.user ?? null);
  readonly token = computed(() => this.session()?.token ?? null);

  set(s: LoginResponse) { this.session.set(s); try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode */ } }
  logout(reason?: string) {
    this.session.set(null);
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    this.router.navigate(['/login'], { queryParams: reason ? { reason } : {} });
  }
  has(...roles: Role[]) { const u = this.user(); return !!u && (u.roles.includes('ADMIN') || roles.some(r => u.roles.includes(r))); }

  private restore(): LoginResponse | null {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) ?? 'null') as LoginResponse | null;
      return s && new Date(s.expiresAt).getTime() > Date.now() ? s : null;
    } catch { return null; }
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const t = auth.token();
  const r = t && req.url.startsWith('/api') ? req.clone({ setHeaders: { Authorization: `Bearer ${t}` } }) : req;
  return next(r).pipe(catchError((e: HttpErrorResponse) => {
    if (e.status === 401 && !req.url.endsWith('/auth/login')) auth.logout('expired');
    return throwError(() => e);
  }));
};

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.session() ? true : inject(Router).createUrlTree(['/login']);
};
