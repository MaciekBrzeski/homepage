# homepage

My personal site: about me, side projects, and a shelf of small browser games I make.
Live at **https://maciejbrzeski.duckdns.org**.

Built with **Angular 22** and **Angular Material** (Material 3 theme, light/dark from the system): standalone components, lazy-loaded routes, signals (`input()`, `computed()`, `viewChild()`), the
`@if` / `@for` / `@let` control flow, zoneless change detection, and **fully static output**. Every route is
prerendered at build time (`outputMode: "static"`), so the server is plain Caddy serving files, with no Node process.

## Checks

`npm run check` runs what CI runs (.github/workflows/ci.yml) on every push and pull request:
prettier, a typecheck of the e2e suite, unit tests (vitest), the static build, then Playwright on desktop and
phone viewports: axe accessibility (WCAG 2.2 AA, light and dark), navigation, the theme switch, the game page,
the 404, and the prerendered HTML with JavaScript off (titles, canonical links, no phone or e-mail).
`npm run deploy` runs the same suites against the exact files it is about to upload, and stops on a failure.

## How it fits together

- `src/content/site.json`: all text, projects and games. Components only render it.
- `src/app/core/`: app-wide services and data: `site.ts` (typed access to site.json), `seo.ts`, `theme.ts`
  (light / dark / system switch, saved in localStorage), `brand-icons.ts`.
- `src/app/layout/`: the sidebar (`nav/`) and the theme switch (`theme-toggle/`).
- `src/app/features/`: one folder per area, each lazy-loaded: `about/`, `projects/` (with `project-card/`), and
  `games/` with its own `games.routes.ts` (`game-list/`, `game-page/` where the game runs in an iframe, `game-card/`).
- `src/app/shared/`: pieces used across features (`not-found/`).
- Every component is split into `name.ts`, `name.html` and `name.scss` in its own folder.
- `src/app/app.ts`: the layout. Wide screens get a fixed sidebar positioned in plain CSS, so the prerendered HTML is
  right before any JS runs. Narrow screens get a toolbar and the same `<app-nav>` in a `mat-sidenav` drawer.
- `src/styles.scss`: the notebook theme (paper, sticky notes, index cards) as CSS custom properties.
- Games are separate projects with their own build. `scripts/assemble.mjs` builds each one and copies its bundle
  to `/games/<slug>/play/`, next to the prerendered Angular pages. The game page links to that path with a plain
  `href`, because it is static files, not a route.
- `getPrerenderParams` in `app.routes.server.ts` prerenders one page per game listed in `site.json`.

## Commands

```bash
npm start                 # dev server
npm test                  # vitest via ng test
npx ng build && npm run assemble -- --skip-games   # build into out/
npm run deploy            # build, assemble, rsync, then check every page over HTTPS
```

Adding a game: add an entry to `games[]` in `site.json` and a 640×360 thumbnail to `public/thumbs/`.
The game's bundle must use relative asset paths (Vite `base: './'`).

## Server

`scripts/server-setup.sh` is a one-time setup for the server, run with sudo. It adds a Caddy site block with gzip/zstd,
long-lived caching for hashed game assets and a 404 handler. It checks the new config on a copy before
replacing the live one. The deploy target lives in `.env.deploy`, which is not committed.
