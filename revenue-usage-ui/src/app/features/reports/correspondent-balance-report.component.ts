import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CorrespondentBalanceReport } from '../../core/models/common.model';
import { LanguageService } from '../../core/services/language.service';
import { ReportsApiService } from '../../core/services/api.service';
import { today } from '../../core/utils/date.util';
import { extractHttpError } from '../../core/utils/http-error.util';
import { ExportButtonsComponent } from '../../shared/components/export-buttons/export-buttons.component';
import { SearchFieldComponent } from '../../shared/components/search-field/search-field.component';
import { bindLiveFilter } from '../../core/utils/live-filter.util';

/**
 * Both correspondent balance reports. The route's `usdOnly` flag collapses every currency
 * a correspondent holds into one USD column; otherwise each currency gets a column of its
 * own. The two share a layout, so they share a component.
 */
@Component({
  selector: 'app-correspondent-balance-report',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, ExportButtonsComponent, SearchFieldComponent],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ titleKey() | translate }}</h1>
        <app-export-buttons [report]="endpoint()" [filters]="filters()" [fileName]="endpoint()" />
      </div>

      <div class="filter-bar">
        <label>
          {{ 'STATEMENTS.AS_OF' | translate }}
          <input type="date" [formControl]="asOfDate" [max]="maxDate" />
        </label>
        <label class="grow">
          {{ 'COMMON.SEARCH' | translate }}
          <app-search-field [formControl]="search" />
        </label>
      </div>

      @if (error()) { <div class="error-banner">{{ error() }}</div> }

      @if (report(); as data) {
        @if (data.unconvertedCurrencyCount > 0) {
          <div class="warning-banner">
            {{ 'REPORTS.UNCONVERTED_WARNING' | translate: { count: data.unconvertedCurrencyCount } }}
          </div>
        }
      }

      <div class="panel">
        @if (loading()) {
          <p>{{ 'COMMON.LOADING' | translate }}</p>
        } @else if (!report()?.rows?.length) {
          <p>{{ 'COMMON.NO_DATA' | translate }}</p>
        } @else if (report(); as data) {
          <div class="table-scroll">
            <table class="data-table report-table">
              <thead>
                <tr>
                  <th>{{ 'REPORTS.CORRESPONDENT_NAME' | translate }}</th>
                  @for (currency of data.currencies; track currency) {
                    <th class="money">{{ currency }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of data.rows; track $index) {
                  <tr>
                    <td>{{ name(row.correspondentName, row.correspondentNameAr) }}</td>
                    @for (balance of row.balances; track $index) {
                      <td class="money">{{ amount(balance) }}</td>
                    }
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr>
                  <th>{{ 'REPORTS.TOTAL' | translate }}</th>
                  @for (total of data.currencyTotals; track $index) {
                    <td class="money">{{ amount(total, 3) }}</td>
                  }
                </tr>
                <tr>
                  <th>{{ 'REPORTS.TOTAL_IN_USD' | translate }}</th>
                  @for (total of data.currencyTotalsUsd; track $index) {
                    <td class="money">{{ amount(total, 3) }}</td>
                  }
                </tr>
              </tfoot>
            </table>
          </div>

          <table class="data-table report-table report-summary">
            <tbody>
              <tr>
                <th>{{ 'REPORTS.EQUIVALENT_USD' | translate }}</th>
                <td class="money">{{ figure(data.equivalentUsd) }}</td>
              </tr>
              <tr>
                <th>{{ 'REPORTS.PENDING_USD' | translate }}</th>
                <td class="money">{{ figure(data.pendingUsd) }}</td>
              </tr>
              <tr>
                <th>{{ 'REPORTS.NET_BALANCE' | translate }}</th>
                <td class="money">{{ figure(data.netBalanceUsd) }}</td>
              </tr>
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
})
export class CorrespondentBalanceReportComponent implements OnInit {
  readonly usdOnly = signal(false);

  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ReportsApiService);
  private readonly language = inject(LanguageService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly report = signal<CorrespondentBalanceReport | null>(null);
  readonly maxDate = today();

  readonly asOfDate = this.fb.nonNullable.control(today());
  readonly search = this.fb.nonNullable.control('');

  readonly titleKey = computed(() => (this.usdOnly() ? 'NAV.TOTAL_BALANCES' : 'NAV.BALANCES'));
  readonly endpoint = computed(() =>
    this.usdOnly() ? 'correspondent-total-balances' : 'correspondent-balances',
  );

  ngOnInit(): void {
    this.usdOnly.set(this.route.snapshot.data['usdOnly'] === true);
    bindLiveFilter(this.destroyRef, () => this.load(), this.asOfDate, this.search);
    this.load();
  }

  filters(): Record<string, unknown> {
    const filters: Record<string, unknown> = {};
    if (this.asOfDate.value) filters['asOfDate'] = this.asOfDate.value;
    if (this.search.value) filters['searchValue'] = this.search.value;
    return filters;
  }

  /** Nothing held reads as a dash, matching how these reports have always printed. */
  amount(value: number | null | undefined, decimals = 2): string {
    return value === null || value === undefined || value === 0 ? '-' : this.figure(value, decimals);
  }

  /** The figures under the matrix are always shown, a zero among them included. */
  figure(value: number, decimals = 2): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  name(en: string, ar?: string): string {
    const arabic = this.language.currentLanguage() === 'ar';
    const preferred = (arabic ? ar : en) ?? '';
    const fallback = (arabic ? en : ar) ?? '';
    return preferred.trim() || fallback.trim();
  }

  load(): void {
    const params = { asOfDate: this.asOfDate.value || undefined, searchValue: this.search.value || undefined };
    const request = this.usdOnly()
      ? this.api.getCorrespondentTotalBalancesReport(params)
      : this.api.getCorrespondentBalancesReport(params);

    this.loading.set(true);
    this.error.set('');
    request.subscribe({
      next: (data) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(extractHttpError(err));
      },
    });
  }
}
