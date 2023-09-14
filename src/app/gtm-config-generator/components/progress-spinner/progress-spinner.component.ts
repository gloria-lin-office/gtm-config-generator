import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

enum ProgressSpinnerColor {
  primary = 'primary',
  accent = 'accent',
  warn = 'warn',
}

@Component({
  selector: 'app-progress-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule, CommonModule],
  template: `
    <div class="progress">
      <div class="progress__state">
        <mat-progress-spinner
          mode="determinate"
          [value]="getRatio()"
          [color]="color"
          [diameter]="50"
          [strokeWidth]="10"
        ></mat-progress-spinner>
        <p>Parsed tags: {{ numParsedTags }} / {{ numTotalTags }}</p>
      </div>
      <div class="progress__description">
        <p>
          This progress bar shows the number of successfully parsed events.
          Please refer to the bottom of the page for the list of the
          failed-to-parse tags.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .progress {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;

        &__state {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 1rem;
          flex: 1 1 0;
        }

        &__description {
          flex: 2 1 0;
        }
      }
    `,
  ],
})
export class ProgressSpinnerComponent {
  @Input() numParsedTags: number | null = null;
  @Input() numTotalTags: number | null = null;
  @Input() color: ProgressSpinnerColor = ProgressSpinnerColor.primary;

  getRatio() {
    if (this.numParsedTags === null || this.numTotalTags === null) return;
    return (this.numParsedTags / this.numTotalTags) * 100;
  }
}
