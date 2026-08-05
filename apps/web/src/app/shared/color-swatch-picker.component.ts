import { Component, model } from '@angular/core';

const COLOR_PRESETS = [
  { name: 'indigo', hex: '#4F46E5' },
  { name: 'violet', hex: '#7C3AED' },
  { name: 'amber', hex: '#D97706' },
  { name: 'emerald', hex: '#059669' },
  { name: 'rose', hex: '#E11D48' },
  { name: 'sky', hex: '#0284C7' },
  { name: 'teal', hex: '#0D9488' },
  { name: 'orange', hex: '#EA580C' },
];

@Component({
  selector: 'app-color-swatch-picker',
  standalone: true,
  template: `
    <div class="swatch-grid flex flex-wrap gap-2">
      @for (swatch of swatches; track swatch.hex) {
        <button
          class="swatch-btn w-8 h-8 rounded-full border-2 transition-all cursor-pointer"
          [style.background-color]="swatch.hex"
          [class.selected]="selectedHex() === swatch.hex"
          [style.border-color]="selectedHex() === swatch.hex ? 'var(--color-ink)' : 'transparent'"
          [title]="swatch.name"
          (click)="selectSwatch(swatch.hex)"
        ></button>
      }
    </div>
  `,
  styles: [
    `
      .swatch-btn {
        padding: 0;
      }

      .swatch-btn.selected {
        transform: scale(1.15);
        box-shadow: 0 0 0 2px var(--color-surface);
      }
    `,
  ],
})
export class ColorSwatchPickerComponent {
  readonly selectedHex = model<string>('#4F46E5');
  readonly swatches = COLOR_PRESETS;

  selectSwatch(hex: string) {
    this.selectedHex.set(hex);
  }
}
