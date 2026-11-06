import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SITE } from '../site';
import { Game } from './game';

async function render(slug: string) {
  TestBed.configureTestingModule({ imports: [Game], providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(Game);
  fixture.componentRef.setInput('slug', slug);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('Game page', () => {
  it('embeds a known game from its static bundle path', async () => {
    const g = SITE.games[0];
    const el = await render(g.slug);
    expect(el.querySelector('h1')?.textContent).toContain(g.title);
    expect(el.querySelector('iframe')?.getAttribute('src')).toBe(`/games/${g.slug}/play/`);
    expect(el.querySelector('a.ghost')?.getAttribute('href')).toBe(`/games/${g.slug}/play/`);
  });

  it('shows the 404 for an unknown slug and embeds nothing', async () => {
    const el = await render('../../etc');
    expect(el.querySelector('iframe')).toBeNull();
    expect(el.textContent).toContain('404');
  });
});
