import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { effect, inject, PLATFORM_ID, Service, signal } from '@angular/core';

export type ThemeMode = 'system' | 'light' | 'dark';

/** localStorage key; also read by the inline script in index.html before first paint. */
export const THEME_KEY = 'theme';

/**
 * Light / dark / follow-the-system switch.
 * The choice is written to <html data-theme>, and styles.scss maps that to `color-scheme`,
 * which flips every light-dark() token, Material's included.
 */
@Service()
export class Theme {
  private readonly doc = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly selected = signal<ThemeMode>(this.load());
  /** Read-only: change it through set(), which also remembers the choice. */
  readonly mode = this.selected.asReadonly();

  constructor() {
    effect(() => {
      const mode = this.mode();
      const root = this.doc.documentElement;
      if (mode === 'system') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', mode);
    });
  }

  set(mode: ThemeMode): void {
    this.selected.set(mode);
    if (!this.browser) return;
    try {
      if (mode === 'system') localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, mode);
    } catch {
      // Storage blocked (private mode, policy): the choice still applies for this visit.
    }
  }

  private load(): ThemeMode {
    if (!this.browser) return 'system';
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved === 'light' || saved === 'dark' ? saved : 'system';
    } catch {
      return 'system';
    }
  }
}
