import { test as base, expect, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';

interface Site {
  host: string;
  name: string;
  links: { github: string | null; linkedin: string | null };
  games: { slug: string; title: string }[];
  cad: { models: { key: string; title: string }[] };
}

/** The same content file the app renders, so tests follow the site as it grows. */
export const SITE: Site = JSON.parse(readFileSync('src/content/site.json', 'utf8'));

/** Every prerendered page, with the <h1> it must show. */
export const PAGES: { path: string; h1: RegExp }[] = [
  { path: '/', h1: /Hi, I'm/ },
  { path: '/projects/', h1: /Projects/ },
  { path: '/games/', h1: /Games/ },
  ...SITE.games.map((g) => ({ path: `/games/${g.slug}/`, h1: new RegExp(g.title) })),
  { path: '/cad/', h1: /CAD/ },
];

/** Whether out/ has the real CAD models (it does after a full assemble; CI builds without them). */
export const HAS_MODELS = existsSync('out/cad/models/catalog.json');

/** A binary STL of an axis-aligned cube, 12 triangles. */
function cubeStl(size: number): Buffer {
  const v = [0, size];
  const c = (i: number) => [v[i & 1], v[(i >> 1) & 1], v[(i >> 2) & 1]];
  const faces = [
    [0, 2, 3, 1],
    [4, 5, 7, 6],
    [0, 1, 5, 4],
    [2, 6, 7, 3],
    [0, 4, 6, 2],
    [1, 3, 7, 5],
  ];
  const tris = faces.flatMap(([a, b, d, e]) => [
    [a, b, d],
    [a, d, e],
  ]);
  const buf = Buffer.alloc(84 + tris.length * 50);
  buf.writeUInt32LE(tris.length, 80);
  tris.forEach((t, i) =>
    t.flatMap(c).forEach((x, j) => buf.writeFloatLE(x, 84 + i * 50 + 12 + j * 4)),
  );
  return buf;
}

/**
 * The CAD catalog the e2e suite serves in place of the real one: every listed model is a 20 mm
 * printed cube next to a 40 mm "bought" cube, so the viewer is tested the same way with or
 * without the models in out/. The real models have their own test (cad.spec.ts).
 */
export const FIXTURE_CATALOG = {
  assemblies: SITE.cad.models.map((m) => ({
    key: m.key,
    name: m.title,
    up: 'z',
    parts: [
      { id: 'cube', file: 'fixture/cube.stl', material: 'PLA', note: 'the test cube', tris: 12 },
      {
        id: 'crate',
        file: 'fixture/crate.stl',
        ghost: true,
        tris: 12,
        instances: [{ matrix: [1, 0, 0, 30, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }],
      },
    ],
  })),
};

export async function serveFixtureModels(page: Page) {
  await page.route('**/cad/models/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/catalog.json')) return route.fulfill({ json: FIXTURE_CATALOG });
    if (path.endsWith('/fixture/cube.stl')) return route.fulfill({ body: cubeStl(20) });
    if (path.endsWith('/fixture/crate.stl')) return route.fulfill({ body: cubeStl(40) });
    return route.fulfill({ status: 404 });
  });
}

/** Waits until a page has finished its client-side work (the CAD sheet draws after load). */
export async function settled(page: Page, path: string) {
  await expect(page.locator('h1')).toBeVisible();
  if (path === '/cad/') await expect(page.locator('.title-block')).toContainText('triangles');
}

/** Noise that is not the site's fault: the embedded game's own assets, web fonts when offline. */
const IGNORED = [/\/games\/[^/]+\/play\//, /fonts\.(googleapis|gstatic)\.com/];

/**
 * `test` with a guard: any console error or uncaught exception from the site fails the test.
 * Use this `test` (not the one from @playwright/test) in every spec.
 */
export const test = base.extend<{
  allowedErrors: RegExp[];
  realModels: boolean;
  consoleGuard: void;
}>({
  /** Per-test opt-out for errors a test causes on purpose: `test.use({ allowedErrors: [/…/] })`. */
  allowedErrors: [[], { option: true }],
  /** Serve the real CAD models from out/ instead of the fixture cube: `test.use({ realModels: true })`. */
  realModels: [false, { option: true }],
  consoleGuard: [
    async ({ page, allowedErrors, realModels }, use) => {
      if (!realModels) await serveFixtureModels(page);
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
      page.on('console', (m) => {
        if (m.type() !== 'error') return;
        const where = m.location().url ?? '';
        const text = m.text();
        if ([...IGNORED, ...allowedErrors].some((re) => re.test(where) || re.test(text))) return;
        // The browser logs the document's own non-200 status; the 404 page is supposed to have one.
        if (text.includes('status of 404') && where === page.url()) return;
        errors.push(`console: ${text} (${where})`);
      });
      await use();
      expect(errors, 'console errors on the page').toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };

/** The sidebar: always visible on desktop, inside the drawer on phones (opened here). */
export async function openNav(page: Page, isMobile: boolean) {
  if (!isMobile) return page.locator('aside.rail');
  await page.getByRole('button', { name: 'Open menu' }).click();
  const drawer = page.locator('mat-sidenav');
  await expect(drawer).toBeVisible();
  return drawer;
}
