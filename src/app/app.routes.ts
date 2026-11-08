import { Routes } from '@angular/router';

// Each feature is its own lazy chunk; prerendering still emits full HTML for every route.
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/about/about').then((m) => m.About),
  },
  {
    path: 'projects',
    loadComponent: () => import('./features/projects/projects').then((m) => m.Projects),
  },
  {
    path: 'games',
    loadChildren: () => import('./features/games/games.routes').then((m) => m.GAMES_ROUTES),
  },
  // Prerendered to 404/index.html; scripts/assemble.mjs copies it to /404.html for Caddy's error handler.
  {
    path: '404',
    loadComponent: () => import('./shared/not-found/not-found').then((m) => m.NotFound),
  },
  {
    path: '**',
    loadComponent: () => import('./shared/not-found/not-found').then((m) => m.NotFound),
  },
];
