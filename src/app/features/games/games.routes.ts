import { Routes } from '@angular/router';

/** The games feature: the list at /games and one page per game at /games/:slug. */
export const GAMES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./game-list/game-list').then((m) => m.GameList),
  },
  {
    path: ':slug',
    loadComponent: () => import('./game-page/game-page').then((m) => m.GamePage),
  },
];
