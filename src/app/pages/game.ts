import { Component, computed, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Seo } from '../seo';
import { findGame, playUrl, SITE } from '../site';
import { NotFound } from './not-found';

@Component({
  selector: 'app-game',
  imports: [RouterLink, NotFound],
  template: `
    @if (game(); as g) {
      <section class="play">
        <p class="crumbs"><a routerLink="/games">Games</a> / {{ g.title }}</p>
        <div class="stage" [style.aspect-ratio]="g.aspect">
          <iframe #frame [src]="frameSrc()" [title]="g.title" allow="fullscreen; autoplay; gamepad" (load)="frame.focus()"></iframe>
        </div>
        <div class="bar">
          <h1>{{ g.title }} <span class="pill">{{ g.status }}</span></h1>
          <span class="spacer"></span>
          <button class="btn" type="button" (click)="fullscreen()">Fullscreen</button>
          <!-- a plain href: the bundle is static files, not an Angular route -->
          <a class="btn ghost" [href]="soloUrl()">Open alone</a>
        </div>
        <p>{{ g.blurb }}</p>
        <p class="muted"><strong>Controls:</strong> {{ g.controls }}</p>
      </section>
    } @else {
      <app-not-found />
    }
  `,
  styles: `
    .play { margin-top: 16px; }
    .crumbs { color: var(--muted); font-size: 0.9rem; margin: 0 0 12px; }
    .crumbs a { color: var(--muted); }
    .stage { width: 100%; max-height: calc(100vh - 160px); margin: 0 auto; background: #000;
             border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); }
    iframe { width: 100%; height: 100%; border: 0; display: block; }
    .bar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 18px 0 8px; }
    .bar h1 { font-size: 1.6rem; margin: 0; }
    .spacer { flex: 1; }
  `,
})
export class Game {
  /** Bound from the :slug route param (withComponentInputBinding). */
  readonly slug = input<string>();

  protected readonly game = computed(() => findGame(this.slug()));
  protected readonly soloUrl = computed(() => {
    const g = this.game();
    return g ? playUrl(g) : '';
  });
  // Only URLs built from a slug listed in site.json are trusted, never raw route input.
  protected readonly frameSrc = computed<SafeResourceUrl | null>(() => {
    const url = this.soloUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  private readonly sanitizer = inject(DomSanitizer);
  private readonly seo = inject(Seo);
  private readonly frame = viewChild<ElementRef<HTMLIFrameElement>>('frame');

  constructor() {
    effect(() => {
      const g = this.game();
      if (g) this.seo.set({ title: `${g.title} · ${SITE.name}`, description: g.blurb, path: `/games/${g.slug}/` });
    });
  }

  protected fullscreen(): void {
    const el = this.frame()?.nativeElement;
    if (el?.requestFullscreen) void el.requestFullscreen();
    else location.assign(this.soloUrl());
  }
}
