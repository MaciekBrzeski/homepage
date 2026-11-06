# homepage

Public personal site: portfolio + shelf of browser games. Angular 22, prerendered to static files. PUBLIC repo on GitHub.

## Commands
- `npm test`: ng test (vitest). `npx ng build`: prerenders every route into dist/homepage/browser.
- `node scripts/assemble.mjs [--skip-games] [--strict]`: dist + game bundles → out/.
- `npm run deploy`: build, assemble, rsync to `$DEPLOY_TARGET` (.env.deploy, gitignored), then check every page over HTTPS.

## Rules
- Content lives only in `src/content/site.json`; components render it. Publish only facts the user has confirmed;
  contact links stay null until the user gives them.
- Public repo: no server hostnames, IPs, usernames, tokens or infrastructure notes in tracked files. Those go in
  .env.deploy or the workshop mission (`~/Dokumenty/workshop/missions/homepage.md`).
- Keep output static (`outputMode: "static"`). The server has little spare RAM, so no SSR process.
- Modern Angular only: standalone components, signal inputs/computed, `@if`/`@for`, zoneless. No NgModules, no zone.js.
- Game bundles are static files at /games/<slug>/play/. Link to them with a plain href, never routerLink.
