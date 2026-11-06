import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SITE } from './site';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="top">
      <a class="brand" routerLink="/">{{ site.name }}</a>
      <nav>
        <a routerLink="/" fragment="projects">Projects</a>
        <a routerLink="/games" routerLinkActive="active" ariaCurrentWhenActive="page">Games</a>
        @if (hasContact) {
          <a routerLink="/" fragment="contact">Contact</a>
        }
      </nav>
    </header>
    <main>
      <router-outlet />
    </main>
    <footer class="foot">© {{ year }} {{ site.name }}</footer>
  `,
  styles: `
    .top {
      display: flex;
      align-items: center;
      gap: 24px;
      height: 68px;
    }
    .brand {
      font-weight: 750;
      color: var(--text);
      text-decoration: none;
    }
    nav {
      margin-left: auto;
      display: flex;
      gap: 20px;
    }
    nav a {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.95rem;
    }
    nav a:hover,
    nav a.active {
      color: var(--text);
    }
    .foot {
      color: var(--muted);
      font-size: 0.85rem;
      padding-top: 24px;
      padding-bottom: 40px;
      border-top: 1px solid var(--line);
      margin-top: 72px;
    }
  `,
})
export class App {
  protected readonly site = SITE;
  protected readonly year = new Date().getFullYear();
  protected readonly hasContact = Object.values(SITE.links).some(Boolean);
}
