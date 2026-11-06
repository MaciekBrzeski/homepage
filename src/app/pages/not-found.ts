import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Seo } from '../seo';
import { SITE } from '../site';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="hero">
      <h1>404</h1>
      <p class="lead">That page is not here. <a routerLink="/">Back home</a> or <a routerLink="/games">play something</a>.</p>
    </section>
  `,
  styles: `.hero { margin-top: 72px; } h1 { font-size: 3.6rem; margin: 0 0 0.3em; }`,
})
export class NotFound {
  constructor() {
    inject(Seo).set({ title: `Not found · ${SITE.name}`, description: 'Page not found.', path: '/404.html' });
  }
}
