import { Component, inject } from '@angular/core';
import { Seo } from '../../../core/seo';
import { SITE } from '../../../core/site';
import { GameCard } from '../game-card/game-card';

@Component({
  selector: 'app-game-list',
  imports: [GameCard],
  templateUrl: './game-list.html',
  styleUrl: './game-list.scss',
})
export class GameList {
  protected readonly games = SITE.games;

  constructor() {
    inject(Seo).set({
      title: `Games · ${SITE.name}`,
      description: 'Small browser games, free to play.',
      path: '/games/',
    });
  }
}
