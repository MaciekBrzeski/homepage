import { Component, output } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SITE } from '../site';

/** Sidebar content; shown fixed on wide screens and inside the mobile drawer. */
@Component({
  selector: 'app-nav',
  imports: [MatListModule, MatIconModule, MatDividerModule, RouterLink, RouterLinkActive],
  template: `
    <a class="who" routerLink="/" (click)="navigate.emit()">
      <span class="monogram" aria-hidden="true">{{ initials }}</span>
      <span>
        <span class="name">{{ site.name }}</span>
        <span class="role">Frontend Engineer</span>
      </span>
    </a>

    <mat-nav-list aria-label="Site">
      <a
        mat-list-item
        routerLink="/"
        routerLinkActive
        #about="routerLinkActive"
        [routerLinkActiveOptions]="{ exact: true }"
        [activated]="about.isActive"
        (click)="navigate.emit()"
      >
        <mat-icon matListItemIcon>person</mat-icon>
        <span matListItemTitle>About</span>
      </a>
      <a
        mat-list-item
        routerLink="/projects"
        routerLinkActive
        #projects="routerLinkActive"
        [activated]="projects.isActive"
        (click)="navigate.emit()"
      >
        <mat-icon matListItemIcon>code</mat-icon>
        <span matListItemTitle>Projects</span>
      </a>
      <a
        mat-list-item
        routerLink="/games"
        routerLinkActive
        #games="routerLinkActive"
        [routerLinkActiveOptions]="{ exact: true }"
        [activated]="games.isActive"
        (click)="navigate.emit()"
      >
        <mat-icon matListItemIcon>sports_esports</mat-icon>
        <span matListItemTitle>Games</span>
      </a>
      @for (g of site.games; track g.slug) {
        <a
          mat-list-item
          class="sub"
          [routerLink]="['/games', g.slug]"
          routerLinkActive
          #game="routerLinkActive"
          [activated]="game.isActive"
          (click)="navigate.emit()"
        >
          <span matListItemTitle>{{ g.title }}</span>
        </a>
      }
    </mat-nav-list>

    <mat-divider />

    <mat-nav-list aria-label="Elsewhere">
      @if (site.links.github; as href) {
        <a mat-list-item [href]="href" rel="me noopener" target="_blank">
          <mat-icon matListItemIcon svgIcon="github" />
          <span matListItemTitle>GitHub</span>
        </a>
      }
      @if (site.links.linkedin; as href) {
        <a mat-list-item [href]="href" rel="me noopener" target="_blank">
          <mat-icon matListItemIcon svgIcon="linkedin" />
          <span matListItemTitle>LinkedIn</span>
        </a>
      }
    </mat-nav-list>

    <p class="foot">© {{ year }} {{ site.name }}</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 12px;
    }
    .who {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      margin-bottom: 4px;
      color: inherit;
      text-decoration: none;
      border-radius: var(--mat-sys-corner-large);
    }
    .monogram {
      flex: none;
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      font: var(--mat-sys-title-medium);
    }
    .name {
      display: block;
      font: var(--mat-sys-title-medium);
    }
    .role {
      display: block;
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
    mat-nav-list a {
      border-radius: var(--mat-sys-corner-full);
    }
    .sub {
      padding-left: 56px;
    }
    mat-divider {
      margin: 8px 16px;
    }
    .foot {
      margin: auto 16px 8px;
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
  `,
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
