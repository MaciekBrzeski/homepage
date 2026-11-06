import { Component, inject } from '@angular/core';
import { Seo } from '../seo';
import { SITE } from '../site';
import { ProjectCard } from '../ui/project-card';

@Component({
  selector: 'app-projects',
  imports: [ProjectCard],
  template: `
    <div class="page">
      <h1 class="page-title">Projects</h1>
      <p class="lead">
        Things I build outside client work, mostly around testing, LLM agents and small hardware.
      </p>
      <div class="grid">
        @for (p of projects; track p.title) {
          <app-project-card [project]="p" />
        }
      </div>
    </div>
  `,
})
export class Projects {
  protected readonly projects = SITE.projects;

  constructor() {
    inject(Seo).set({
      title: `Projects · ${SITE.name}`,
      description: 'Side projects: testing tools, LLM agents, edge AI.',
      path: '/projects/',
    });
  }
}
