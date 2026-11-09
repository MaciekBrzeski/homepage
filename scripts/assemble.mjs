#!/usr/bin/env node
// After `ng build`: copy the prerendered site into out/, then each game's bundle into out/games/<slug>/play/,
// then the CAD models listed in site.json (from the hologrid viewer's build) into out/cad/models/.
//   node scripts/assemble.mjs              build every game and hologrid first (in their own projects), then copy
//   node scripts/assemble.mjs --skip-games reuse their existing dist/
// A project folder that is missing (e.g. a fresh clone of this repo) is skipped with a warning;
// --strict turns any skip into a failure.
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

// CAD: publish only the assemblies site.json lists, and only the STLs they use.
const cad = site.cad;
const cadProj = resolve(root, cad.project);
if (!existsSync(cadProj)) {
  console.warn(`warn: cad: project ${cadProj} not found, models skipped`);
  missing++;
} else {
  if (!skipGames && cad.build) {
    console.log(`build cad: ${cad.build} (in ${cadProj})`);
    execSync(cad.build, { cwd: cadProj, stdio: 'inherit' });
  }
  const dist = join(cadProj, cad.dist);
  const catalog = JSON.parse(readFileSync(join(dist, 'catalog.json'), 'utf8'));
  const dest = join(out, 'cad', 'models');
  const assemblies = cad.models.map(({ key }) => {
    const a = catalog.assemblies.find((x) => x.key === key);
    if (!a) throw new Error(`cad: assembly ${key} is not in ${dist}/catalog.json`);
    return {
      key: a.key,
      name: a.name,
      up: a.up,
      parts: a.parts.map((p) => {
        if (!p.file.startsWith('models/') || p.file.endsWith('.json'))
          throw new Error(
            `cad: ${key}/${p.id}: expected a binary STL under models/, got ${p.file}`,
          );
        const file = p.file.slice('models/'.length);
        mkdirSync(dirname(join(dest, file)), { recursive: true });
        cpSync(join(dist, p.file), join(dest, file));
        const { id, material, note, ghost, alt, tris, instances } = p;
        return { id, file, material, note, ghost, alt, tris, instances };
      }),
    };
  });
  writeFileSync(join(dest, 'catalog.json'), JSON.stringify({ assemblies }));
  console.log(`cad: ${assemblies.length} assemblies`);
}
if (missing && process.argv.includes('--strict')) process.exit(1);
