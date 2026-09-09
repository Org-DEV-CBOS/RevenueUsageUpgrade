import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged } from 'rxjs';
import { CrossRate, Deal } from '../../core/models/common.model';
import { CurrenciesApiService, DealsApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { LookupCacheService } from '../../core/services/lookup-cache.service';
import { ToastService } from '../../core/services/toast.service';
import { today } from '../../core/utils/date.util';
import { getFieldError, markFormTouched } from '../../core/utils/form-errors.util';
import { extractHttpError } from '../../core/utils/http-error.util';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';
import { bindLiveFilter } from '../../core/utils/live-filter.util';
import { MoneyInputComponent } from '../../shared/components/money-input/money-input.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SearchSelectComponent } from '../../shared/components/search-select/search-select.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

@Component({
  selector: 'app-deal-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
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
        <h1>{{ 'NAV.DEALING' | translate }}</h1>
        <a routerLink="/app/deals/create" class="btn-primary">{{ 'DEALS.ADD' | translate }}</a>
      </div>

      <app-filter-bar [(startDate)]="startDate" [(endDate)]="endDate" (filtersChange)="applyFilters()">
        <label>
          {{ 'NAV.ACCOUNTS' | translate }}
          <app-search-select [options]="lookups.accountOptions()" [formControl]="accountControl" />
        </label>
      </app-filter-bar>

      @if (error()) { <div class="error-banner">{{ error() }}</div> }

      <div class="panel">
        @if (loading()) {
          <p>{{ 'COMMON.LOADING' | translate }}</p>
        } @else if (!items().length) {
          <p>{{ 'COMMON.NO_DATA' | translate }}</p>
        } @else {
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ 'TRANSFERS.DATE' | translate }}</th>
                  <th>{{ 'DEALS.FROM_ACCOUNT' | translate }}</th>
                  <th>{{ 'DEALS.FROM_AMOUNT' | translate }}</th>
                  <th>{{ 'EXCHANGE_RATES.RATE' | translate }}</th>
                  <th>{{ 'DEALS.TO_ACCOUNT' | translate }}</th>
                  <th>{{ 'DEALS.TO_AMOUNT' | translate }}</th>
                  <th>{{ 'TRANSFERS.REFERENCE' | translate }}</th>
                  <th>{{ 'COMMON.ACTIONS' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (item of items(); track item.dealId) {
                  <tr>
                    <td>{{ item.transactionDate | date: 'mediumDate' }}</td>
                    <td>{{ item.fromCorrespondentName }}</td>
                    <td class="money">{{ item.fromAmount | money }} {{ item.fromCurrencySymbol }}</td>
                    <td class="money">{{ item.exchangeRate | number: '1.5-5' }}</td>
                    <td>{{ item.toCorrespondentName }}</td>
                    <td class="money">{{ item.toAmount | money }} {{ item.toCurrencySymbol }}</td>
                    <td>{{ item.referenceNo }}</td>
                    <td>
                      <button type="button" class="btn-icon danger" (click)="confirmDelete(item)">🗑</button>
                    </td>
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
export class DealListComponent implements OnInit {
  private readonly api = inject(DealsApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);
  readonly lookups = inject(LookupCacheService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly items = signal<Deal[]>([]);
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);

  startDate = signal('');
  endDate = signal('');
  readonly accountControl = this.fb.nonNullable.control('');

  ngOnInit(): void {
    this.lookups.loadAccounts();
    bindLiveFilter(this.destroyRef, () => this.applyFilters(), this.accountControl);
    this.load();
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

  async confirmDelete(item: Deal): Promise<void> {
    if (!(await this.confirm.confirmDelete())) return;
    this.api.delete(item.dealId).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('COMMON.DELETED'));
        this.lookups.refreshAccounts();
        this.load();
      },
      error: (err) => this.toast.error(extractHttpError(err)),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api
      .getPaged({
        page: this.page(),
        pageSize: this.pageSize(),
        startDate: this.startDate(),
        endDate: this.endDate(),
        correspondentAccountId: this.accountControl.value,
      })
      .subscribe({
        next: (data) => {
          this.items.set(data.items ?? []);
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

/**
 * A deal converts between two currencies, so the destination list excludes the source
 * currency. The published rate for the pair is offered as a starting point, but the dealer
 * can override it because the agreed rate is what settles.
 */
@Component({
  selector: 'app-deal-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DecimalPipe,
    TranslatePipe,
    SearchSelectComponent,
    MoneyInputComponent,
    MoneyPipe,
  ],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'DEALS.ADD' | translate }}</h1>
        <a routerLink="/app/deals" class="btn-secondary">{{ 'COMMON.BACK' | translate }}</a>
      </div>

      @if (error()) { <div class="error-banner">{{ error() }}</div> }

      <form class="form-panel wide" [formGroup]="form" (ngSubmit)="save()">
        <label [class.invalid]="isInvalid('fromAccountId')">
          {{ 'DEALS.FROM_ACCOUNT' | translate }} *
          <app-search-select formControlName="fromAccountId" [options]="lookups.accountOptions()" />
          @if (fromAccount(); as account) {
            <span class="hint">
              {{ 'ACCOUNTS.BALANCE' | translate }}: {{ account.currentBalance | money }}
              {{ lookups.currencySymbol(account) }}
            </span>
          }
          @if (fieldError('fromAccountId'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>

        <label [class.invalid]="isInvalid('toAccountId')">
          {{ 'DEALS.TO_ACCOUNT' | translate }} *
          <app-search-select formControlName="toAccountId" [options]="destinationOptions()" />
          @if (!form.controls.fromAccountId.value) {
            <span class="hint">{{ 'COVERAGES.PICK_SOURCE_FIRST' | translate }}</span>
          }
          @if (fieldError('toAccountId'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>

        <label [class.invalid]="isInvalid('transactionDate')">
          {{ 'TRANSFERS.DATE' | translate }} *
          <input type="date" formControlName="transactionDate" [max]="maxDate" />
          <span class="hint">{{ 'DEALS.DATE_DRIVES_RATE' | translate }}</span>
          @if (fieldError('transactionDate'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>

        <label [class.invalid]="isInvalid('fromAmount')">
          {{ 'DEALS.FROM_AMOUNT' | translate }} *
          <app-money-input formControlName="fromAmount" />
          @if (exceedsBalance()) {
            <span class="field-error">{{ 'TRANSFERS.EXCEEDS_BALANCE' | translate }}</span>
          }
          @if (fieldError('fromAmount'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>

        <label [class.invalid]="isInvalid('exchangeRate')">
          {{ 'EXCHANGE_RATES.RATE' | translate }} *
          <input type="number" step="0.00001" min="0" formControlName="exchangeRate" />
          @if (suggestedRate(); as rate) {
            <span class="hint">
              {{ 'DEALS.SUGGESTED_RATE' | translate }}: {{ rate | number: '1.5-5' }}
              @if (rateNarration(); as narration) {
                <em>({{ narration }} {{ 'DEALS.VIA_USD' | translate }})</em>
              }
            </span>
          } @else if (rateUnavailable()) {
            <span class="hint warning">{{ 'DEALS.NO_RATE_FOR_DATE' | translate }}</span>
          }
          @if (fieldError('exchangeRate'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>

        <label>
          {{ 'DEALS.TO_AMOUNT' | translate }}
          <input [value]="convertedAmount()" readonly />
          <span class="hint">{{ 'DEALS.TO_AMOUNT_HINT' | translate }}</span>
        </label>

        <label class="full-width">
          {{ 'TRANSFERS.REFERENCE' | translate }}
          <input formControlName="referenceNo" maxlength="100" />
        </label>

        <label class="full-width">
          {{ 'COMMON.NARRATION' | translate }}
          <input formControlName="narration" maxlength="500" />
        </label>

        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="saving()">{{ 'COMMON.SAVE' | translate }}</button>
        </div>
      </form>
    </div>
  `,
})
export class DealFormComponent implements OnInit {
  private readonly api = inject(DealsApiService);
  private readonly currenciesApi = inject(CurrenciesApiService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly lookups = inject(LookupCacheService);

  readonly saving = signal(false);
  readonly error = signal('');
  readonly suggestedRate = signal<number | null>(null);
  readonly rateUnavailable = signal(false);
  /** Shows how a cross rate was derived, e.g. "0.27230 / 1.08400 via USD". */
  readonly rateNarration = signal('');
  readonly maxDate = today();

  private readonly fromAccountId = signal('');
  private readonly amount = signal<number | null>(null);
  private readonly rate = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    fromAccountId: ['', Validators.required],
    toAccountId: ['', Validators.required],
    fromAmount: [null as number | null, [Validators.required, Validators.min(0.0001)]],
    exchangeRate: [null as number | null, [Validators.required, Validators.min(0.0000001)]],
    transactionDate: [today(), Validators.required],
    referenceNo: [''],
    narration: [''],
  });

  readonly destinationOptions = computed(() => {
    const source = this.lookups.findAccount(this.fromAccountId());
    if (!source) {
      return [];
    }
    return this.lookups
      .accounts()
      .filter((a) => a.currencyId !== source.currencyId)
      .map((a) => ({ value: a.correspondentAccountId, label: this.lookups.accountLabel(a) }));
  });

  readonly convertedAmount = computed(() => {
    const amount = this.amount();
    const rate = this.rate();
    if (!amount || !rate) {
      return '';
    }
    const target = this.lookups.findAccount(this.form.controls.toAccountId.value);
    const value = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount * rate);
    return target ? `${value} ${this.lookups.currencySymbol(target)}` : value;
  });

  ngOnInit(): void {
    this.lookups.loadAccounts();

    // distinctUntilChanged so only a genuine source change clears the destination.
    this.form.controls.fromAccountId.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((accountId) => {
        this.fromAccountId.set(accountId);
        this.form.controls.toAccountId.setValue('');
        this.clearRate();
      });

    this.form.controls.toAccountId.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => this.loadSuggestedRate());

    // The deal is priced on its transaction date, so changing the date re-prices it.
    this.form.controls.transactionDate.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => this.loadSuggestedRate());

    this.form.controls.fromAmount.valueChanges.subscribe((value) => this.amount.set(value));
    this.form.controls.exchangeRate.valueChanges.subscribe((value) => this.rate.set(value));
  }

  fromAccount() {
    return this.lookups.findAccount(this.form.controls.fromAccountId.value);
  }

  exceedsBalance(): boolean {
    const account = this.fromAccount();
    const amount = this.form.controls.fromAmount.value;
    return !!account && !!amount && amount > account.currentBalance;
  }

  fieldError(field: string): string | null {
    return getFieldError(this.form, field, this.translate);
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.touched && control.invalid;
  }

  save(): void {
    markFormTouched(this.form);
    if (this.form.invalid) {
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.api.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('COMMON.SUCCESS'));
        this.lookups.refreshAccounts();
        this.router.navigateByUrl('/app/deals');
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(extractHttpError(err));
      },
    });
  }

  private clearRate(): void {
    this.suggestedRate.set(null);
    this.rateNarration.set('');
    this.rateUnavailable.set(false);
  }

  /**
   * Prices the deal for its transaction date. Rates are only published against USD,
   * so the server derives the pair through the dollar and returns both legs.
   */
  private loadSuggestedRate(): void {
    const from = this.fromAccount();
    const to = this.lookups.findAccount(this.form.controls.toAccountId.value);
    const asOfDate = this.form.controls.transactionDate.value;
    if (!from || !to || !asOfDate) {
      this.clearRate();
      return;
    }

    this.currenciesApi.getCrossRate(from.currencyId, to.currencyId, asOfDate).subscribe({
      next: (response) => {
        const rate = response?.rateValue ?? null;
        this.suggestedRate.set(rate);
        this.rateUnavailable.set(rate === null);
        this.rateNarration.set(this.describeRate(response));

        // Overwrite on a date change so the form always reflects the chosen date;
        // the field stays editable for a negotiated rate.
        if (rate !== null) {
          this.form.controls.exchangeRate.setValue(rate);
        }
      },
      error: () => {
        this.clearRate();
        this.rateUnavailable.set(true);
      },
    });
  }

  private describeRate(response: CrossRate | null): string {
    if (!response?.fromRateToUsd || !response?.toRateToUsd) {
      return '';
    }
    if (response.toRateToUsd === 1) {
      return '';
    }

    const format = (value: number) =>
      new Intl.NumberFormat('en-US', { minimumFractionDigits: 5, maximumFractionDigits: 5 }).format(
        value,
      );
    return `${format(response.fromRateToUsd)} / ${format(response.toRateToUsd)}`;
  }
}
