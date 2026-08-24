import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Lista } from './lista/lista';
import { Favoritos } from './favoritos/favoritos';
import { Status } from './status/status';
import { Contato } from './contato/contato';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'lista', component: Lista },
  { path: 'favoritos', component: Favoritos },
  { path: 'status', component: Status },
  { path: 'contato', component: Contato },
];