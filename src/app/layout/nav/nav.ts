import { Component, output } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SITE } from '../../core/site';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

/** Sidebar content; shown fixed on wide screens and inside the mobile drawer. */
@Component({
  selector: 'app-nav',
  imports: [
    MatListModule,
    MatIconModule,
    MatDividerModule,
    RouterLink,
    RouterLinkActive,
    ThemeToggle,
  ],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
})
export class Nav {
  readonly navigate = output<void>();
  protected readonly site = SITE;
  protected readonly year = new Date().getFullYear();
  protected readonly initials = SITE.name
    .split(' ')
    .map((w) => w[0])
    .join('');
}
