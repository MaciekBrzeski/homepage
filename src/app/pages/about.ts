import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Seo } from '../seo';
import { SITE } from '../site';

@Component({
  selector: 'app-about',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="page">
      <section class="hero">
        <p class="kicker">
          <span class="pill">{{ site.role }}</span>
        </p>
        <h1 class="page-title">Hi, I'm {{ firstName }}.</h1>
        <p class="where muted"><mat-icon inline>location_on</mat-icon> {{ site.location }}</p>
        @for (para of site.summary; track $index) {
          <p class="summary">{{ para }}</p>
        }
        <div class="actions">
          @if (site.links.linkedin; as href) {
            <a matButton="filled" class="btn-paper" [href]="href" target="_blank" rel="me noopener">
              <mat-icon svgIcon="linkedin" /> LinkedIn
            </a>
          }
          @if (site.links.github; as href) {
            <a
              matButton="outlined"
              class="btn-paper"
              [href]="href"
              target="_blank"
              rel="me noopener"
            >
              <mat-icon svgIcon="github" /> GitHub
            </a>
          }
          <a matButton="outlined" class="btn-paper" routerLink="/games"
            ><mat-icon>sports_esports</mat-icon> Play my games</a
          >
        </div>
      </section>

      <section class="highlights tilt" aria-label="Highlights">
        @for (h of site.highlights; track h.value) {
          <div class="paper halftone">
            <div class="value">{{ h.value }}</div>
            <div class="label">{{ h.label }}</div>
          </div>
        }
      </section>

      <h2 class="section-title">Experience</h2>
      <ol class="timeline">
        @for (job of site.experience; track job.role) {
          <li>
            <article class="paper">
              <h3>
                {{ job.role }}
                @if (job.org) {
                  <span class="org">· {{ job.org }}</span>
                }
              </h3>
              <p class="when muted">
                {{ job.period }}
                @if (job.place) {
                  · {{ job.place }}
                }
              </p>
              @if (job.ladder) {
                <p class="ladder">{{ job.ladder }}</p>
              }
              <ul>
                @for (pt of job.points; track $index) {
                  <li>{{ pt }}</li>
                }
              </ul>
            </article>
          </li>
        }
      </ol>

      <h2 class="section-title">Skills</h2>
      <div class="skills tilt">
        @for (s of site.skills; track s.group) {
          <section class="paper skill-group" [attr.aria-label]="s.group">
            <h3>{{ s.group }}</h3>
            <ul class="tags">
              @for (item of s.items; track item) {
                <li class="tag">{{ item }}</li>
              }
            </ul>
          </section>
        }
      </div>

      <div class="two tilt">
        <section class="paper">
          <h2 class="card-title"><mat-icon>school</mat-icon> Education</h2>
          <ul class="plain">
            @for (e of site.education; track e.title) {
              <li>
                <strong>{{ e.title }}</strong>
                <span class="muted">{{ e.org }} · {{ e.period }}</span>
              </li>
            }
          </ul>
        </section>
        <section class="paper">
          <h2 class="card-title"><mat-icon>translate</mat-icon> Languages</h2>
          <ul class="plain">
            @for (l of site.languages; track l.name) {
              <li>
                <strong>{{ l.name }}</strong>
                <span class="muted">{{ l.level }}</span>
              </li>
            }
          </ul>
        </section>
      </div>
    </div>
  `,
  styles: `
    .hero {
      max-width: 760px;
    }
    .kicker {
      margin: 0 0 14px;
    }
    .where {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 0 0 20px;
    }
    .summary {
      margin: 0 0 14px;
      line-height: 1.6;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin-top: 28px;
    }
    .highlights {
      display: grid;
      gap: 32px;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      margin-top: 52px;
    }
    .value {
      font:
        600 2.2rem/1 Fredoka,
        Nunito,
        system-ui,
        sans-serif;
      -webkit-text-stroke: 1.5px var(--ink);
      color: var(--paper);
      paint-order: stroke fill;
      text-shadow: 2px 2px 0 var(--ink);
    }
    .label {
      margin-top: 10px;
      font-weight: 700;
      line-height: 1.35;
    }

    /* Cards hang on a dashed wire, like the targets in the gallery */
    .timeline {
      list-style: none;
      margin: 0;
      padding: 0 0 0 34px;
      position: relative;
    }
    .timeline::before {
      content: '';
      position: absolute;
      left: 10px;
      top: 8px;
      bottom: 8px;
      border-left: 3px dashed var(--muted);
    }
    .timeline > li {
      position: relative;
      margin-bottom: 30px;
    }
    .timeline > li::before {
      content: '★';
      position: absolute;
      left: -36px;
      top: 14px;
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      font-size: 1.9rem;
      line-height: 1;
      color: var(--mustard);
      -webkit-text-stroke: 1.5px var(--ink);
    }
    .timeline > li:nth-child(odd) > .paper {
      transform: rotate(-0.35deg);
    }
    .timeline > li:nth-child(even) > .paper {
      transform: rotate(0.3deg);
    }
    article h3 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
    }
    .org {
      color: var(--red);
    }
    .when {
      margin: 2px 0 10px;
      font-weight: 700;
      font-size: 0.95rem;
    }
    .ladder {
      display: inline-block;
      margin: 0 0 10px;
      padding: 4px 10px;
      font-size: 0.9rem;
      font-weight: 700;
      background: var(--mustard);
      border: 1.5px solid var(--ink);
      border-radius: 6px;
    }
    article ul {
      margin: 0;
      padding-left: 20px;
    }
    article li {
      margin: 6px 0;
      line-height: 1.5;
    }
    article li::marker {
      color: var(--red);
    }

    /* Masonry: each group keeps its natural height, no ragged empty cells */
    .skills {
      columns: 280px 3;
      column-gap: 32px;
    }
    .skill-group {
      break-inside: avoid;
      margin: 6px 6px 36px;
    }
    .skill-group h3 {
      margin: 0 0 12px;
      font-size: 1.1rem;
      font-weight: 600;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 9px 8px;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .two {
      display: grid;
      gap: 32px;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      margin-top: 28px;
    }
    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 14px;
      font-size: 1.3rem;
      font-weight: 600;
    }
    .card-title mat-icon {
      color: var(--red);
    }
    .plain {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .plain li {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 10px 0;
      border-top: 2px dotted rgba(27, 23, 51, 0.25);
    }
    .plain li:first-child {
      border-top: 0;
      padding-top: 0;
    }
  `,
})
export class About {
  protected readonly site = SITE;
  protected readonly firstName = SITE.name.split(' ')[0];

  constructor() {
    inject(Seo).set({
      title: `${SITE.name} · Frontend Engineer`,
      description: SITE.intro,
      path: '/',
    });
  }
}
