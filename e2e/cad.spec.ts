import { expect, HAS_MODELS, SITE, test } from './site';

// With the fixture catalog (site.ts): every model is a 20 mm printed cube beside a 40 mm bought crate.
test.describe('CAD viewer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cad/');
    await expect(page.locator('.title-block')).toContainText('2 parts · 24 triangles');
  });

  test('draws the first model and lists its parts', async ({ page }) => {
    const first = SITE.cad.models[0];
    await expect(page.getByRole('button', { name: first.title })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.locator('.title-block')).toContainText('20 × 20 × 20 mm');
    await expect(page.locator('.parts li')).toHaveText([/cube\s*×1 PLA/, /crate\s*×1/]);
    await expect(page.getByRole('img', { name: new RegExp(first.title) })).toBeVisible();
  });

  test('pointing at the part on the drawing names it', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover needs a mouse');
    const box = (await page.locator('canvas').boundingBox())!;
    // The printed cube is framed in the middle of the sheet.
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.locator('.hot-line')).toContainText('cube · the test cube');
    await expect(page.locator('.parts li.hot')).toHaveText(/cube/);
  });

  test('the parts list and the view controls work', async ({ page }) => {
    const cube = page.locator('.parts li', { hasText: 'cube' });
    await cube.getByRole('checkbox').uncheck();
    await expect(cube).toHaveClass(/off/);
    await page.getByLabel('Explode').fill('1');
    await page.getByLabel('Bought parts and context').uncheck();
    await page.getByLabel('X-ray (show hidden lines)').check();
    await page.getByRole('button', { name: 'Zoom in' }).click();
    await page.getByRole('img', { name: /Wireframe drawing/ }).press('ArrowLeft');
    await page.getByRole('button', { name: 'Reset view' }).click();
    await expect(page.getByLabel('Explode')).toHaveValue('0');
  });

  test('switches models', async ({ page }) => {
    const last = SITE.cad.models.at(-1)!;
    await page.getByRole('button', { name: last.title }).click();
    await expect(page.getByRole('button', { name: last.title })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.locator('.title-block')).toContainText(last.title);
    await expect(page.locator('.title-block')).toContainText('24 triangles');
  });
});

test.describe('CAD viewer without models', () => {
  test.use({ allowedErrors: [/status of 404/] });

  test('says so instead of breaking', async ({ page }) => {
    await page.route('**/cad/models/catalog.json', (r) => r.fulfill({ status: 404 }));
    await page.goto('/cad/');
    await expect(page.locator('.title-block')).toContainText('not in this build');
  });
});

// The real models, when out/ has them (a full assemble, and the deploy gate). CI builds without them.
test.describe('CAD models in this build', () => {
  test.use({ realModels: true });

  test('every listed model loads', async ({ page, isMobile }) => {
    test.skip(!HAS_MODELS, 'out/ was assembled without the CAD models');
    test.skip(isMobile, 'same files on every viewport');
    test.setTimeout(120_000);
    await page.goto('/cad/');
    for (const m of SITE.cad.models) {
      await page.getByRole('button', { name: m.title }).click();
      await expect(page.locator('.title-block')).toContainText(m.title);
      await expect(page.locator('.title-block')).toContainText('triangles', { timeout: 30_000 });
      await expect(page.locator('.parts li').first()).toBeVisible();
    }
  });
});
