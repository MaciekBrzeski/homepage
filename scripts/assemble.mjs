#!/usr/bin/env node
// After `ng build`: copy the prerendered site into out/, then each game's bundle into out/games/<slug>/play/.
//   node scripts/assemble.mjs              build every game first (in its own project), then copy
//   node scripts/assemble.mjs --skip-games reuse each game's existing dist/
// A game whose project folder is missing (e.g. a fresh clone of this repo) is skipped with a warning.
import { execSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(readFileSync(join(root, 'src/content/site.json'), 'utf8'));
const browser = join(root, 'dist/homepage/browser');
const out = join(root, 'out');
const skipGames = process.argv.includes('--skip-games');

if (!existsSync(join(browser, 'index.html')))
  throw new Error('no dist/homepage/browser/index.html; run `ng build` first');
rmSync(out, { recursive: true, force: true });
cpSync(browser, out, { recursive: true });
// Caddy's error handler serves /404.html; Angular prerenders the 404 route to 404/index.html.
cpSync(join(out, '404/index.html'), join(out, '404.html'));

let missing = 0;
for (const g of site.games) {
  if (!existsSync(join(out, 'games', g.slug, 'index.html')))
    throw new Error(`${g.slug}: page was not prerendered`);
  const proj = resolve(root, g.project);
  if (!existsSync(proj)) {
    console.warn(`warn: ${g.slug}: project ${proj} not found, game bundle skipped`);
    missing++;
    continue;
  }
  if (!skipGames && g.build) {
    console.log(`build ${g.slug}: ${g.build} (in ${proj})`);
    execSync(g.build, { cwd: proj, stdio: 'inherit' });
  }
  const dist = join(proj, g.dist);
  if (!existsSync(join(dist, 'index.html'))) throw new Error(`${g.slug}: no ${dist}/index.html`);
  cpSync(dist, join(out, 'games', g.slug, 'play'), { recursive: true });
}
console.log(`out/ ready: ${site.games.length - missing}/${site.games.length} game bundle(s)`);
if (missing && process.argv.includes('--strict')) process.exit(1);
