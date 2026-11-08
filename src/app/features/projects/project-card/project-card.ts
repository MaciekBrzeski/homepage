import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Project } from '../../../core/site';

@Component({
  selector: 'app-project-card',
  imports: [MatIconModule],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  readonly project = input.required<Project>();
}
