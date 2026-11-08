import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Nav } from './layout/nav';
import { SITE } from './site';

/**
 * Wide screens: a fixed sidebar positioned by plain CSS, so the prerendered HTML is already correct before JS runs.
 * Narrow screens: a toolbar with a menu button that opens the same <app-nav> in a Material drawer.
 */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    Nav,
  ],
  template: `
    <mat-sidenav-container>
      <mat-sidenav #drawer mode="over" class="drawer">
        <app-nav (navigate)="drawer.close()" />
      </mat-sidenav>
      <mat-sidenav-content>
        <aside class="rail"><app-nav /></aside>
        <div class="main">
          <mat-toolbar class="bar">
            <button matIconButton type="button" aria-label="Open menu" (click)="drawer.open()">
              <mat-icon>menu</mat-icon>
            </button>
            <a class="bar-name" routerLink="/">{{ name }}</a>
          </mat-toolbar>
          <main><router-outlet /></main>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    mat-sidenav-container {
      min-height: 100vh;
      background: transparent;
    }
    /* The rail is fixed rather than sticky: mat-sidenav-content is not the scroll container,
       so a sticky rail scrolled away with the page. */
    .rail {
      position: fixed;
      inset: 0 auto 0 0;
      width: 280px;
      z-index: 1;
    }
    /* Spiral binding where the cover meets the page */
    .rail::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      right: -12px;
      width: 24px;
      background: radial-gradient(
          ellipse 11px 5px at 50% 50%,
          transparent 6px,
          #a7aebb 6.5px,
          #e4e7ec 8px,
          #8d95a3 9.5px,
          transparent 10px
        )
        0 0 / 24px 28px repeat-y;
      pointer-events: none;
    }
    .main {
      margin-left: 280px;
      min-width: 0;
      /* the red margin line of a notebook page */
      background: linear-gradient(
          90deg,
          transparent 52px,
          var(--margin-line) 52px,
          var(--margin-line) 54px,
          transparent 54px
        )
        no-repeat;
      min-height: 100vh;
    }
    .rail,
    .drawer {
      background: var(--cover);
      color: #f1eee6;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.25);
    }
    .bar {
      display: none;
      position: sticky;
      top: 0;
      z-index: 2;
      gap: 8px;
      height: 60px;
      background: var(--cover);
      color: #f1eee6;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
      --mat-icon-button-icon-color: #f1eee6;
    }
    .bar-name {
      color: inherit;
      text-decoration: none;
      font: 700 1.6rem var(--hand);
    }
    .drawer {
      width: 280px;
    }
    @media (max-width: 959.98px) {
      .rail {
        display: none;
      }
      .main {
        margin-left: 0;
        background: none;
      }
      .bar {
        display: flex;
      }
    }
  `,
})
export class App {
  protected readonly name = SITE.name;
}
