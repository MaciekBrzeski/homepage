import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Game } from '../site';

@Component({
  selector: 'app-game-card',
  imports: [RouterLink],
  template: `
    @let g = game();
    <a class="card-link" [routerLink]="['/games', g.slug]">
      <article class="paper polaroid taped">
        <img [src]="'/' + g.thumb" alt="" loading="lazy" width="640" height="360" />
        <h2>
          {{ g.title }} <span class="pill">{{ g.status }}</span>
        </h2>
        <p>{{ g.blurb }}</p>
      </article>
    </a>
  `,
  styles: `
    :host {
      display: block;
    }
    .polaroid {
      padding: 12px 12px 18px;
    }
    img {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 9;
      object-fit: cover;
      border-radius: 1px;
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 14px 6px 6px;
      font: 700 2rem/1 var(--hand);
    }
    p {
      margin: 0 6px;
      color: var(--ink-soft);
      line-height: 1.5;
    }
  `,
})
export class GameCard {
  readonly game = input.required<Game>();
}
