import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Seo } from '../seo';
import { SITE } from '../site';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="page">
      <h1 class="page-title">404</h1>
      <p class="lead">
        That page is not here. <a routerLink="/">Back home</a> or
        <a routerLink="/games">play something</a>.
      </p>
    </section>
  `,
})
export class NotFound {
  constructor() {
    inject(Seo).set({
      title: `Not found · ${SITE.name}`,
      description: 'Page not found.',
      path: '/404.html',
    });
  }
}
