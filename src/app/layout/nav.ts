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
    <div class="awning" aria-hidden="true"></div>
    <a class="who" routerLink="/" (click)="navigate.emit()">
      <span class="monogram halftone" aria-hidden="true">{{ initials }}</span>
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
      padding: 0 14px 12px;
      --mat-list-list-item-label-text-color: #f7efd9;
      --mat-list-list-item-leading-icon-color: #f6c343;
      --mat-list-list-item-hover-label-text-color: #fff;
      --mat-list-list-item-focus-label-text-color: #fff;
      --mat-list-list-item-hover-leading-icon-color: #f6c343;
      --mat-list-active-indicator-color: transparent;
      --mat-list-list-item-label-text-font: Nunito, system-ui, sans-serif;
      --mat-list-list-item-label-text-weight: 700;
      --mat-divider-color: rgba(247, 239, 217, 0.2);
    }
    /* Red and cream striped booth awning with a scalloped edge, as in Duck Gallery */
    .awning {
      flex: none;
      height: 34px;
      margin: 0 -14px 8px;
      background: repeating-linear-gradient(90deg, var(--red) 0 28px, var(--paper) 28px 56px);
      -webkit-mask:
        linear-gradient(#000 0 0) top / 100% 20px no-repeat,
        radial-gradient(circle at 14px 0, #000 13.5px, transparent 14px) 0 20px / 28px 14px repeat-x;
      mask:
        linear-gradient(#000 0 0) top / 100% 20px no-repeat,
        radial-gradient(circle at 14px 0, #000 13.5px, transparent 14px) 0 20px / 28px 14px repeat-x;
    }
    .who {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 8px 16px;
      color: inherit;
      text-decoration: none;
    }
    .monogram {
      flex: none;
      display: grid;
      place-items: center;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 2.5px solid var(--ink);
      box-shadow:
        0 0 0 4px var(--cut),
        3px 4px 0 4px rgba(0, 0, 0, 0.45);
      color: var(--ink);
      font:
        600 1.15rem Fredoka,
        Nunito,
        system-ui,
        sans-serif;
      transform: rotate(-4deg);
    }
    .name {
      display: block;
      font:
        600 1.2rem/1.2 Fredoka,
        Nunito,
        system-ui,
        sans-serif;
    }
    .role {
      display: block;
      font-size: 0.85rem;
      color: #c4bcdc;
    }
    mat-nav-list a {
      border-radius: 10px;
      margin: 3px 0;
      border: 2px solid transparent;
    }
    mat-nav-list a.on {
      --mat-list-list-item-label-text-color: var(--ink);
      --mat-list-list-item-hover-label-text-color: var(--ink);
      --mat-list-list-item-focus-label-text-color: var(--ink);
      --mat-list-list-item-leading-icon-color: var(--ink);
      --mat-list-list-item-hover-leading-icon-color: var(--ink);
      background: var(--mustard);
      border-color: var(--ink);
      box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.5);
    }
    .sub {
      padding-left: 56px;
      --mat-list-list-item-label-text-weight: 600;
    }
    mat-divider {
      margin: 10px 12px;
    }
    .foot {
      margin: auto 12px 4px;
      padding-top: 16px;
      font-size: 0.8rem;
      color: #c4bcdc;
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
