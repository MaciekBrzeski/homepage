import { TestBed } from '@angular/core/testing';
import { Theme, THEME_KEY } from './theme';

describe('Theme', () => {
  beforeEach(() => localStorage.removeItem(THEME_KEY));
  afterEach(() => document.documentElement.removeAttribute('data-theme'));

  it('applies and remembers an explicit choice, and forgets it for "system"', () => {
    const theme = TestBed.inject(Theme);

    theme.set('dark');
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');

    theme.set('system');
    TestBed.tick();
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
  });

  it('starts from the saved choice', () => {
    localStorage.setItem(THEME_KEY, 'light');
    expect(TestBed.inject(Theme).mode()).toBe('light');
  });
});
