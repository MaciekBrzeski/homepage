import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Project } from '../site';

@Component({
  selector: 'app-project-card',
  imports: [MatCardModule, MatIconModule],
  template: `
    @let p = project();
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-icon mat-card-avatar class="avatar">{{ p.icon }}</mat-icon>
        <mat-card-title>{{ p.title }}</mat-card-title>
        <mat-card-subtitle>{{ p.tag }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content
        ><p>{{ p.text }}</p></mat-card-content
      >
      @if (p.href) {
        <mat-card-actions>
          <a class="more" [href]="p.href" target="_blank" rel="noopener">
            View on GitHub <mat-icon inline>open_in_new</mat-icon>
          </a>
        </mat-card-actions>
      }
    </mat-card>
  `,
  styles: `
    :host {
      display: block;
    }
    mat-card {
      height: 100%;
    }
    .avatar {
      display: grid;
      place-items: center;
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
    }
    p {
      margin: 8px 0 0;
      color: var(--mat-sys-on-surface-variant);
    }
    mat-card-actions {
      margin-top: auto;
      padding: 8px 16px 16px;
    }
    .more {
      font: var(--mat-sys-label-large);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  `,
})
export class ProjectCard {
  readonly project = input.required<Project>();
}
