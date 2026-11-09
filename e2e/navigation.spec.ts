import { expect, openNav, SITE, test } from './site';

test('sidebar links move between pages and mark the current one', async ({ page, isMobile }) => {
  await page.goto('/');

  let nav = await openNav(page, isMobile);
  await nav.getByRole('link', { name: 'Projects' }).click();
  await expect(page).toHaveURL(/\/projects\/?$/);
  await expect(page.locator('h1')).toHaveText('Projects');
  if (isMobile) await expect(page.locator('mat-sidenav')).toBeHidden(); // drawer closes itself

  nav = await openNav(page, isMobile);
  await expect(nav.getByRole('link', { name: 'Projects' })).toHaveClass(/\bon\b/);
  await nav.getByRole('link', { name: 'Games', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Games');
  // A game page is reached from the list and keeps Games marked as current.
  await page.locator('a.card-link').first().click();
  await expect(page).toHaveURL(new RegExp(`/games/${SITE.games[0].slug}/?$`));
  nav = await openNav(page, isMobile);
  await expect(nav.getByRole('link', { name: 'Games' })).toHaveClass(/\bon\b/);
  await expect(nav.getByRole('link', { name: SITE.games[0].title })).toHaveCount(0);
  await nav.getByRole('link', { name: 'About' }).click();
  await expect(page.locator('h1')).toContainText("Hi, I'm");
});

test('the rail shows on desktop, the menu button on phones', async ({ page, isMobile }) => {
  await page.goto('/');
  await expect(page.locator('aside.rail')).toBeVisible({ visible: !isMobile });
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible({ visible: isMobile });
});

test('theme switch applies, survives a reload, and "Match system" forgets it', async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const html = page.locator('html');

  let nav = await openNav(page, isMobile);
  await nav.getByRole('button', { name: 'Dark' }).click();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await expect(nav.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');

  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe('rgb(31, 35, 42)'); // the dark page colour, although the system is light

  nav = await openNav(page, isMobile);
  await nav.getByRole('button', { name: 'Match system' }).click();
  await expect(html).not.toHaveAttribute('data-theme', /.*/);
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBeNull();
});

test.describe('without the app bundle', () => {
  // The bundle is blocked on purpose below, so its load failure is expected.
  test.use({ allowedErrors: [/main-[^/]+\.js/] });

  test('a saved theme is applied before Angular starts (no flash)', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    // Block the app bundle: only the inline script in index.html can set the attribute now.
    await page.route(/\/main-[^/]+\.js$/, (route) => route.abort());
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

for (const game of SITE.games) {
  test(`${game.title}: embeds the game bundle and links to it`, async ({ page }) => {
    await page.goto(`/games/${game.slug}/`);
    const play = `/games/${game.slug}/play/`;
    await expect(page.locator('iframe')).toHaveAttribute('src', play);
    await expect(page.locator('iframe')).toHaveAttribute('title', game.title);
    // A plain href: the bundle is static files, not an Angular route.
    await expect(page.getByRole('link', { name: 'Open alone' })).toHaveAttribute('href', play);
    await expect(page.getByRole('button', { name: 'Fullscreen' })).toBeVisible();
  });
}

test('unknown URLs get the 404 page with a real 404 status', async ({ page }) => {
  const res = await page.goto('/no-such-page');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('404');
  await page.getByRole('link', { name: 'Back home' }).click();
  await expect(page.locator('h1')).toContainText("Hi, I'm");
});

test('profile links open the real profiles in a new tab', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('.actions');
  for (const [name, href] of [
    ['LinkedIn', SITE.links.linkedin],
    ['GitHub', SITE.links.github],
  ] as const) {
    if (!href) continue;
    const link = hero.getByRole('link', { name });
    await expect(link).toHaveAttribute('href', href);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  }
});
