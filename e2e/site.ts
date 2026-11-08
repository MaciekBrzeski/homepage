import { test as base, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

interface Site {
  host: string;
  name: string;
  links: { github: string | null; linkedin: string | null };
  games: { slug: string; title: string }[];
}

/** The same content file the app renders, so tests follow the site as it grows. */
export const SITE: Site = JSON.parse(readFileSync('src/content/site.json', 'utf8'));

/** Every prerendered page, with the <h1> it must show. */
export const PAGES: { path: string; h1: RegExp }[] = [
  { path: '/', h1: /Hi, I'm/ },
  { path: '/projects/', h1: /Projects/ },
  { path: '/games/', h1: /Games/ },
  ...SITE.games.map((g) => ({ path: `/games/${g.slug}/`, h1: new RegExp(g.title) })),
];

/** Noise that is not the site's fault: the embedded game's own assets, web fonts when offline. */
const IGNORED = [/\/games\/[^/]+\/play\//, /fonts\.(googleapis|gstatic)\.com/];

/**
 * `test` with a guard: any console error or uncaught exception from the site fails the test.
 * Use this `test` (not the one from @playwright/test) in every spec.
 */
export const test = base.extend<{ allowedErrors: RegExp[]; consoleGuard: void }>({
  /** Per-test opt-out for errors a test causes on purpose: `test.use({ allowedErrors: [/…/] })`. */
  allowedErrors: [[], { option: true }],
  consoleGuard: [
    async ({ page, allowedErrors }, use) => {
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
