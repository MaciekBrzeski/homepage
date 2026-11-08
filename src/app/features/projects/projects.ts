import { Component, inject } from '@angular/core';
import { Seo } from '../../core/seo';
import { SITE } from '../../core/site';
import { ProjectCard } from './project-card/project-card';

@Component({
  selector: 'app-projects',
  imports: [ProjectCard],
  templateUrl: './projects.html',
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
