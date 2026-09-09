import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import {
  AccountStatementRow,
  CurrencyStatementRow,
  FinalBankPosition,
} from '../../core/models/common.model';
import { TransfersApiService } from '../../core/services/api.service';
import { LookupCacheService } from '../../core/services/lookup-cache.service';
import { monthsAgo, today } from '../../core/utils/date.util';
import { extractHttpError } from '../../core/utils/http-error.util';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SearchSelectComponent } from '../../shared/components/search-select/search-select.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

interface StatementDay {
  date: string;
  rows: AccountStatementRow[];
  closingBalance: number;
  /** False when a page boundary cuts the day short, so its balance is not the day's yet. */
  closed: boolean;
}

/** Running-balance ledger for one correspondent account across every movement type. */
@Component({
  selector: 'app-account-statement',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    TranslatePipe,
    MoneyPipe,
    PaginationComponent,
    FilterBarComponent,
    SearchSelectComponent,
  ],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'STATEMENTS.ACCOUNT' | translate }}</h1>
      </div>

      <app-filter-bar [(startDate)]="startDate" [(endDate)]="endDate" (filtersChange)="applyFilters()">
        <label class="grow">
          {{ 'NAV.ACCOUNTS' | translate }}
          <app-search-select [options]="lookups.accountOptions()" [formControl]="accountControl" />
        </label>
      </app-filter-bar>

      @if (error()) { <div class="error-banner">{{ error() }}</div> }

      <div class="panel">
        @if (!accountControl.value) {
          <p>{{ 'STATEMENTS.PICK_ACCOUNT' | translate }}</p>
        } @else if (loading()) {
          <p>{{ 'COMMON.LOADING' | translate }}</p>
        } @else if (!rows().length) {
          <p>{{ 'COMMON.NO_DATA' | translate }}</p>
        } @else {
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ 'STATEMENTS.TIME' | translate }}</th>
                  <th>{{ 'STATEMENTS.EVENT' | translate }}</th>
                  <th>{{ 'STATEMENTS.IN' | translate }}</th>
                  <th>{{ 'STATEMENTS.OUT' | translate }}</th>
                  <th>{{ 'STATEMENTS.RUNNING_BALANCE' | translate }}</th>
                  <th>{{ 'RESOURCES.NOTES' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @if (openingRow(); as opening) {
                  <tr class="statement-opening">
                    <td colspan="4">{{ 'STATEMENTS.OPENING_BALANCE' | translate }}</td>
                    <td class="money">{{ opening.runningBalance | money }}</td>
                    <td></td>
                  </tr>
                }
                @for (day of days(); track day.date) {
                  <tr class="statement-day">
                    <th colspan="6" scope="rowgroup">{{ day.date | date: 'fullDate' }}</th>
                  </tr>
                  @for (row of day.rows; track $index) {
                    <tr>
                      <td class="statement-time">{{ row.eventTime | date: 'shortTime' }}</td>
                      <td>{{ row.eventType }}</td>
                      <td class="money">{{ row.amountIn ? (row.amountIn | money) : '' }}</td>
                      <td class="money">{{ row.amountOut ? (row.amountOut | money) : '' }}</td>
                      <td class="money">{{ row.runningBalance | money }}</td>
                      <td>{{ row.notes }}</td>
                    </tr>
                  }
                  @if (day.closed) {
                    <tr class="statement-closing">
                      <td colspan="4">{{ 'STATEMENTS.CLOSING_BALANCE' | translate }}</td>
                      <td class="money">{{ day.closingBalance | money }}</td>
                      <td></td>
                    </tr>
                  }
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
export class AccountStatementComponent implements OnInit {
  private readonly api = inject(TransfersApiService);
  private readonly fb = inject(FormBuilder);
  readonly lookups = inject(LookupCacheService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly rows = signal<AccountStatementRow[]>([]);
  readonly page = signal(1);
  readonly pageSize = signal(25);
  readonly totalCount = signal(0);

  startDate = signal(monthsAgo(1));
  endDate = signal(today());
  readonly accountControl = this.fb.nonNullable.control('');

  /** The brought-forward balance the API puts ahead of the movements, on the first page only. */
  readonly openingRow = computed(() => this.rows().find((row) => row.isOpening) ?? null);

  readonly days = computed<StatementDay[]>(() => {
    const groups: StatementDay[] = [];

    for (const row of this.rows()) {
      if (row.isOpening) {
        continue;
      }

      const date = (row.eventDate ?? '').slice(0, 10);
      const current = groups.at(-1);
      if (current?.date === date) {
        current.rows.push(row);
        current.closingBalance = row.runningBalance;
      } else {
        groups.push({ date, rows: [row], closingBalance: row.runningBalance, closed: true });
      }
    }

    // The last day on the page may continue onto the next one, and a day that is still
    // running has no closing balance to state.
    const lastDay = groups.at(-1);
    if (lastDay && this.page() * this.pageSize() < this.totalCount()) {
      lastDay.closed = false;
    }

    return groups;
  });

  ngOnInit(): void {
    this.lookups.loadAccounts();
    this.accountControl.valueChanges.subscribe(() => this.applyFilters());
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

  private load(): void {
    const accountId = this.accountControl.value;
    if (!accountId) {
      this.rows.set([]);
      this.totalCount.set(0);
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.api
      .getCorrespondentAccountStatement({
        correspondentAccountId: accountId,
        startDate: this.startDate(),
        endDate: this.endDate(),
        page: this.page(),
        pageSize: this.pageSize(),
      })
      .subscribe({
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
}

/** Every account holding a given currency, with its inflow and outflow totals as of a date. */
@Component({
  selector: 'app-currency-statement',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    MoneyPipe,
    PaginationComponent,
    SearchSelectComponent,
  ],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'STATEMENTS.CURRENCY' | translate }}</h1>
      </div>

      <div class="filter-bar">
        <label class="grow">
          {{ 'NAV.CURRENCIES' | translate }}
          <app-search-select [options]="lookups.currencyOptions()" [formControl]="currencyControl" />
        </label>
        <label>
          {{ 'STATEMENTS.AS_OF' | translate }}
          <input type="date" [formControl]="asOfControl" [max]="maxDate" />
        </label>
        <div class="filter-actions">
          <button type="button" class="btn-primary" (click)="applyFilters()">{{ 'COMMON.APPLY' | translate }}</button>
        </div>
      </div>

      @if (error()) { <div class="error-banner">{{ error() }}</div> }

      <div class="panel">
        @if (!currencyControl.value) {
          <p>{{ 'STATEMENTS.PICK_CURRENCY' | translate }}</p>
        } @else if (loading()) {
          <p>{{ 'COMMON.LOADING' | translate }}</p>
        } @else if (!rows().length) {
          <p>{{ 'COMMON.NO_DATA' | translate }}</p>
        } @else {
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ 'ACCOUNTS.NUMBER' | translate }}</th>
                  <th>{{ 'NAV.CORRESPONDENTS' | translate }}</th>
                  <th>{{ 'RESOURCES.TITLE' | translate }}</th>
                  <th>{{ 'STATEMENTS.COVERAGE_IN' | translate }}</th>
                  <th>{{ 'STATEMENTS.COVERAGE_OUT' | translate }}</th>
                  <th>{{ 'STATEMENTS.CONFIRMED_TRANSFERS' | translate }}</th>
                  <th>{{ 'ACCOUNTS.BALANCE' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (row of rows(); track row.correspondentAccountId) {
                  <tr>
                    <td>{{ row.accountNumber }}</td>
                    <td>{{ row.accountName }}</td>
                    <td class="money">{{ row.totalResources | money }}</td>
                    <td class="money">{{ row.totalCoverageIn | money }}</td>
                    <td class="money">{{ row.totalCoverageOut | money }}</td>
                    <td class="money">{{ row.totalConfirmedTransfers | money }}</td>
                    <td class="money">{{ row.currentBalance | money }}</td>
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
export class CurrencyStatementComponent implements OnInit {
  private readonly api = inject(TransfersApiService);
  private readonly fb = inject(FormBuilder);
  readonly lookups = inject(LookupCacheService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly rows = signal<CurrencyStatementRow[]>([]);
  readonly page = signal(1);
  readonly pageSize = signal(25);
  readonly totalCount = signal(0);
  readonly maxDate = today();

  readonly currencyControl = this.fb.nonNullable.control('');
  readonly asOfControl = this.fb.nonNullable.control(today());

  ngOnInit(): void {
    this.lookups.loadCurrencies();
    this.currencyControl.valueChanges.subscribe(() => this.applyFilters());
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

  private load(): void {
    const currencyId = this.currencyControl.value;
    if (!currencyId) {
      this.rows.set([]);
      this.totalCount.set(0);
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.api
      .getCurrencyStatement(currencyId, this.asOfControl.value, {
        page: this.page(),
        pageSize: this.pageSize(),
      })
      .subscribe({
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
}

/** Bank-wide net position on a date: correspondent balances plus cash and gold on hand. */
@Component({
  selector: 'app-bank-position',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, MoneyPipe],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'STATEMENTS.BANK_POSITION' | translate }}</h1>
      </div>

      <div class="filter-bar">
        <label>
          {{ 'STATEMENTS.AS_OF' | translate }}
          <input type="date" [formControl]="dateControl" [max]="maxDate" />
        </label>
        <div class="filter-actions">
          <button type="button" class="btn-primary" (click)="load()">{{ 'COMMON.APPLY' | translate }}</button>
        </div>
      </div>

      @if (error()) { <div class="error-banner">{{ error() }}</div> }

      @if (loading()) {
        <p>{{ 'COMMON.LOADING' | translate }}</p>
      } @else if (position(); as data) {
        <div class="summary-cards">
          <div class="summary-card">
            <span>{{ 'STATEMENTS.CORRESPONDENT_BALANCES' | translate }}</span>
            <strong>{{ data.totalCorrespondentBalancesUsd | money }}</strong>
          </div>
          <div class="summary-card">
            <span>{{ 'RESERVES.CASH' | translate }}</span>
            <strong>{{ data.cashInHandUsd | money }}</strong>
          </div>
          <div class="summary-card">
            <span>{{ 'RESERVES.GOLD' | translate }}</span>
            <strong>{{ data.goldValueUsd | money }}</strong>
          </div>
          <div class="summary-card">
            <span>{{ 'STATEMENTS.NET_POSITION' | translate }}</span>
            <strong>{{ data.bankNetPositionUsd | money }}</strong>
          </div>
        </div>
      }
    </div>
  `,
})
export class BankPositionComponent implements OnInit {
  private readonly api = inject(TransfersApiService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly position = signal<FinalBankPosition | null>(null);
  readonly maxDate = today();

  readonly dateControl = this.fb.nonNullable.control(today());

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getFinalBankPosition(this.dateControl.value).subscribe({
      next: (data) => {
        this.position.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(extractHttpError(err));
      },
    });
  }
}
