import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SITE } from '../site';
import { Home } from './home';

describe('Home page', () => {
  it('renders one card per game and per project from site.json', async () => {
    TestBed.configureTestingModule({ imports: [Home], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('app-game-card').length).toBe(SITE.games.length);
    expect(el.querySelectorAll('app-project-card').length).toBe(SITE.projects.length);
  });

  it('hides the contact section while no link is set', async () => {
    TestBed.configureTestingModule({ imports: [Home], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const hasLinks = Object.values(SITE.links).some(Boolean);
    expect(!!(fixture.nativeElement as HTMLElement).querySelector('#contact')).toBe(hasLinks);
  });
});
