import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Nav } from './layout/nav/nav';
import { SITE } from './core/site';

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
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly name = SITE.name;
}
