import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, openNav, PAGES, settled, test } from './site';

// WCAG 2.2 AA plus axe's best-practice rules, as required by CLAUDE.md.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

/**
 * Decoration axe cannot see through: the ruled lines and margin line are gradient backgrounds,
 * and the spiral binding is a pseudo-element over the sidebar. axe files text over them as
 * "needs review" instead of failing it, so contrast would silently go unchecked. For the contrast
 * pass these are flattened to their solid base colour, which is what the text sits on.
 * Material's focus-indicator and ripple layers are transparent until used, but axe treats them
 * as overlapping the nav labels. axe also gives up ("partially obscured") on any background on
 * the section titles, so their highlighter is removed here and checked by its own test below.
 * The CAD sheet's graph paper is a gradient too; its text sits in the solid title block.
 */
const FLATTEN = `
  body { background-image: none !important; }
  .main { background: none !important; }
  .rail::after, .taped::before { display: none !important; }
  .sheet::after { display: none !important; }
  .section-title { background: none !important; }
  .mat-focus-indicator, .mat-ripple { display: none !important; }
`;

async function audit(page: Page) {
  const fmt = (v: { id: string; impact?: string | null; nodes: { target: unknown[] }[] }) =>
    `${v.id} (${v.impact ?? 'review'}): ${v.nodes
      .slice(0, 3)
      .map((n) => n.target.join(' '))
      .join(', ')}`;

  // Icon ligatures are invisible but full-width until the icon font arrives; measure the real layout.
  await page.evaluate(() => document.fonts.ready);

  // 1. Everything except contrast, on the page as visitors see it. The embedded game is a separate
  // project with its own markup and is not audited here (in CI, without the game repos, its frame
  // even shows this site's 404 page, which would count as a second <main>).
  const structure = await new AxeBuilder({ page })
    .withTags(TAGS)
    .disableRules(['color-contrast'])
    .exclude('iframe')
    .analyze();

  // 2. Contrast, with decoration flattened. "Needs review" counts as a failure here.
  await page.addStyleTag({ content: FLATTEN });
  const contrast = await new AxeBuilder({ page })
    .withRules(['color-contrast'])
    .exclude('iframe')
    .analyze();
  await page.evaluate(() => document.querySelector('style:last-of-type')?.remove());

  return [...structure.violations, ...contrast.violations, ...contrast.incomplete].map(fmt);
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`axe, ${scheme} theme`, () => {
    test.use({ colorScheme: scheme });

    for (const { path } of [...PAGES, { path: '/no-such-page' }]) {
      test(path, async ({ page }) => {
        await page.goto(path);
        await settled(page, path);
        expect(await audit(page)).toEqual([]);
      });
    }

    test('navigation drawer open', async ({ page, isMobile }) => {
      test.skip(!isMobile, 'the drawer only exists at phone width');
      await page.goto('/');
      await openNav(page, isMobile);
      expect(await audit(page)).toEqual([]);
    });
  });
}

// The highlighter stroke behind section titles, which axe cannot evaluate (see FLATTEN).
// Worst case: the text sits entirely on the stroke, i.e. --hl composited over the page colour.
for (const scheme of ['light', 'dark'] as const) {
  test(`section titles keep 3:1 on the highlighter, ${scheme} theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/');
    const ratio = await page.evaluate(() => {
      const probe = (prop: string, value: string) => {
        const el = document.createElement('i');
        el.style.setProperty(prop, value);
        document.body.append(el);
        const rgba = getComputedStyle(el)
          .getPropertyValue(prop)
          .match(/[\d.]+/g)!
          .map(Number);
        el.remove();
        return [rgba[0], rgba[1], rgba[2], rgba[3] ?? 1];
      };
      const title = document.querySelector('.section-title')!;
      const fg = getComputedStyle(title)
        .color.match(/[\d.]+/g)!
        .map(Number);
      const page = probe('background-color', 'var(--bg)');
      const hl = probe('background-color', 'var(--hl)');
      const a = hl[3];
      const bg = [0, 1, 2].map((i) => hl[i] * a + page[i] * (1 - a));
      const lum = (c: number[]) => {
        const [r, g, b] = c.map((v) => {
          const s = v / 255;
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const [hi, lo] = [lum(fg), lum(bg)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(3);
  });
}
