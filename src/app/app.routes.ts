import { Routes } from '@angular/router';
import { Game } from './pages/game';
import { Games } from './pages/games';
import { Home } from './pages/home';
import { NotFound } from './pages/not-found';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'games', component: Games },
  { path: 'games/:slug', component: Game },
  // Prerendered to 404/index.html; scripts/assemble.mjs copies it to /404.html for Caddy's error handler.
  { path: '404', component: NotFound },
  { path: '**', component: NotFound },
];
