import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { Game } from '../site';

@Component({
  selector: 'app-game-card',
  imports: [RouterLink, MatCardModule],
  template: `
    <a class="card-link" [routerLink]="['/games', game().slug]">
      <mat-card appearance="outlined">
        <img
          mat-card-image
          [src]="'/' + game().thumb"
          alt=""
          loading="lazy"
          width="640"
          height="360"
        />
        <mat-card-header>
          <mat-card-title>{{ game().title }}</mat-card-title>
          <mat-card-subtitle
            ><span class="pill">{{ game().status }}</span></mat-card-subtitle
          >
        </mat-card-header>
        <mat-card-content
          ><p>{{ game().blurb }}</p></mat-card-content
        >
      </mat-card>
    </a>
  `,
  styles: `
    :host {
      display: block;
    }
    mat-card {
      height: 100%;
      overflow: hidden;
    }
    img {
      aspect-ratio: 16 / 9;
      object-fit: cover;
      margin: 0;
      width: 100%;
    }
    mat-card-header {
      padding-top: 16px;
    }
    p {
      margin: 8px 0 0;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class GameCard {
  readonly game = input.required<Game>();
}
