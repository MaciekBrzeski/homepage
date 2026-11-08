# homepage

Public personal site: portfolio + shelf of browser games. Angular 22 + Angular Material (M3, SCSS), prerendered to static files. PUBLIC repo on GitHub.

## Commands
- `npm test`: ng test (vitest). `npx ng build`: prerenders every route into dist/homepage/browser.
- `node scripts/assemble.mjs [--skip-games] [--strict]`: dist + game bundles → out/.
- `npm run check`: everything CI runs: format, e2e typecheck, unit tests, build + assemble, Playwright.
- `npm run e2e`: Playwright (e2e/) against out/, served by scripts/serve.mjs the way Caddy serves it.
  Build first (`npm run build:site`). `npm run serve` serves out/ on :4300 for a manual look.
- `npm run deploy`: build, assemble, rsync to `$DEPLOY_TARGET` (.env.deploy, gitignored), then check every page over HTTPS.

## Rules
- Content lives only in `src/content/site.json`; components render it. Publish only facts the user has confirmed;
  contact links stay null until the user gives them.
- Public repo: no server hostnames, IPs, usernames, tokens or infrastructure notes in tracked files. Those go in
  .env.deploy or the workshop mission (`~/Dokumenty/workshop/missions/homepage.md`).
- Keep output static (`outputMode: "static"`). The server has little spare RAM, so no SSR process.
- UI is Angular Material components plus the notebook theme. Colours are custom properties defined once in
  `src/styles.scss` (`light-dark()` for scheme-dependent ones); components use `var(--…)`, never raw hex.
- Structure: `core/` (services, data), `layout/`, `features/<area>/` (lazy, own `*.routes.ts` when it has
  several pages), `shared/`. Each component lives in its own folder as `name.ts` + `name.html` + `name.scss`;
  no inline `template:` or `styles:`.
- About-page facts come from the user-confirmed CVs (~/Dokumenty/cv/cv-frontend.html, cv-react.html). Never publish
  the phone number, email, GDPR clause or photo unless the user asks.
- Modern Angular only: standalone components, signal inputs/computed, `@if`/`@for`, zoneless. No NgModules, no zone.js.
- Follow angular.dev's best-practices file (angular.dev/assets/context/best-practices.md): `@Service()` for new
  singleton services, `inject()` not constructor params, `NgOptimizedImage` (`ngSrc`) for images, `[class.x]` not
  ngClass, template-only members `protected`, Angular-set fields `readonly`. Expose service state read-only
  (`asReadonly()`) and change it through methods. We deliberately keep external templates/styles even for small
  components (the user's choice), against the guide's "prefer inline for small" hint.
- Accessibility: every page must pass axe (WCAG 2.2 AA + best-practice) in light and dark, desktop and phone width;
  e2e/a11y.spec.ts enforces it. axe silently skips contrast ("needs review") over gradients, pseudo-elements and
  Material's ripple layers, so the contrast pass flattens that decoration and fails on "needs review" too. If you
  add new decoration, extend FLATTEN rather than loosening the check, and prove the check still fails by
  breaking a colour in out/ on purpose.
- A one-off browser check of a local build: use `npm run serve` (no-store headers). python's http.server lets
  Chrome cache a stale index.html.
- Game bundles are static files at /games/<slug>/play/. Link to them with a plain href, never routerLink.
