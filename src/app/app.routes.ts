import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './services/auth-guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home').then((m) => m.Home) },
  { path: 'admin', loadComponent: () => import('./features/admin/admin').then((m) => m.Admin) },
  { path: 'catalogo', canActivate: [adminGuard], loadComponent: () => import('./features/catalogo/catalogo').then((m) => m.Catalogo) },
  { path: 'contato', loadComponent: () => import('./contato/contato').then((m) => m.Contato) },
  { path: 'lista', canActivate: [authGuard], loadComponent: () => import('./lista/lista').then((m) => m.Lista) },
  { path: 'perfil', canActivate: [authGuard], loadComponent: () => import('./perfil/perfil').then((m) => m.Perfil) },
  { path: '**', redirectTo: '' },
];
