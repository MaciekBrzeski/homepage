import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Theme, ThemeMode } from '../../core/theme';

@Component({
  selector: 'app-theme-toggle',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
})
export class ThemeToggle {
  protected readonly theme = inject(Theme);
  protected readonly options: { mode: ThemeMode; icon: string; label: string }[] = [
    { mode: 'light', icon: 'light_mode', label: 'Light' },
    { mode: 'system', icon: 'brightness_auto', label: 'Match system' },
    { mode: 'dark', icon: 'dark_mode', label: 'Dark' },
  ];
}
