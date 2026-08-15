import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly messages = signal<ToastMessage[]>([]);

  success(message: string): void {
    this.push(message, 'success');
  }

  error(message: string): void {
    this.push(message, 'error');
  }

  info(message: string): void {
    this.push(message, 'info');
  }

  dismiss(id: number): void {
    this.messages.update((items) => items.filter((item) => item.id !== id));
  }

  private push(message: string, type: ToastMessage['type']): void {
    const id = ++this.counter;
    this.messages.update((items) => [...items, { id, message, type }]);

    setTimeout(() => this.dismiss(id), 4000);
  }
}
