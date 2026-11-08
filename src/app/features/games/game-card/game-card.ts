import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Game } from '../../../core/site';

@Component({
  selector: 'app-game-card',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './game-card.html',
  styleUrl: './game-card.scss',
})
export class GameCard {
  readonly game = input.required<Game>();
}
