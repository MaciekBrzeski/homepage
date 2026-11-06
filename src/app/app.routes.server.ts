import { RenderMode, ServerRoute } from '@angular/ssr';
import { SITE } from './site';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'games/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => SITE.games.map((g) => ({ slug: g.slug })),
  },
  { path: '**', renderMode: RenderMode.Prerender },
];
