import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Nav } from './layout/nav';
import { SITE } from './site';

/**
 * Wide screens: a fixed sidebar laid out with CSS grid, so the prerendered HTML is already correct before JS runs.
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
        <div class="shell">
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
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    mat-sidenav-container {
      min-height: 100vh;
      background: var(--mat-sys-surface);
    }
    .shell {
      display: grid;
      grid-template-columns: 280px minmax(0, 1fr);
      min-height: 100vh;
    }
    .rail {
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      background: var(--mat-sys-surface-container-low);
      border-right: 1px solid var(--mat-sys-outline-variant);
    }
    .bar {
      display: none;
      position: sticky;
      top: 0;
      z-index: 2;
      gap: 8px;
      background: var(--mat-sys-surface-container);
    }
    .bar-name {
      color: inherit;
      text-decoration: none;
      font: var(--mat-sys-title-medium);
    }
    .drawer {
      width: 280px;
      background: var(--mat-sys-surface-container-low);
    }
    @media (max-width: 959.98px) {
      .shell {
        grid-template-columns: minmax(0, 1fr);
      }
      .rail {
        display: none;
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
