import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Project } from '../site';

@Component({
  selector: 'app-project-card',
  imports: [MatIconModule],
  template: `
    @let p = project();
    <article class="paper">
      <header>
        <span class="badge halftone" aria-hidden="true"
          ><mat-icon>{{ p.icon }}</mat-icon></span
        >
        <div>
          <h2>{{ p.title }}</h2>
          <p class="sub">{{ p.tag }}</p>
        </div>
      </header>
      <p class="text">{{ p.text }}</p>
      @if (p.href) {
        <a class="more" [href]="p.href" target="_blank" rel="noopener">
          View on GitHub <mat-icon inline>open_in_new</mat-icon>
        </a>
      }
    </article>
  `,
  styles: `
    :host {
      display: block;
    }
    .paper {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    header {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .badge {
      flex: none;
      display: grid;
      place-items: center;
      width: 46px;
      height: 46px;
      border: 2px solid var(--ink);
      border-radius: 50%;
      color: var(--ink);
    }
    h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .sub {
      margin: 2px 0 0;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--red);
    }
    .text {
      margin: 14px 0 0;
      color: var(--ink-soft);
      line-height: 1.5;
    }
    .more {
      margin-top: auto;
      padding-top: 14px;
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-weight: 800;
    }
  `,
})
export class ProjectCard {
  readonly project = input.required<Project>();
}
