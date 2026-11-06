import { Routes } from '@angular/router';

// Each page is its own lazy chunk; prerendering still emits full HTML for every route.
export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/about').then((m) => m.About) },
  { path: 'projects', loadComponent: () => import('./pages/projects').then((m) => m.Projects) },
  { path: 'games', loadComponent: () => import('./pages/games').then((m) => m.Games) },
  { path: 'games/:slug', loadComponent: () => import('./pages/game').then((m) => m.Game) },
  // Prerendered to 404/index.html; scripts/assemble.mjs copies it to /404.html for Caddy's error handler.
  { path: '404', loadComponent: () => import('./pages/not-found').then((m) => m.NotFound) },
  { path: '**', loadComponent: () => import('./pages/not-found').then((m) => m.NotFound) },
];
