import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Lista } from './lista/lista';
import { Favoritos } from './favoritos/favoritos';
import { Status } from './status/status';
import { Contato } from './contato/contato';
import { Perfil } from './perfil/perfil';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'lista', component: Lista, canActivate: [authGuard] },
  { path: 'favoritos', component: Favoritos, canActivate: [authGuard] },
  { path: 'status', component: Status, canActivate: [authGuard] },
  { path: 'perfil', component: Perfil, canActivate: [authGuard] },
  { path: 'contato', component: Contato },
];