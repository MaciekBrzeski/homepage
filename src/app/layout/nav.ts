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
        routerLinkActive="on"
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
        routerLinkActive="on"
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
        routerLinkActive="on"
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
          routerLinkActive="on"
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
      min-height: 100%;
      padding: 18px 18px 12px 14px;
      --mat-list-list-item-label-text-color: #f1eee6;
      --mat-list-list-item-leading-icon-color: #f6d860;
      --mat-list-list-item-hover-label-text-color: #fff;
      --mat-list-list-item-focus-label-text-color: #fff;
      --mat-list-list-item-hover-leading-icon-color: #f6d860;
      --mat-list-active-indicator-color: transparent;
      --mat-list-list-item-label-text-font: Nunito, system-ui, sans-serif;
      --mat-list-list-item-label-text-weight: 700;
      --mat-divider-color: rgba(241, 238, 230, 0.2);
    }
    .who {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 8px 22px;
      color: inherit;
      text-decoration: none;
    }
    /* A round sticker on the notebook cover */
    .monogram {
      flex: none;
      display: grid;
      place-items: center;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--note-yellow);
      color: var(--ink);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.35);
      font: 700 1.55rem var(--hand);
      transform: rotate(-8deg);
    }
    .name {
      display: block;
      font: 700 1.7rem/1 var(--hand);
    }
    .role {
      display: block;
      margin-top: 4px;
      font-size: 0.85rem;
      color: #bfc6d4;
    }
    mat-nav-list a {
      border-radius: 3px;
      margin: 4px 0;
      transition: transform 0.15s ease;
    }
    /* The current page is a sticky note stuck on the cover */
    mat-nav-list a.on {
      --mat-list-list-item-label-text-color: var(--ink);
      --mat-list-list-item-hover-label-text-color: var(--ink);
      --mat-list-list-item-focus-label-text-color: var(--ink);
      --mat-list-list-item-leading-icon-color: var(--ink);
      --mat-list-list-item-hover-leading-icon-color: var(--ink);
      background: var(--note-yellow);
      border-radius: 2px 2px 12px 2px / 2px 2px 5px 2px;
      box-shadow: 0 6px 10px -4px rgba(0, 0, 0, 0.5);
      transform: rotate(-1.2deg);
    }
    .sub {
      padding-left: 56px;
      --mat-list-list-item-label-text-weight: 600;
    }
    mat-divider {
      margin: 12px 12px;
    }
    .foot {
      margin: auto 12px 4px;
      padding-top: 16px;
      font-size: 0.8rem;
      color: #bfc6d4;
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
