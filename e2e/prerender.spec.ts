import { expect, PAGES, SITE, test } from './site';

// Crawlers and link previews see the prerendered HTML, so check it with JavaScript off.
test.describe('prerendered HTML (JavaScript disabled)', () => {
  test.use({ javaScriptEnabled: false });

  for (const { path, h1 } of PAGES) {
    test(path, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveText(h1);
      await expect(page).toHaveTitle(new RegExp(SITE.name));
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `https://${SITE.host}${path}`,
      );
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /\S/);
    });
  }

  test('no page publishes a phone number or e-mail address', async ({ page }) => {
    for (const { path } of PAGES) {
      await page.goto(path);
      const html = await page.content();
      expect(html, path).not.toMatch(/\+48|@gmail\.com|mailto:/);
    }
  });

  test('page titles are unique', async ({ page }) => {
    const titles = new Set<string>();
    for (const { path } of PAGES) {
      await page.goto(path);
      titles.add(await page.title());
    }
    expect(titles.size).toBe(PAGES.length);
  });
});
