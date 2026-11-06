import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Game } from '../site';

@Component({
  selector: 'app-game-card',
  imports: [RouterLink],
  template: `
    <a class="card" [routerLink]="['/games', game().slug]">
      <img [src]="'/' + game().thumb" alt="" loading="lazy" width="640" height="360" />
      <div class="body">
        <h3>
          {{ game().title }} <span class="pill">{{ game().status }}</span>
        </h3>
        <p>{{ game().blurb }}</p>
      </div>
    </a>
  `,
  styles: `
    :host {
      display: block;
    }
    img {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 16 / 9;
      object-fit: cover;
      background: var(--line);
    }
    .body {
      padding: 16px 20px 20px;
    }
  `,
})
export class GameCard {
  readonly game = input.required<Game>();
}
