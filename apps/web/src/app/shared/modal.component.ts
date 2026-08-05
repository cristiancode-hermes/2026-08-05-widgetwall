import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="modal-overlay" (click)="closeOverlay($event)">
        <div class="modal-content bg-surface rounded-lg shadow-lg" role="dialog" [attr.aria-label]="title()">
          <div class="modal-header flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 class="text-lg font-semibold text-ink">{{ title() }}</h2>
            <button
              class="modal-close text-ink-secondary hover:text-ink text-xl leading-none cursor-pointer bg-transparent border-none p-1"
              (click)="close.emit()"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div class="modal-body px-6 py-4">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: var(--space-md);
      }

      .modal-content {
        width: 100%;
        max-width: 500px;
        max-height: 85vh;
        overflow-y: auto;
        border: 1px solid var(--color-border);
      }

      .modal-close {
        line-height: 1;
      }
    `,
  ],
  host: {
    '(keydown.escape)': 'close.emit()',
  },
})
export class ModalComponent {
  readonly title = input<string>('');
  readonly visible = input<boolean>(false);
  readonly close = output<void>();

  closeOverlay(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close.emit();
    }
  }
}
