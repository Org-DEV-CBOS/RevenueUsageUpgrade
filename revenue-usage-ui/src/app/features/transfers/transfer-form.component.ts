import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TransfersApiService } from '../../core/services/api.service';
import { LookupCacheService } from '../../core/services/lookup-cache.service';
import { ToastService } from '../../core/services/toast.service';
import { today } from '../../core/utils/date.util';
import { getFieldError, markFormTouched } from '../../core/utils/form-errors.util';
import { extractHttpError } from '../../core/utils/http-error.util';
import { MoneyInputComponent } from '../../shared/components/money-input/money-input.component';
import { SearchSelectComponent } from '../../shared/components/search-select/search-select.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

/**
 * A transfer debits one correspondent account in that account's own currency, so there is
 * no currency choice here. It is created as Pending and only moves money once confirmed.
 */
@Component({
  selector: 'app-transfer-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, SearchSelectComponent, MoneyInputComponent, MoneyPipe],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'TRANSFERS.ADD' | translate }}</h1>
        <a routerLink="/app/transfers" class="btn-secondary">{{ 'COMMON.BACK' | translate }}</a>
      </div>

      @if (error()) { <div class="error-banner">{{ error() }}</div> }

      <form class="form-panel wide" [formGroup]="form" (ngSubmit)="save()">
        <label [class.invalid]="isInvalid('correspondentAccountId')">
          {{ 'NAV.ACCOUNTS' | translate }} *
          <app-search-select formControlName="correspondentAccountId" [options]="lookups.accountOptions()" />
          @if (selectedAccount(); as account) {
            <span class="hint">
              {{ 'ACCOUNTS.BALANCE' | translate }}: {{ account.currentBalance | money }}
              {{ lookups.currencySymbol(account) }}
            </span>
          }
          @if (fieldError('correspondentAccountId'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>

        <label [class.invalid]="isInvalid('beneficiaryId')">
          {{ 'NAV.BENEFICIARIES' | translate }} *
          <app-search-select formControlName="beneficiaryId" [options]="lookups.beneficiaryOptions()" />
          @if (fieldError('beneficiaryId'); as message) {
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

        <label [class.invalid]="isInvalid('transferDate')">
          {{ 'TRANSFERS.DATE' | translate }} *
          <input type="date" formControlName="transferDate" [max]="maxDate" />
          @if (fieldError('transferDate'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>

        <label [class.invalid]="isInvalid('referenceNo')">
          {{ 'TRANSFERS.REFERENCE' | translate }}
          <input formControlName="referenceNo" maxlength="100" />
          @if (fieldError('referenceNo'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>

        <label>
          {{ 'TRANSFERS.STATEMENT_DATE' | translate }}
          <input type="date" formControlName="statementDate" />
        </label>

        <label class="full-width" [class.invalid]="isInvalid('purpose')">
          {{ 'TRANSFERS.PURPOSE' | translate }}
          <textarea rows="2" formControlName="purpose" maxlength="500"></textarea>
          @if (fieldError('purpose'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>

        <span class="hint full-width">{{ 'TRANSFERS.REQUIRED_ON_CONFIRM_HINT' | translate }}</span>

        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="saving()">{{ 'COMMON.SAVE' | translate }}</button>
          <span class="hint">{{ 'TRANSFERS.CREATED_PENDING_HINT' | translate }}</span>
        </div>
      </form>
    </div>
  `,
})
export class TransferFormComponent implements OnInit {
  private readonly api = inject(TransfersApiService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly lookups = inject(LookupCacheService);

  readonly saving = signal(false);
  readonly error = signal('');
  readonly maxDate = today();

  readonly form = this.fb.nonNullable.group({
    correspondentAccountId: ['', Validators.required],
    beneficiaryId: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.0001)]],
    transferDate: [today(), Validators.required],
    referenceNo: ['', Validators.maxLength(100)],
    statementDate: [''],
    purpose: ['', Validators.maxLength(500)],
  });

  ngOnInit(): void {
    this.lookups.loadAccounts();
    this.lookups.loadBeneficiaries();
  }

  selectedAccount() {
    return this.lookups.findAccount(this.form.controls.correspondentAccountId.value);
  }

  /** Advisory only: the confirm step is what actually enforces the balance. */
  exceedsBalance(): boolean {
    const account = this.selectedAccount();
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
    const value = this.form.getRawValue();
    this.api
      .createTransfer({
        correspondentAccountId: value.correspondentAccountId,
        beneficiaryId: value.beneficiaryId,
        amount: value.amount as number,
        transferDate: value.transferDate,
        // Blank optional fields go over as null so the API sees them as unset.
        referenceNo: value.referenceNo.trim() || null,
        statementDate: value.statementDate || null,
        purpose: value.purpose.trim() || null,
      })
      .subscribe({
        next: () => {
          this.toast.success(this.translate.instant('COMMON.SUCCESS'));
          this.router.navigateByUrl('/app/transfers');
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(extractHttpError(err));
        },
      });
  }
}
