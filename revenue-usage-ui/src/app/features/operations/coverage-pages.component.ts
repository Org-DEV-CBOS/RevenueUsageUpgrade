import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged } from 'rxjs';
import { Coverage } from '../../core/models/common.model';
import { CoveragesApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { LookupCacheService } from '../../core/services/lookup-cache.service';
import { ToastService } from '../../core/services/toast.service';
import { today } from '../../core/utils/date.util';
import { getFieldError, markFormTouched } from '../../core/utils/form-errors.util';
import { extractHttpError } from '../../core/utils/http-error.util';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';
import { MoneyInputComponent } from '../../shared/components/money-input/money-input.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SearchSelectComponent } from '../../shared/components/search-select/search-select.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

@Component({
  selector: 'app-coverage-list',
  standalone: true,
  imports: [
    RouterLink,
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
        <h1>{{ 'NAV.REPLENISHMENTS' | translate }}</h1>
        <a routerLink="/app/coverages/create" class="btn-primary">{{ 'COVERAGES.ADD' | translate }}</a>
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
                  <th>{{ 'COVERAGES.FROM_ACCOUNT' | translate }}</th>
                  <th>{{ 'COVERAGES.TO_ACCOUNT' | translate }}</th>
                  <th>{{ 'TRANSFERS.AMOUNT' | translate }}</th>
                  <th>{{ 'TRANSFERS.REFERENCE' | translate }}</th>
                  <th>{{ 'COMMON.NARRATION' | translate }}</th>
                  <th>{{ 'COMMON.ACTIONS' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (item of items(); track item.coverageId) {
                  <tr>
                    <td>{{ item.transactionDate | date: 'mediumDate' }}</td>
                    <td>{{ item.fromCorrespondentName }}</td>
                    <td>{{ item.toCorrespondentName }}</td>
                    <td class="money">{{ item.amount | money }} {{ item.currencySymbol }}</td>
                    <td>{{ item.referenceNo }}</td>
                    <td>{{ item.narration }}</td>
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
export class CoverageListComponent implements OnInit {
  private readonly api = inject(CoveragesApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);
  readonly lookups = inject(LookupCacheService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly items = signal<Coverage[]>([]);
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);

  startDate = signal('');
  endDate = signal('');
  readonly accountControl = this.fb.nonNullable.control('');

  ngOnInit(): void {
    this.lookups.loadAccounts();
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

  async confirmDelete(item: Coverage): Promise<void> {
    if (!(await this.confirm.confirmDelete())) return;
    this.api.delete(item.coverageId).subscribe({
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
 * A coverage moves money between two accounts holding the same currency, so picking the
 * source pins the currency and the destination list is narrowed to match.
 */
@Component({
  selector: 'app-coverage-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, SearchSelectComponent, MoneyInputComponent, MoneyPipe],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'COVERAGES.ADD' | translate }}</h1>
        <a routerLink="/app/coverages" class="btn-secondary">{{ 'COMMON.BACK' | translate }}</a>
      </div>

      @if (error()) { <div class="error-banner">{{ error() }}</div> }

      <form class="form-panel wide" [formGroup]="form" (ngSubmit)="save()">
        <label [class.invalid]="isInvalid('fromAccountId')">
          {{ 'COVERAGES.FROM_ACCOUNT' | translate }} *
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
          {{ 'COVERAGES.TO_ACCOUNT' | translate }} *
          <app-search-select formControlName="toAccountId" [options]="destinationOptions()" />
          @if (!form.controls.fromAccountId.value) {
            <span class="hint">{{ 'COVERAGES.PICK_SOURCE_FIRST' | translate }}</span>
          }
          @if (fieldError('toAccountId'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>

        <label [class.invalid]="isInvalid('amount')">
          {{ 'TRANSFERS.AMOUNT' | translate }} *
          <app-money-input formControlName="amount" />
          @if (exceedsBalance()) {
            <span class="field-error">{{ 'TRANSFERS.EXCEEDS_BALANCE' | translate }}</span>
          }
          @if (fieldError('amount'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>

        <label [class.invalid]="isInvalid('transactionDate')">
          {{ 'TRANSFERS.DATE' | translate }} *
          <input type="date" formControlName="transactionDate" />
          @if (fieldError('transactionDate'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>

        <label>
          {{ 'TRANSFERS.REFERENCE' | translate }}
          <input formControlName="referenceNo" maxlength="100" />
        </label>

        <label>
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
export class CoverageFormComponent implements OnInit {
  private readonly api = inject(CoveragesApiService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly lookups = inject(LookupCacheService);

  readonly saving = signal(false);
  readonly error = signal('');
  private readonly fromAccountId = signal('');

  readonly form = this.fb.nonNullable.group({
    fromAccountId: ['', Validators.required],
    toAccountId: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.0001)]],
    transactionDate: [today(), Validators.required],
    referenceNo: [''],
    narration: [''],
  });

  readonly destinationOptions = computed(() => {
    const source = this.lookups.findAccount(this.fromAccountId());
    if (!source) {
      return [];
    }
    return this.lookups.accountOptions({
      currencyId: source.currencyId,
      excludeId: source.correspondentAccountId,
    });
  });

  ngOnInit(): void {
    this.lookups.loadAccounts();

    // distinctUntilChanged so only a genuine source change clears the destination.
    this.form.controls.fromAccountId.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((accountId) => {
        this.fromAccountId.set(accountId);
        this.form.controls.toAccountId.setValue('');
      });
  }

  fromAccount() {
    return this.lookups.findAccount(this.form.controls.fromAccountId.value);
  }

  exceedsBalance(): boolean {
    const account = this.fromAccount();
    const amount = this.form.controls.amount.value;
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
        this.router.navigateByUrl('/app/coverages');
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(extractHttpError(err));
      },
    });
  }
}
