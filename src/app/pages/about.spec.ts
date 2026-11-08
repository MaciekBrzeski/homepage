import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideBrandIcons } from '../layout/brand-icons';
import { SITE } from '../site';
import { About } from './about';

async function render() {
  TestBed.configureTestingModule({
    imports: [About],
    providers: [provideRouter([]), provideBrandIcons()],
  });
  const fixture = TestBed.createComponent(About);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('About page', () => {
  it('renders every job and every skill from site.json', async () => {
    const el = await render();
    expect(el.querySelectorAll('.timeline > li').length).toBe(SITE.experience.length);
    const chips = SITE.skills.reduce((n, s) => n + s.items.length, 0);
    expect(el.querySelectorAll('.skills .tag').length).toBe(chips);
  });

  it('links only the profiles that are set, and never shows phone or email', async () => {
    const el = await render();
    const hrefs = [...el.querySelectorAll('a')].map((a) => a.getAttribute('href') ?? '');
    if (SITE.links.github) expect(hrefs).toContain(SITE.links.github);
    if (SITE.links.linkedin) expect(hrefs).toContain(SITE.links.linkedin);
    expect(el.textContent).not.toMatch(/\+48|@gmail/);
  });
});
