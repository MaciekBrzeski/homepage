import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Seo } from '../../core/seo';
import { SITE } from '../../core/site';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.html',
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
