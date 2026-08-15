import { Component, OnInit, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export interface DataColumn {
  key: string;
  label: string;
}

@Component({
  selector: 'app-data-table-page',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ title | translate }}</h1>
        @if (error()) {
          <span class="error-text">{{ error() }}</span>
        }
      </div>

      <div class="panel">
        @if (loading()) {
          <p>{{ 'COMMON.LOADING' | translate }}</p>
        } @else if (!rows().length) {
          <p>{{ 'COMMON.NO_DATA' | translate }}</p>
        } @else {
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  @for (column of columns; track column.key) {
                    <th>{{ column.label | translate }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of rows(); track $index) {
                  <tr>
                    @for (column of columns; track column.key) {
                      <td>{{ formatCell(row, column.key) }}</td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class DataTablePageComponent implements OnInit {
  title = 'DASHBOARD.TITLE';
  columns: DataColumn[] = [];
  loader!: () => import('rxjs').Observable<unknown[] | Record<string, unknown>[]>;

  readonly loading = signal(false);
  readonly error = signal('');
  readonly rows = signal<Record<string, unknown>[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    if (!this.loader) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.loader().subscribe({
      next: (data) => {
        const items = Array.isArray(data) ? data : [data as Record<string, unknown>];
        this.rows.set(items as Record<string, unknown>[]);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'COMMON.ERROR');
      },
    });
  }

  formatCell(row: Record<string, unknown>, key: string): string {
    const value = row[key];
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }
}
