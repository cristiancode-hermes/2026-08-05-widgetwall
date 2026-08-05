import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-stack">
      @for (toast of toastService.queue(); track toast.id) {
        <div
          class="toast-item flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all"
          [class.toast-success]="toast.type === 'success'"
          [class.toast-error]="toast.type === 'error'"
          [class.toast-info]="toast.type === 'info'"
        >
          <span class="toast-icon text-lg">
            @if (toast.type === 'success') { ✓ }
            @else if (toast.type === 'error') { ✕ }
            @else { ℹ }
          </span>
          <span class="flex-1">{{ toast.message }}</span>
          <button
            class="toast-close text-current opacity-60 hover:opacity-100 bg-transparent border-none cursor-pointer text-sm p-0 leading-none"
            (click)="toastService.remove(toast.id)"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-stack {
        position: fixed;
        bottom: var(--space-lg);
        right: var(--space-lg);
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        z-index: 2000;
        max-width: 360px;
      }

      .toast-item {
        border: 1px solid;
        animation: slide-in 200ms ease-out both;
      }

      .toast-success {
        background: color-mix(in srgb, var(--color-success) 15%, var(--color-surface));
        border-color: var(--color-success);
        color: var(--color-success);
      }

      .toast-error {
        background: color-mix(in srgb, var(--color-danger) 15%, var(--color-surface));
        border-color: var(--color-danger);
        color: var(--color-danger);
      }

      .toast-info {
        background: color-mix(in srgb, var(--color-primary) 15%, var(--color-surface));
        border-color: var(--color-primary);
        color: var(--color-primary);
      }

      @keyframes slide-in {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `,
  ],
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
