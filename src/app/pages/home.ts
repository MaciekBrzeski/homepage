import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Seo } from '../seo';
import { SITE } from '../site';
import { GameCard } from '../ui/game-card';
import { ProjectCard } from '../ui/project-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, GameCard, ProjectCard],
  template: `
    <section class="hero">
      <p class="kicker">{{ site.role }}</p>
      <h1>Hi, I'm {{ firstName }}.</h1>
      <p class="lead">{{ site.intro }}</p>
      <p class="cta"><a class="btn" routerLink="/games">Play the games</a></p>
    </section>

    <section id="games">
      <h2>Games</h2>
      <div class="grid games">
        @for (g of site.games; track g.slug) {
          <app-game-card [game]="g" />
        }
      </div>
    </section>

    <section id="projects">
      <h2>Projects</h2>
      <div class="grid">
        @for (p of site.projects; track p.title) {
          <app-project-card [project]="p" />
        }
      </div>
    </section>

    @let l = site.links;
    @if (l.email || l.linkedin || l.github) {
      <section id="contact">
        <h2>Contact</h2>
        <p class="links">
          @if (l.email) { <a [href]="'mailto:' + l.email">{{ l.email }}</a> }
          @if (l.linkedin) { <a [href]="l.linkedin" rel="me">LinkedIn</a> }
          @if (l.github) { <a [href]="l.github" rel="me">GitHub</a> }
        </p>
      </section>
    }
  `,
  styles: `
    .hero { margin-top: 72px; max-width: 720px; }
    .hero h1 { font-size: clamp(2.4rem, 6vw, 3.6rem); margin: 0.2em 0 0.3em; }
    .kicker { margin: 0; color: var(--accent); font-weight: 650; font-size: 0.95rem; }
    .cta { margin-top: 28px; }
    .links { display: flex; flex-wrap: wrap; gap: 20px; }
    @media (max-width: 560px) { .hero { margin-top: 40px; } }
  `,
})
export class Home {
  protected readonly site = SITE;
  protected readonly firstName = SITE.name.split(' ')[0];

  constructor() {
    inject(Seo).set({ title: SITE.name, description: SITE.intro, path: '/' });
  }
}
