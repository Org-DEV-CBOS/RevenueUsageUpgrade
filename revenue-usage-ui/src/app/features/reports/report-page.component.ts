import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { PagedResponse } from '../../core/models/common.model';
import { ReportsApiService } from '../../core/services/api.service';
import { LanguageService } from '../../core/services/language.service';
import { monthsAgo, today } from '../../core/utils/date.util';
import { extractHttpError } from '../../core/utils/http-error.util';
import { ExportButtonsComponent } from '../../shared/components/export-buttons/export-buttons.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

export type ReportEndpoint =
  | 'foreign-reserve'
  | 'obligations'
  | 'credit-movements'
  | 'debit-movements'
  | 'resources'
  | 'correspondent-balances';

export interface ReportColumn {
  key: string;
  label: string;
  format?: 'money' | 'date' | 'localizedField';
  enKey?: string;
  arKey?: string;
}

export interface ReportConfig {
  titleKey: string;
  endpoint: ReportEndpoint;
  columns: ReportColumn[];
  /** `required` seeds a default range because the endpoint rejects missing dates. */
  dateRange: 'required' | 'optional' | 'none';
  search?: boolean;
  statusFilter?: boolean;
}

@Component({
  selector: 'app-report-page',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, PaginationComponent, ExportButtonsComponent],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ (config?.titleKey ?? '') | translate }}</h1>
        <app-export-buttons
          [report]="config?.endpoint ?? ''"
          [filters]="exportFilters()"
          [fileName]="config?.endpoint ?? 'report'"
        />
      </div>

      <div class="filter-bar">
        @if (config?.dateRange !== 'none') {
          <label>
            {{ 'COMMON.FROM_DATE' | translate }}
            <input type="date" [formControl]="startDate" />
          </label>
          <label>
            {{ 'COMMON.TO_DATE' | translate }}
            <input type="date" [formControl]="endDate" />
          </label>
        }
        @if (config?.search) {
          <label class="grow">
            {{ 'COMMON.SEARCH' | translate }}
            <input type="search" [formControl]="search" (keyup.enter)="applyFilters()" />
          </label>
        }
        @if (config?.statusFilter) {
          <label>
            {{ 'TRANSFERS.STATUS' | translate }}
            <select [formControl]="status">
              <option value="">{{ 'COMMON.ALL' | translate }}</option>
              <option value="Open">{{ 'OBLIGATIONS.STATUS_OPEN' | translate }}</option>
              <option value="Paid">{{ 'OBLIGATIONS.STATUS_PAID' | translate }}</option>
              <option value="Overdue">{{ 'OBLIGATIONS.STATUS_OVERDUE' | translate }}</option>
            </select>
          </label>
        }
        <div class="filter-actions">
          <button type="button" class="btn-primary" (click)="applyFilters()">{{ 'COMMON.APPLY' | translate }}</button>
        </div>
      </div>

      @if (error()) { <div class="error-banner">{{ error() }}</div> }

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
                  @for (column of config?.columns ?? []; track column.key) {
                    <th>{{ column.label | translate }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of rows(); track $index) {
                  <tr>
                    @for (column of config?.columns ?? []; track column.key) {
                      <td [class.money]="column.format === 'money'">{{ formatCell(row, column) }}</td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <app-pagination
        [page]="page()"
        [pageSize]="pageSize()"
        [totalCount]="totalCount()"
        (pageChange)="goToPage($event)"
        (pageSizeChange)="changePageSize($event)"
      />
    </div>
  `,
})
export class ReportPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ReportsApiService);
  private readonly language = inject(LanguageService);
  private readonly fb = inject(FormBuilder);

  config: ReportConfig | null = null;

  readonly loading = signal(false);
  readonly error = signal('');
  readonly rows = signal<Record<string, unknown>[]>([]);
  readonly page = signal(1);
  readonly pageSize = signal(25);
  readonly totalCount = signal(0);

  readonly startDate = this.fb.nonNullable.control('');
  readonly endDate = this.fb.nonNullable.control('');
  readonly search = this.fb.nonNullable.control('');
  readonly status = this.fb.nonNullable.control('');

  ngOnInit(): void {
    this.config = this.route.snapshot.data['report'] as ReportConfig;

    if (this.config?.dateRange === 'required') {
      this.startDate.setValue(monthsAgo(1));
      this.endDate.setValue(today());
    }

    this.load();
  }

  exportFilters(): Record<string, unknown> {
    return this.filters();
  }

  applyFilters(): void {
    this.page.set(1);
    this.load();
  }

  goToPage(page: number): void {
    this.page.set(page);
    this.load();
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
    this.load();
  }

  formatCell(row: Record<string, unknown>, column: ReportColumn): string {
    if (column.format === 'localizedField') {
      const isArabic = this.language.currentLanguage() === 'ar';
      const primary = String(row[isArabic ? (column.arKey ?? '') : (column.enKey ?? '')] ?? '').trim();
      const fallback = String(row[isArabic ? (column.enKey ?? '') : (column.arKey ?? '')] ?? '').trim();
      return primary || fallback;
    }

    const value = row[column.key];
    if (value === null || value === undefined || value === '') {
      return '';
    }

    if (column.format === 'money') {
      const amount = Number(value);
      return Number.isFinite(amount)
        ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
        : String(value);
    }

    if (column.format === 'date') {
      const date = new Date(String(value));
      return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
    }

    return String(value);
  }

  private filters(): Record<string, unknown> {
    const filters: Record<string, unknown> = {};
    if (this.config?.dateRange !== 'none') {
      if (this.startDate.value) filters['startDate'] = this.startDate.value;
      if (this.endDate.value) filters['endDate'] = this.endDate.value;
    }
    if (this.config?.search && this.search.value) {
      filters['searchValue'] = this.search.value;
    }
    if (this.config?.statusFilter && this.status.value) {
      filters['status'] = this.status.value;
    }
    return filters;
  }

  private load(): void {
    const request = this.resolveRequest();
    if (!request) {
      return;
    }

    this.loading.set(true);
    this.error.set('');
    request.subscribe({
      next: (data) => {
        this.rows.set(data.items ?? []);
        this.totalCount.set(data.totalCount ?? 0);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(extractHttpError(err));
      },
    });
  }

  private resolveRequest(): Observable<PagedResponse<Record<string, unknown>>> | null {
    const paging = { page: this.page(), pageSize: this.pageSize() };
    const start = this.startDate.value;
    const end = this.endDate.value;
    const searchValue = this.search.value || undefined;

    switch (this.config?.endpoint) {
      case 'foreign-reserve':
        return this.cast(this.api.getForeignReserve(start, end, paging));
      case 'obligations':
        return this.cast(
          this.api.getObligationsReport({
            startDate: start || undefined,
            endDate: end || undefined,
            status: this.status.value || undefined,
            ...paging,
          }),
        );
      case 'credit-movements':
        return this.cast(this.api.getCreditMovements(start, end, { searchValue, ...paging }));
      case 'debit-movements':
        return this.cast(this.api.getDebitMovements(start, end, { searchValue, ...paging }));
      case 'resources':
        return this.cast(
          this.api.getResourcesReport({ startDate: start || undefined, endDate: end || undefined, ...paging }),
        );
      case 'correspondent-balances':
        return this.cast(this.api.getCorrespondentBalancesReport({ searchValue, ...paging }));
      default:
        return null;
    }
  }

  private cast(source: Observable<PagedResponse<unknown>>): Observable<PagedResponse<Record<string, unknown>>> {
    return source as Observable<PagedResponse<Record<string, unknown>>>;
  }
}

export const REPORT_CONFIGS = {
  foreignReserve: {
    titleKey: 'NAV.FOREIGN_RESERVE',
    endpoint: 'foreign-reserve',
    dateRange: 'required',
    columns: [
      { key: 'reportDate', label: 'TRANSFERS.DATE', format: 'date' },
      { key: 'correspondentBalancesUsd', label: 'STATEMENTS.CORRESPONDENT_BALANCES', format: 'money' },
      { key: 'cashInHandUsd', label: 'RESERVES.CASH', format: 'money' },
      { key: 'goldValueUsd', label: 'RESERVES.GOLD', format: 'money' },
      { key: 'depositsUsd', label: 'RESERVES.DEPOSITS', format: 'money' },
      { key: 'resourcesUsd', label: 'RESOURCES.TITLE', format: 'money' },
      { key: 'usagesUsd', label: 'REPORTS.USAGES', format: 'money' },
      { key: 'grandTotalUsd', label: 'RESERVES.TOTAL', format: 'money' },
    ],
  },
  obligations: {
    titleKey: 'NAV.OBLIGATIONS',
    endpoint: 'obligations',
    dateRange: 'optional',
    statusFilter: true,
    columns: [
      { key: 'clientName', label: 'OBLIGATIONS.CLIENT' },
      { key: 'clientType', label: 'OBLIGATIONS.CLIENT_TYPE' },
      { key: 'obligationType', label: 'OBLIGATIONS.OBLIGATION_TYPE' },
      { key: 'currencySymbol', label: 'CURRENCIES.SHORT_NAME' },
      { key: 'totalAmount', label: 'OBLIGATIONS.TOTAL', format: 'money' },
      { key: 'paidAmount', label: 'OBLIGATIONS.PAID', format: 'money' },
      { key: 'remainingAmount', label: 'OBLIGATIONS.REMAINING', format: 'money' },
      { key: 'dueDate', label: 'OBLIGATIONS.DUE_DATE', format: 'date' },
      { key: 'status', label: 'TRANSFERS.STATUS' },
    ],
  },
  creditMovements: {
    titleKey: 'REPORTS.CREDIT_MOVEMENTS',
    endpoint: 'credit-movements',
    dateRange: 'required',
    search: true,
    columns: [
      { key: 'groupName', label: 'RESOURCES.TYPE' },
      { key: 'totalAmount', label: 'TRANSFERS.AMOUNT', format: 'money' },
    ],
  },
  debitMovements: {
    titleKey: 'REPORTS.DEBIT_MOVEMENTS',
    endpoint: 'debit-movements',
    dateRange: 'required',
    search: true,
    columns: [
      { key: 'groupName', label: 'NAV.BENEFICIARIES' },
      { key: 'totalAmount', label: 'TRANSFERS.AMOUNT', format: 'money' },
    ],
  },
  resources: {
    titleKey: 'REPORTS.RESOURCES_SUMMARY',
    endpoint: 'resources',
    dateRange: 'optional',
    columns: [
      { key: 'resourceTypeName', label: 'RESOURCES.TYPE' },
      { key: 'totalAmount', label: 'TRANSFERS.AMOUNT', format: 'money' },
    ],
  },
  correspondentBalances: {
    titleKey: 'NAV.BALANCES',
    endpoint: 'correspondent-balances',
    dateRange: 'none',
    search: true,
    columns: [
      { key: 'correspondentNameEn', label: 'NAV.CORRESPONDENTS' },
      { key: 'currencySymbol', label: 'CURRENCIES.SHORT_NAME' },
      { key: 'accountNumber', label: 'ACCOUNTS.NUMBER' },
      { key: 'currentBalance', label: 'ACCOUNTS.BALANCE', format: 'money' },
    ],
  },
} satisfies Record<string, ReportConfig>;
