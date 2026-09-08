import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged } from 'rxjs';
import { ClientTypeCode, Obligation, ObligationStatement } from '../../core/models/common.model';
import { ObligationsApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { LookupCacheService } from '../../core/services/lookup-cache.service';
import { ToastService } from '../../core/services/toast.service';
import { today } from '../../core/utils/date.util';
import { getFieldError, markFormTouched } from '../../core/utils/form-errors.util';
import { extractHttpError } from '../../core/utils/http-error.util';
import { MoneyInputComponent } from '../../shared/components/money-input/money-input.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SearchSelectComponent } from '../../shared/components/search-select/search-select.component';
import { LocalizedFieldPipe } from '../../shared/pipes/localized-name.pipe';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

@Component({
  selector: 'app-obligation-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    ReactiveFormsModule,
    TranslatePipe,
    MoneyPipe,
    LocalizedFieldPipe,
    PaginationComponent,
  ],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'NAV.OBLIGATIONS' | translate }}</h1>
        <div class="toolbar-actions">
          <label class="inline-filter">
            <input type="checkbox" [formControl]="activeOnlyControl" />
            {{ 'OBLIGATIONS.OPEN_ONLY' | translate }}
          </label>
          <a routerLink="/app/obligations/create" class="btn-primary">{{ 'OBLIGATIONS.ADD' | translate }}</a>
        </div>
      </div>

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
                  <th>{{ 'OBLIGATIONS.CLIENT' | translate }}</th>
                  <th>{{ 'OBLIGATIONS.CLIENT_TYPE' | translate }}</th>
                  <th>{{ 'OBLIGATIONS.OBLIGATION_TYPE' | translate }}</th>
                  <th>{{ 'NAV.CURRENCIES' | translate }}</th>
                  <th>{{ 'OBLIGATIONS.TOTAL' | translate }}</th>
                  <th>{{ 'OBLIGATIONS.PAID' | translate }}</th>
                  <th>{{ 'OBLIGATIONS.REMAINING' | translate }}</th>
                  <th>{{ 'OBLIGATIONS.DUE_DATE' | translate }}</th>
                  <th>{{ 'COMMON.ACTIONS' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (item of items(); track item.obligationId) {
                  <tr>
                    <td>{{ item.obligationDate | date: 'mediumDate' }}</td>
                    <td>{{ item | localizedField: 'clientNameEn' : 'clientNameAr' }}</td>
                    <td>{{ item | localizedField: 'clientTypeNameEn' : 'clientTypeNameAr' }}</td>
                    <td>
                      {{
                        item.obligationTypeId
                          ? (item | localizedField: 'obligationTypeNameEn' : 'obligationTypeNameAr')
                          : '—'
                      }}
                    </td>
                    <td>{{ item | localizedField: 'currencyNameEn' : 'currencyNameAr' }}</td>
                    <td class="money">{{ item.totalAmount | money }}</td>
                    <td class="money">{{ item.paidAmount | money }}</td>
                    <td class="money">{{ item.remainingAmount | money }}</td>
                    <td>{{ item.dueDate ? (item.dueDate | date: 'mediumDate') : '—' }}</td>
                    <td>
                      <a [routerLink]="['/app/obligations', item.obligationId]" class="btn-icon" [title]="'OBLIGATIONS.STATEMENT' | translate">📄</a>
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
export class ObligationListComponent implements OnInit {
  private readonly api = inject(ObligationsApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly items = signal<Obligation[]>([]);
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);

  readonly activeOnlyControl = this.fb.nonNullable.control(false);

  ngOnInit(): void {
    this.activeOnlyControl.valueChanges.subscribe(() => {
      this.page.set(1);
      this.load();
    });
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

  async confirmDelete(item: Obligation): Promise<void> {
    if (!(await this.confirm.confirmDelete())) return;
    this.api.delete(item.obligationId).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('COMMON.DELETED'));
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
        activeOnly: this.activeOnlyControl.value,
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
 * The client is a bank or a company, and the client type decides which. A company also
 * needs an obligation type; a bank never has one. The backend rejects a request whose ids
 * do not match the chosen type, so the form swaps inputs to match.
 */
@Component({
  selector: 'app-obligation-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, SearchSelectComponent, MoneyInputComponent],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'OBLIGATIONS.ADD' | translate }}</h1>
        <a routerLink="/app/obligations" class="btn-secondary">{{ 'COMMON.BACK' | translate }}</a>
      </div>

      @if (error()) { <div class="error-banner">{{ error() }}</div> }

      <form class="form-panel wide" [formGroup]="form" (ngSubmit)="save()">
        <label [class.invalid]="isInvalid('clientTypeId')">
          {{ 'OBLIGATIONS.CLIENT_TYPE' | translate }} *
          <app-search-select formControlName="clientTypeId" [options]="lookups.clientTypeOptions()" />
          @if (fieldError('clientTypeId'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>

        @switch (clientTypeCode()) {
          @case ('BANK') {
            <label [class.invalid]="isInvalid('bankId')">
              {{ 'NAV.BANKS' | translate }} *
              <app-search-select formControlName="bankId" [options]="lookups.bankOptions()" />
              @if (fieldError('bankId'); as message) {
                <span class="field-error">{{ message }}</span>
              }
            </label>
          }
          @case ('COMPANY') {
            <label [class.invalid]="isInvalid('companyId')">
              {{ 'NAV.COMPANIES' | translate }} *
              <app-search-select formControlName="companyId" [options]="lookups.companyOptions()" />
              @if (fieldError('companyId'); as message) {
                <span class="field-error">{{ message }}</span>
              }
            </label>

            <label [class.invalid]="isInvalid('obligationTypeId')">
              {{ 'OBLIGATIONS.OBLIGATION_TYPE' | translate }} *
              <app-search-select
                formControlName="obligationTypeId"
                [options]="lookups.obligationTypeOptions()"
              />
              @if (fieldError('obligationTypeId'); as message) {
                <span class="field-error">{{ message }}</span>
              }
            </label>
          }
          @default {
            <p class="hint full-width">{{ 'OBLIGATIONS.PICK_CLIENT_TYPE' | translate }}</p>
          }
        }

        <label [class.invalid]="isInvalid('currencyId')">
          {{ 'NAV.CURRENCIES' | translate }} *
          <app-search-select formControlName="currencyId" [options]="lookups.currencyOptions()" />
          @if (fieldError('currencyId'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>

        <label [class.invalid]="isInvalid('totalAmount')">
          {{ 'OBLIGATIONS.TOTAL' | translate }} *
          <app-money-input formControlName="totalAmount" />
          @if (fieldError('totalAmount'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>

        <label [class.invalid]="isInvalid('obligationDate')">
          {{ 'TRANSFERS.DATE' | translate }} *
          <input type="date" formControlName="obligationDate" />
          @if (fieldError('obligationDate'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>

        <label>
          {{ 'OBLIGATIONS.DUE_DATE' | translate }}
          <input type="date" formControlName="dueDate" [min]="form.controls.obligationDate.value" />
        </label>

        <label>
          {{ 'TRANSFERS.REFERENCE' | translate }}
          <input formControlName="referenceNo" maxlength="100" />
        </label>

        <label class="full-width">
          {{ 'RESOURCES.NOTES' | translate }}
          <textarea rows="2" formControlName="notes" maxlength="500"></textarea>
        </label>

        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="saving()">{{ 'COMMON.SAVE' | translate }}</button>
        </div>
      </form>
    </div>
  `,
})
export class ObligationFormComponent implements OnInit {
  private readonly api = inject(ObligationsApiService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly lookups = inject(LookupCacheService);

  readonly saving = signal(false);
  readonly error = signal('');

  /** Empty until a client type is picked, which is what gates the rest of the client fields. */
  readonly clientTypeCode = signal<ClientTypeCode | undefined>(undefined);

  readonly form = this.fb.nonNullable.group({
    clientTypeId: ['', Validators.required],
    bankId: [''],
    companyId: [''],
    obligationTypeId: [''],
    currencyId: ['', Validators.required],
    totalAmount: [null as number | null, [Validators.required, Validators.min(0.0001)]],
    obligationDate: [today(), Validators.required],
    dueDate: [''],
    referenceNo: [''],
    notes: [''],
  });

  ngOnInit(): void {
    this.lookups.loadClientTypes();
    this.lookups.loadObligationTypes();
    this.lookups.loadBanks();
    this.lookups.loadCompanies();
    this.lookups.loadCurrencies();

    this.form.controls.clientTypeId.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((clientTypeId) => {
        this.clientTypeCode.set(this.lookups.clientTypeCode(clientTypeId));
        this.applyClientTypeValidators(this.clientTypeCode());
      });
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
    const value = this.form.getRawValue();
    const isBank = this.clientTypeCode() === 'BANK';
    this.api
      .create({
        clientTypeId: value.clientTypeId,
        bankId: isBank ? value.bankId || null : null,
        companyId: isBank ? null : value.companyId || null,
        obligationTypeId: isBank ? null : value.obligationTypeId || null,
        currencyId: value.currencyId,
        totalAmount: value.totalAmount,
        obligationDate: value.obligationDate,
        dueDate: value.dueDate || null,
        referenceNo: value.referenceNo || null,
        notes: value.notes || null,
      })
      .subscribe({
        next: () => {
          this.toast.success(this.translate.instant('COMMON.SUCCESS'));
          this.router.navigateByUrl('/app/obligations');
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(extractHttpError(err));
        },
      });
  }

  private applyClientTypeValidators(code: ClientTypeCode | undefined): void {
    const required = {
      bankId: code === 'BANK',
      companyId: code === 'COMPANY',
      obligationTypeId: code === 'COMPANY',
    };

    for (const [name, isRequired] of Object.entries(required)) {
      const control = this.form.get(name)!;
      control.setValidators(isRequired ? [Validators.required] : []);
      if (!isRequired) {
        control.setValue('');
      }
      control.updateValueAndValidity({ emitEvent: false });
    }
  }
}

/** Obligation detail: outstanding balance plus the payment history, with a way to pay. */
@Component({
  selector: 'app-obligation-detail',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    ReactiveFormsModule,
    TranslatePipe,
    MoneyPipe,
    LocalizedFieldPipe,
    SearchSelectComponent,
    MoneyInputComponent,
  ],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'OBLIGATIONS.STATEMENT' | translate }}</h1>
        <a routerLink="/app/obligations" class="btn-secondary">{{ 'COMMON.BACK' | translate }}</a>
      </div>

      @if (error()) { <div class="error-banner">{{ error() }}</div> }

      @if (statement(); as data) {
        <div class="summary-cards">
          <div class="summary-card">
            <span>{{ 'OBLIGATIONS.CLIENT' | translate }}</span>
            <strong>{{ data.obligation | localizedField: 'clientNameEn' : 'clientNameAr' }}</strong>
          </div>
          <div class="summary-card">
            <span>{{ 'OBLIGATIONS.CLIENT_TYPE' | translate }}</span>
            <strong>{{ data.obligation | localizedField: 'clientTypeNameEn' : 'clientTypeNameAr' }}</strong>
          </div>
          @if (data.obligation.obligationTypeId) {
            <div class="summary-card">
              <span>{{ 'OBLIGATIONS.OBLIGATION_TYPE' | translate }}</span>
              <strong>{{
                data.obligation | localizedField: 'obligationTypeNameEn' : 'obligationTypeNameAr'
              }}</strong>
            </div>
          }
          <div class="summary-card">
            <span>{{ 'OBLIGATIONS.TOTAL' | translate }}</span>
            <strong>{{ data.obligation.totalAmount | money }}</strong>
          </div>
          <div class="summary-card">
            <span>{{ 'OBLIGATIONS.PAID' | translate }}</span>
            <strong>{{ data.obligation.paidAmount | money }}</strong>
          </div>
          <div class="summary-card">
            <span>{{ 'OBLIGATIONS.REMAINING' | translate }}</span>
            <strong>{{ data.obligation.remainingAmount | money }}</strong>
          </div>
        </div>

        @if (data.obligation.remainingAmount > 0) {
          <form class="form-panel wide" [formGroup]="paymentForm" (ngSubmit)="pay()">
            <h2 class="full-width">{{ 'OBLIGATIONS.ADD_PAYMENT' | translate }}</h2>

            <label [class.invalid]="isInvalid('correspondentAccountId')">
              {{ 'NAV.ACCOUNTS' | translate }} *
              <app-search-select
                formControlName="correspondentAccountId"
                [options]="payableAccountOptions()"
              />
              <span class="hint">{{ 'OBLIGATIONS.SAME_CURRENCY_HINT' | translate }}</span>
              @if (fieldError('correspondentAccountId'); as message) {
                <span class="field-error">{{ message }}</span>
              }
            </label>

            <label [class.invalid]="isInvalid('amount')">
              {{ 'TRANSFERS.AMOUNT' | translate }} *
              <app-money-input formControlName="amount" />
              @if (fieldError('amount'); as message) {
                <span class="field-error">{{ message }}</span>
              }
            </label>

            <label [class.invalid]="isInvalid('paymentDate')">
              {{ 'TRANSFERS.DATE' | translate }} *
              <input type="date" formControlName="paymentDate" />
            </label>

            <label>
              {{ 'TRANSFERS.REFERENCE' | translate }}
              <input formControlName="referenceNo" maxlength="100" />
            </label>

            <label class="full-width">
              {{ 'RESOURCES.NOTES' | translate }}
              <input formControlName="notes" maxlength="500" />
            </label>

            <div class="form-actions">
              <button type="submit" class="btn-primary" [disabled]="saving()">
                {{ 'OBLIGATIONS.PAY' | translate }}
              </button>
            </div>
          </form>
        }

        <div class="panel">
          <h2>{{ 'OBLIGATIONS.PAYMENTS' | translate }}</h2>
          @if (!data.payments.length) {
            <p>{{ 'COMMON.NO_DATA' | translate }}</p>
          } @else {
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ 'TRANSFERS.DATE' | translate }}</th>
                  <th>{{ 'TRANSFERS.AMOUNT' | translate }}</th>
                  <th>{{ 'TRANSFERS.REFERENCE' | translate }}</th>
                  <th>{{ 'RESOURCES.NOTES' | translate }}</th>
                  <th>{{ 'COMMON.ACTIONS' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (payment of data.payments; track payment.obligationPaymentId) {
                  <tr>
                    <td>{{ payment.paymentDate | date: 'mediumDate' }}</td>
                    <td class="money">{{ payment.amount | money }}</td>
                    <td>{{ payment.referenceNo }}</td>
                    <td>{{ payment.notes }}</td>
                    <td>
                      <button type="button" class="btn-icon danger" (click)="deletePayment(payment.obligationPaymentId)">🗑</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      } @else if (loading()) {
        <p>{{ 'COMMON.LOADING' | translate }}</p>
      }
    </div>
  `,
})
export class ObligationDetailComponent implements OnInit {
  private readonly api = inject(ObligationsApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  readonly lookups = inject(LookupCacheService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly statement = signal<ObligationStatement | null>(null);

  private obligationId = '';

  readonly paymentForm = this.fb.nonNullable.group({
    correspondentAccountId: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.0001)]],
    paymentDate: [today(), Validators.required],
    referenceNo: [''],
    notes: [''],
  });

  /** The stored procedure rejects a currency mismatch, so only matching accounts are offered. */
  readonly payableAccountOptions = computed(() => {
    const currencyId = this.statement()?.obligation.currencyId;
    return currencyId ? this.lookups.accountOptions({ currencyId }) : [];
  });

  ngOnInit(): void {
    this.lookups.loadAccounts();
    this.obligationId = this.route.snapshot.paramMap.get('id') ?? '';
    this.load();
  }

  fieldError(field: string): string | null {
    return getFieldError(this.paymentForm, field, this.translate);
  }

  isInvalid(field: string): boolean {
    const control = this.paymentForm.get(field);
    return !!control && control.touched && control.invalid;
  }

  pay(): void {
    markFormTouched(this.paymentForm);
    if (this.paymentForm.invalid) {
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.api.addPayment({ ...this.paymentForm.getRawValue(), obligationId: this.obligationId }).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(this.translate.instant('COMMON.SUCCESS'));
        this.paymentForm.reset({ paymentDate: today() });
        this.lookups.refreshAccounts();
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(extractHttpError(err));
      },
    });
  }

  async deletePayment(paymentId: string): Promise<void> {
    if (!(await this.confirm.confirmDelete())) return;
    this.api.deletePayment(paymentId).subscribe({
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
    this.api.getStatement(this.obligationId).subscribe({
      next: (data) => {
        this.statement.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(extractHttpError(err));
      },
    });
  }
}
