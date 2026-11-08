import { Component, computed, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Seo } from '../../../core/seo';
import { findGame, playUrl, SITE } from '../../../core/site';
import { NotFound } from '../../../shared/not-found/not-found';

@Component({
  selector: 'app-game-page',
  imports: [RouterLink, NotFound, MatButtonModule, MatIconModule],
  templateUrl: './game-page.html',
  styleUrl: './game-page.scss',
})
export class GamePage {
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
      if (g)
        this.seo.set({
          title: `${g.title} · ${SITE.name}`,
          description: g.blurb,
          path: `/games/${g.slug}/`,
        });
    });
  }

  protected fullscreen(): void {
    const el = this.frame()?.nativeElement;
    if (el?.requestFullscreen) void el.requestFullscreen();
    else location.assign(this.soloUrl());
  }
}
