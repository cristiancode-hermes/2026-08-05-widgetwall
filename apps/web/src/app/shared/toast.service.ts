import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastId = 0;
  readonly queue = signal<Toast[]>([]);

  add(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) {
    const id = ++this.toastId;
    this.queue.update((q) => [...q, { id, message, type, duration }]);

    setTimeout(() => {
      this.queue.update((q) => q.filter((t) => t.id !== id));
    }, duration);

    return id;
  }

  success(message: string) {
    return this.add(message, 'success');
  }

  error(message: string) {
    return this.add(message, 'error');
  }

  info(message: string) {
    return this.add(message, 'info');
  }

  remove(id: number) {
    this.queue.update((q) => q.filter((t) => t.id !== id));
  }
}
