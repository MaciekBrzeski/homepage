import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Seo } from '../../core/seo';
import { SITE } from '../../core/site';

@Component({
  selector: 'app-about',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  protected readonly site = SITE;
  protected readonly firstName = SITE.name.split(' ')[0];

  constructor() {
    inject(Seo).set({
      title: `${SITE.name} · Frontend Engineer`,
      description: SITE.intro,
      path: '/',
    });
  }
}
