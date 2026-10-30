import { Routes } from '@angular/router';
import { authGuard } from './core/auth';
import { Shell } from './layout/shell';
import { Login } from './pages/login';

export const routes: Routes = [
  { path: 'login', component: Login, title: 'Sign in · AI SDLC Workbench' },
  {
    path: '', component: Shell, canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard').then(m => m.DashboardPage), title: 'Dashboard' },
      { path: 'board', loadComponent: () => import('./pages/board').then(m => m.BoardPage), title: 'Board' },
      { path: 'sprints', loadComponent: () => import('./pages/sprints').then(m => m.SprintsPage), title: 'Sprints & backlog' },
      { path: 'work-items', loadComponent: () => import('./pages/work-items').then(m => m.WorkItemsPage), title: 'Work items' },
      { path: 'work-items/:key', loadComponent: () => import('./pages/work-item-detail').then(m => m.WorkItemDetailPage), title: 'Work item' },
      { path: 'approvals', loadComponent: () => import('./pages/approvals').then(m => m.ApprovalsPage), title: 'Approvals' },
      { path: 'traceability', loadComponent: () => import('./pages/traceability').then(m => m.TraceabilityPage), title: 'Traceability matrix' },
      { path: 'waivers', loadComponent: () => import('./pages/waivers').then(m => m.WaiversPage), title: 'Waivers' },
      { path: 'audit', loadComponent: () => import('./pages/audit').then(m => m.AuditPage), title: 'Audit & system log' },
      { path: 'integrations', loadComponent: () => import('./pages/integrations').then(m => m.IntegrationsPage), title: 'Integrations' },
      { path: 'process', loadComponent: () => import('./pages/process-guide').then(m => m.ProcessGuidePage), title: 'Process guide' },
      { path: 'admin', loadComponent: () => import('./pages/admin').then(m => m.AdminPage), title: 'Administration' },
    ],
  },
  { path: '**', redirectTo: '' },
];
