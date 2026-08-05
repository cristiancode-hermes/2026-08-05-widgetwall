import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state text-center py-12 px-6">
      <div class="text-5xl mb-4">{{ icon() }}</div>
      <h3 class="text-lg font-semibold text-ink mb-2">{{ title() }}</h3>
      @if (description()) {
        <p class="text-sm text-ink-secondary mb-6 max-w-sm mx-auto">{{ description() }}</p>
      }
      @if (actionLabel()) {
        <button
          class="btn-primary px-5 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors cursor-pointer"
          (click)="action.emit()"
        >
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .empty-state {
        border: 2px dashed var(--color-border);
        border-radius: var(--radius-lg);
        background: var(--color-surface);
      }

      .btn-primary {
        border: none;
      }
    `,
  ],
})
export class EmptyStateComponent {
  readonly icon = input<string>('📦');
  readonly title = input<string>('Nothing here yet');
  readonly description = input<string>('');
  readonly actionLabel = input<string>('');
  readonly action = output<void>();
}
