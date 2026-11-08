import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Game } from '../../../core/site';

@Component({
  selector: 'app-game-card',
  imports: [RouterLink],
  templateUrl: './game-card.html',
  styleUrl: './game-card.scss',
})
export class GameCard {
  readonly game = input.required<Game>();
}
