import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  template: `
    <div class="error-state text-center py-12 px-6">
      <div class="text-5xl mb-4">⚠️</div>
      <h3 class="text-lg font-semibold text-ink mb-2">Something went wrong</h3>
      @if (message()) {
        <p class="text-sm text-danger mb-6 max-w-sm mx-auto">{{ message() }}</p>
      }
      @if (retryLabel()) {
        <button
          class="btn-retry px-5 py-2.5 rounded-lg border border-border text-ink font-medium text-sm hover:bg-surface-secondary transition-colors cursor-pointer"
          (click)="retry.emit()"
        >
          {{ retryLabel() }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .error-state {
        border: 2px dashed var(--color-danger);
        border-radius: var(--radius-lg);
        background: color-mix(in srgb, var(--color-danger) 5%, var(--color-surface));
      }

      .btn-retry {
        background: var(--color-surface);
      }
    `,
  ],
})
export class ErrorStateComponent {
  readonly message = input<string>('');
  readonly retryLabel = input<string>('Try again');
  readonly retry = output<void>();
}
