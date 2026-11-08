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
      overflow-y: auto;
      z-index: 1;
    }
    .main {
      margin-left: 280px;
      min-width: 0;
    }
    .rail,
    .drawer {
      background: var(--night);
      color: #f7efd9;
      border-right: 3px solid var(--ink);
    }
    .bar {
      display: none;
      position: sticky;
      top: 0;
      z-index: 2;
      gap: 8px;
      height: 60px;
      background: var(--night);
      color: #f7efd9;
      border-bottom: 3px solid var(--ink);
      --mat-icon-button-icon-color: #f7efd9;
    }
    .bar-name {
      color: inherit;
      text-decoration: none;
      font:
        600 1.2rem Fredoka,
        Nunito,
        system-ui,
        sans-serif;
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
