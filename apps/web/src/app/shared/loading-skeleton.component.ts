import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  template: `
    @for (_ of [].constructor(count()); track $index) {
      @switch (type()) {
        @case ('card') {
          <div class="skeleton-card bg-surface rounded-lg shadow-md p-4">
            <div class="skeleton-line w-3/4 h-4 mb-3"></div>
            <div class="skeleton-line w-full h-3 mb-2"></div>
            <div class="skeleton-line w-5/6 h-3 mb-2"></div>
            <div class="skeleton-line w-2/3 h-3"></div>
          </div>
        }
        @case ('circle') {
          <div class="skeleton-circle mx-auto" [style.width.px]="48" [style.height.px]="48"></div>
        }
        @default {
          <div class="skeleton-line w-full h-4 mb-2" [style.width.%]="getRandomWidth()"></div>
        }
      }
    }
  `,
  styles: [
    `
      .skeleton-line {
        background: linear-gradient(
          90deg,
          var(--color-border) 25%,
          color-mix(in srgb, var(--color-border) 50%, transparent) 50%,
          var(--color-border) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s ease-in-out infinite;
        border-radius: var(--radius-sm);
      }

      .skeleton-card {
        border: 1px solid var(--color-border);
      }

      .skeleton-circle {
        background: linear-gradient(
          90deg,
          var(--color-border) 25%,
          color-mix(in srgb, var(--color-border) 50%, transparent) 50%,
          var(--color-border) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s ease-in-out infinite;
        border-radius: var(--radius-full);
      }

      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `,
  ],
})
export class LoadingSkeletonComponent {
  readonly type = input<'card' | 'line' | 'circle'>('line');
  readonly count = input<number>(3);

  getRandomWidth(): number {
    return 40 + Math.floor(Math.random() * 50);
  }
}
