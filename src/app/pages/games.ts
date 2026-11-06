import { Component, inject } from '@angular/core';
import { Seo } from '../seo';
import { SITE } from '../site';
import { GameCard } from '../ui/game-card';

@Component({
  selector: 'app-games',
  imports: [GameCard],
  template: `
    <section>
      <h1>Games</h1>
      <p class="lead">
        Small browser games. No install, no account: they run in this tab and save progress in your
        browser.
      </p>
      <div class="grid games">
        @for (g of games; track g.slug) {
          <app-game-card [game]="g" />
        }
      </div>
    </section>
  `,
})
export class Games {
  protected readonly games = SITE.games;

  constructor() {
    inject(Seo).set({
      title: `Games · ${SITE.name}`,
      description: 'Small browser games, free to play.',
      path: '/games/',
    });
  }
}
