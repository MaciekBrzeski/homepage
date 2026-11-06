import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Seo } from '../seo';
import { SITE } from '../site';

@Component({
  selector: 'app-about',
  imports: [RouterLink, MatButtonModule, MatCardModule, MatChipsModule, MatIconModule],
  template: `
    <div class="page">
      <section class="hero">
        <p class="kicker">{{ site.role }}</p>
        <h1 class="page-title">Hi, I'm {{ firstName }}.</h1>
        <p class="where"><mat-icon inline>location_on</mat-icon> {{ site.location }}</p>
        @for (para of site.summary; track $index) {
          <p class="summary">{{ para }}</p>
        }
        <div class="actions">
          @if (site.links.linkedin; as href) {
            <a matButton="filled" [href]="href" target="_blank" rel="me noopener">
              <mat-icon svgIcon="linkedin" /> LinkedIn
            </a>
          }
          @if (site.links.github; as href) {
            <a matButton="outlined" [href]="href" target="_blank" rel="me noopener">
              <mat-icon svgIcon="github" /> GitHub
            </a>
          }
          <a matButton routerLink="/games"><mat-icon>sports_esports</mat-icon> Play my games</a>
        </div>
      </section>

      <section class="highlights" aria-label="Highlights">
        @for (h of site.highlights; track h.value) {
          <mat-card appearance="filled">
            <mat-card-content>
              <div class="value">{{ h.value }}</div>
              <div class="label">{{ h.label }}</div>
            </mat-card-content>
          </mat-card>
        }
      </section>

      <h2 class="section-title">Experience</h2>
      <ol class="timeline">
        @for (job of site.experience; track job.role) {
          <li>
            <mat-card appearance="outlined">
              <mat-card-header>
                <mat-card-title
                  >{{ job.role }}
                  @if (job.org) {
                    · {{ job.org }}
                  }
                </mat-card-title>
                <mat-card-subtitle
                  >{{ job.period }}
                  @if (job.place) {
                    · {{ job.place }}
                  }
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                @if (job.ladder) {
                  <p class="ladder">{{ job.ladder }}</p>
                }
                <ul>
                  @for (pt of job.points; track $index) {
                    <li>{{ pt }}</li>
                  }
                </ul>
              </mat-card-content>
            </mat-card>
          </li>
        }
      </ol>

      <h2 class="section-title">Skills</h2>
      <div class="skills">
        @for (s of site.skills; track s.group) {
          <div class="skill-group">
            <h3>{{ s.group }}</h3>
            <mat-chip-set [attr.aria-label]="s.group">
              @for (item of s.items; track item) {
                <mat-chip>{{ item }}</mat-chip>
              }
            </mat-chip-set>
          </div>
        }
      </div>

      <div class="two">
        <section>
          <h2 class="section-title">Education</h2>
          <ul class="plain">
            @for (e of site.education; track e.title) {
              <li>
                <strong>{{ e.title }}</strong
                ><br /><span class="muted">{{ e.org }} · {{ e.period }}</span>
              </li>
            }
          </ul>
        </section>
        <section>
          <h2 class="section-title">Languages</h2>
          <ul class="plain">
            @for (l of site.languages; track l.name) {
              <li>
                <strong>{{ l.name }}</strong
                ><br /><span class="muted">{{ l.level }}</span>
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
      margin: 0 0 8px;
      color: var(--mat-sys-primary);
      font: var(--mat-sys-title-small);
    }
    .where {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 0 0 20px;
      color: var(--mat-sys-on-surface-variant);
    }
    .summary {
      margin: 0 0 14px;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 24px;
    }
    .highlights {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      margin-top: 40px;
    }
    .value {
      font: var(--mat-sys-headline-medium);
      color: var(--mat-sys-primary);
    }
    .label {
      color: var(--mat-sys-on-surface-variant);
      margin-top: 4px;
    }
    .timeline {
      list-style: none;
      margin: 0;
      padding: 0 0 0 20px;
      border-left: 2px solid var(--mat-sys-outline-variant);
    }
    .timeline > li {
      position: relative;
      margin-bottom: 16px;
    }
    .timeline > li::before {
      content: '';
      position: absolute;
      left: -28px;
      top: 22px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--mat-sys-primary);
      border: 3px solid var(--mat-sys-surface);
    }
    .ladder {
      margin: 4px 0 8px;
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface-variant);
    }
    ul {
      margin: 0;
      padding-left: 20px;
    }
    ul li {
      margin: 4px 0;
    }
    .skills {
      display: grid;
      gap: 20px 32px;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
    .skill-group h3 {
      font: var(--mat-sys-title-small);
      margin: 0 0 8px;
      color: var(--mat-sys-on-surface-variant);
    }
    .two {
      display: grid;
      gap: 0 32px;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }
    .plain {
      list-style: none;
      padding: 0;
    }
    .plain li {
      margin: 0 0 14px;
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
