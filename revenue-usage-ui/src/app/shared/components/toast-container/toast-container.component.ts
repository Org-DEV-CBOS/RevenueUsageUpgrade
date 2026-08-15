import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-stack">
      @for (toast of toastService.messages(); track toast.id) {
        <div class="toast" [class]="toast.type">
          <span>{{ toast.message }}</span>
          <button type="button" (click)="toastService.dismiss(toast.id)">×</button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
