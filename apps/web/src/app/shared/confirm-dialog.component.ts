import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="confirm-overlay" (click)="cancelOverlay($event)">
        <div class="confirm-content bg-surface rounded-lg shadow-lg px-6 py-5" role="alertdialog">
          <h3 class="text-lg font-semibold text-ink mb-2">{{ title() }}</h3>
          @if (message()) {
            <p class="text-sm text-ink-secondary mb-5">{{ message() }}</p>
          }
          <div class="flex justify-end gap-3">
            <button
              class="btn-cancel px-4 py-2 rounded-lg border border-border text-ink font-medium text-sm hover:bg-surface-secondary transition-colors cursor-pointer bg-surface"
              (click)="cancel.emit()"
            >
              Cancel
            </button>
            <button
              class="btn-confirm px-4 py-2 rounded-lg text-white font-medium text-sm transition-colors cursor-pointer border-none"
              [class.bg-danger]="danger()"
              [class.bg-primary]="!danger()"
              (click)="confirm.emit()"
            >
              {{ confirmLabel() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .confirm-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1100;
        padding: var(--space-md);
      }

      .confirm-content {
        width: 100%;
        max-width: 400px;
        border: 1px solid var(--color-border);
      }
    `,
  ],
  host: {
    '(keydown.escape)': 'cancel.emit()',
  },
})
export class ConfirmDialogComponent {
  readonly title = input<string>('Confirm');
  readonly message = input<string>('');
  readonly confirmLabel = input<string>('Confirm');
  readonly danger = input<boolean>(false);
  readonly visible = input<boolean>(false);
  readonly confirm = output<void>();
  readonly cancel = output<void>();

  cancelOverlay(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('confirm-overlay')) {
      this.cancel.emit();
    }
  }
}
