import { Component, inject, input, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ExportFormat, ReportsApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { extractHttpError } from '../../../core/utils/http-error.util';

@Component({
  selector: 'app-export-buttons',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="export-actions">
      <button type="button" class="btn-secondary" [disabled]="busy()" (click)="download('xlsx')">
        {{ 'COMMON.EXPORT_EXCEL' | translate }}
      </button>
      <button type="button" class="btn-secondary" [disabled]="busy()" (click)="download('pdf')">
        {{ 'COMMON.EXPORT_PDF' | translate }}
      </button>
    </div>
  `,
})
export class ExportButtonsComponent {
  /** Report segment under /api/reports, e.g. "foreign-reserve". */
  readonly report = input.required<string>();
  readonly filters = input<Record<string, unknown>>({});
  readonly fileName = input('report');

  private readonly api = inject(ReportsApiService);
  private readonly toast = inject(ToastService);

  readonly busy = signal(false);

  download(format: ExportFormat): void {
    this.busy.set(true);
    this.api.export(this.report(), format, this.filters()).subscribe({
      next: (blob) => {
        this.busy.set(false);
        this.saveBlob(blob, `${this.fileName()}.${format}`);
      },
      error: (err) => {
        this.busy.set(false);
        this.toast.error(extractHttpError(err));
      },
    });
  }

  private saveBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}
