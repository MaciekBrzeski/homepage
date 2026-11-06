import { NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';
import { Project } from '../site';

@Component({
  selector: 'app-project-card',
  imports: [NgTemplateOutlet],
  template: `
    @let p = project();
    @if (p.href) {
      <a class="card pad" [href]="p.href">
        <ng-container *ngTemplateOutlet="inner" />
      </a>
    } @else {
      <div class="card pad"><ng-container *ngTemplateOutlet="inner" /></div>
    }
    <ng-template #inner>
      <div class="tag">{{ p.tag }}</div>
      <h3>{{ p.title }}</h3>
      <p>{{ p.text }}</p>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
    .pad {
      padding: 20px 22px;
      height: 100%;
    }
    .tag {
      font-size: 0.8rem;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
  `,
})
export class ProjectCard {
  readonly project = input.required<Project>();
}
