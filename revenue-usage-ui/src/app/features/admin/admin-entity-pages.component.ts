import { Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { SYSTEM_USER } from '../../core/constants/system-user';
import {
  Beneficiary,
  Correspondent,
  CorrespondentAccount,
  Currency,
  ResourceType,
} from '../../core/models/common.model';
import {
  BeneficiariesApiService,
  CorrespondentAccountsApiService,
  CorrespondentsApiService,
  CurrenciesApiService,
  ResourcesApiService,
} from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { extractHttpError } from '../../core/utils/http-error.util';
import { getFieldError, markFormTouched } from '../../core/utils/form-errors.util';
import { generateEntityCode } from '../../core/utils/generate-code';
import { LocalizedFieldPipe } from '../../shared/pipes/localized-name.pipe';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { MoneyInputComponent } from '../../shared/components/money-input/money-input.component';
import { SearchSelectComponent, SearchSelectOption } from '../../shared/components/search-select/search-select.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ConfirmService } from '../../core/services/confirm.service';

// --- Accounts ---
@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LocalizedFieldPipe, MoneyPipe, PaginationComponent],
  providers: [LocalizedFieldPipe],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'NAV.ACCOUNTS' | translate }}</h1>
        <a routerLink="/admin/accounts/create" class="btn-primary">{{ 'ACCOUNTS.ADD' | translate }}</a>
      </div>
      @if (error()) { <div class="error-banner">{{ error() }}</div> }
      <div class="panel">
        @if (loading()) { <p>{{ 'COMMON.LOADING' | translate }}</p> }
        @else if (!items().length) { <p>{{ 'COMMON.NO_DATA' | translate }}</p> }
        @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ 'ACCOUNTS.NUMBER' | translate }}</th>
                <th>{{ 'NAV.CORRESPONDENTS' | translate }}</th>
                <th>{{ 'NAV.CURRENCIES' | translate }}</th>
                <th>{{ 'ACCOUNTS.BALANCE' | translate }}</th>
                <th>{{ 'COMMON.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (item of items(); track item.correspondentAccountId) {
                <tr>
                  <td>{{ item.accountNumber }}</td>
                  <td>{{ item | localizedField:'correspondentNameEn':'correspondentNameAr' }}</td>
                  <td>{{ currencySymbol(item) }}</td>
                  <td class="money">{{ item.currentBalance | money }}</td>
                  <td>
                    <a [routerLink]="['/admin/accounts/edit', item.correspondentAccountId]" class="btn-icon">✎</a>
                    <button type="button" class="btn-icon danger" (click)="confirmDelete(item)">🗑</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
      <app-pagination
        [page]="currentPage()"
        [pageSize]="pageSize()"
        [totalCount]="totalCount()"
        (pageChange)="goToPage($event)"
        (pageSizeChange)="changePageSize($event)"
      />
    </div>
  `,
})
export class AccountListComponent implements OnInit {
  private readonly api = inject(CorrespondentAccountsApiService);
  private readonly currenciesApi = inject(CurrenciesApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly translate = inject(TranslateService);
  private readonly localized = inject(LocalizedFieldPipe);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly items = signal<CorrespondentAccount[]>([]);
  readonly currencies = signal<Currency[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);

  ngOnInit(): void { this.load(); }

  currencySymbol(item: CorrespondentAccount): string {
    const currency = this.currencies().find((c) => c.currencyId === item.currencyId);
    return currency?.symbol || item.currencyCode || '';
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.load();
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.load();
  }

  async confirmDelete(item: CorrespondentAccount): Promise<void> {
    if (!(await this.confirm.confirmDelete())) return;
    this.api.delete(item.correspondentAccountId).subscribe({
      next: () => { this.toast.success(this.translate.instant('COMMON.DELETED')); this.load(); },
      error: (err) => this.toast.error(extractHttpError(err)),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getPaged({ activeOnly: false, page: this.currentPage(), pageSize: this.pageSize() }).subscribe({
      next: (data) => {
        this.items.set(data.items ?? []);
        this.totalCount.set(data.totalCount ?? 0);
        this.loading.set(false);
      },
      error: (err) => { this.loading.set(false); this.error.set(extractHttpError(err)); },
    });
    this.currenciesApi.getAll().subscribe({
      next: (data) => this.currencies.set(data),
      error: () => this.currencies.set([]),
    });
  }
}

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink, SearchSelectComponent, MoneyInputComponent],
  providers: [LocalizedFieldPipe],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ (isEdit ? 'COMMON.EDIT' : 'ACCOUNTS.ADD') | translate }}</h1>
        <a routerLink="/admin/accounts" class="btn-secondary">{{ 'COMMON.BACK' | translate }}</a>
      </div>
      @if (error()) { <div class="error-banner">{{ error() }}</div> }
      <form class="form-panel" [formGroup]="form" (ngSubmit)="save()">
        <label [class.invalid]="isInvalid('correspondentId')">
          {{ 'NAV.CORRESPONDENTS' | translate }} *
          <app-search-select formControlName="correspondentId" [options]="correspondentOptions()" />
          @if (fieldError('correspondentId'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>
        <label [class.invalid]="isInvalid('currencyId')">
          {{ 'NAV.CURRENCIES' | translate }} *
          <app-search-select formControlName="currencyId" [options]="currencyOptions()" />
          @if (fieldError('currencyId'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>
        <label [class.invalid]="isInvalid('accountNumber')">
          {{ 'ACCOUNTS.NUMBER' | translate }} *
          <input formControlName="accountNumber" />
          @if (fieldError('accountNumber'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>
        <label [class.invalid]="isInvalid('openingBalance')">
          {{ 'ACCOUNTS.OPENING_BALANCE' | translate }} *
          <app-money-input formControlName="openingBalance" />
          @if (fieldError('openingBalance'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>
        @if (isEdit) {
          <label class="checkbox"><input type="checkbox" formControlName="isActive" /> {{ 'COMMON.ACTIVE' | translate }}</label>
        }
        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="saving()">{{ 'COMMON.SAVE' | translate }}</button>
        </div>
      </form>
    </div>
  `,
})
export class AccountFormComponent implements OnInit {
  private readonly api = inject(CorrespondentAccountsApiService);
  private readonly correspondentsApi = inject(CorrespondentsApiService);
  private readonly currenciesApi = inject(CurrenciesApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly localized = inject(LocalizedFieldPipe);
  private readonly translate = inject(TranslateService);

  isEdit = false;
  id = '';
  readonly saving = signal(false);
  readonly error = signal('');
  readonly correspondents = signal<Correspondent[]>([]);
  readonly currencies = signal<Currency[]>([]);
  readonly correspondentAccounts = signal<CorrespondentAccount[]>([]);

  correspondentOptions(): SearchSelectOption[] {
    return this.correspondents().map((item) => ({
      value: item.correspondentId,
      label: this.localized.transform(item, 'correspondentNameEn', 'correspondentNameAr'),
    }));
  }

  currencyOptions(): SearchSelectOption[] {
    const selectedCurrencyId = this.form.get('currencyId')?.value;
    const takenCurrencyIds = new Set(
      this.correspondentAccounts()
        .filter((account) => account.correspondentAccountId !== this.id)
        .map((account) => account.currencyId),
    );

    return this.currencies()
      .filter((item) => !takenCurrencyIds.has(item.currencyId) || item.currencyId === selectedCurrencyId)
      .map((item) => ({
        value: item.currencyId,
        label: item.symbol || item.currencyCode,
      }));
  }

  readonly form = this.fb.nonNullable.group({
    correspondentId: ['', Validators.required],
    currencyId: ['', [Validators.required, this.currencyTakenValidator()]],
    accountNumber: ['', [Validators.required, this.accountNumberValidator()]],
    openingBalance: [0, [Validators.required, Validators.min(0)]],
    isActive: [true],
  });

  ngOnInit(): void {
    this.correspondentsApi.getAll().subscribe({ next: (d) => this.correspondents.set(d), error: () => {} });
    this.currenciesApi.getAll().subscribe({ next: (d) => this.currencies.set(d), error: () => {} });

    this.form.get('correspondentId')?.valueChanges.subscribe((correspondentId) => {
      this.loadCorrespondentAccounts(correspondentId);
      this.form.get('accountNumber')?.updateValueAndValidity();
      this.form.get('currencyId')?.updateValueAndValidity();
    });

    this.form.get('accountNumber')?.valueChanges.subscribe(() => {
      this.form.get('accountNumber')?.updateValueAndValidity({ emitEvent: false });
    });

    const segments = this.router.url.split('/');
    const editIndex = segments.indexOf('edit');
    if (editIndex >= 0) {
      this.isEdit = true;
      this.id = segments[editIndex + 1];
      this.api.getById(this.id).subscribe({
        next: (item) => {
          this.form.patchValue({
            correspondentId: item.correspondentId,
            currencyId: item.currencyId,
            accountNumber: item.accountNumber,
            openingBalance: item.openingBalance,
            isActive: item.isActive,
          });
          this.loadCorrespondentAccounts(item.correspondentId);
        },
        error: (err) => this.error.set(extractHttpError(err)),
      });
    }
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
    const value = this.form.getRawValue();
    const payload = { ...value, correspondentAccountId: this.id, createdBy: SYSTEM_USER, modifiedBy: SYSTEM_USER };
    const request$ = this.isEdit ? this.api.update(this.id, payload) : this.api.create(payload);
    request$.subscribe({
      next: () => this.router.navigateByUrl('/admin/accounts'),
      error: (err) => { this.saving.set(false); this.error.set(extractHttpError(err)); this.toast.error(extractHttpError(err)); },
    });
  }

  private loadCorrespondentAccounts(correspondentId: string): void {
    if (!correspondentId) {
      this.correspondentAccounts.set([]);
      return;
    }

    this.api.getAll({ correspondentId, activeOnly: false }).subscribe({
      next: (accounts) => {
        this.correspondentAccounts.set(accounts);
        const selectedCurrencyId = this.form.get('currencyId')?.value;
        const takenCurrencyIds = new Set(
          accounts
            .filter((account) => account.correspondentAccountId !== this.id)
            .map((account) => account.currencyId),
        );
        if (selectedCurrencyId && takenCurrencyIds.has(selectedCurrencyId)) {
          this.form.patchValue({ currencyId: '' });
        }
        this.form.get('currencyId')?.updateValueAndValidity();
        this.form.get('accountNumber')?.updateValueAndValidity();
      },
      error: () => this.correspondentAccounts.set([]),
    });
  }

  private accountNumberValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const accountNumber = String(control.value ?? '').trim();
      if (!accountNumber) {
        return null;
      }

      const duplicate = this.correspondentAccounts().some(
        (account) =>
          account.correspondentAccountId !== this.id &&
          account.accountNumber.localeCompare(accountNumber, undefined, { sensitivity: 'accent' }) === 0,
      );

      return duplicate ? { duplicateAccountNumber: true } : null;
    };
  }

  private currencyTakenValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const currencyId = String(control.value ?? '').trim();
      if (!currencyId) {
        return null;
      }

      const taken = this.correspondentAccounts().some(
        (account) => account.correspondentAccountId !== this.id && account.currencyId === currencyId,
      );

      return taken ? { currencyTaken: true } : null;
    };
  }
}

// --- Beneficiaries ---
@Component({
  selector: 'app-beneficiary-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LocalizedFieldPipe, PaginationComponent],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'NAV.BENEFICIARIES' | translate }}</h1>
        <a routerLink="/admin/beneficiaries/create" class="btn-primary">{{ 'BENEFICIARIES.ADD' | translate }}</a>
      </div>
      @if (error()) { <div class="error-banner">{{ error() }}</div> }
      <div class="panel">
        @if (loading()) { <p>{{ 'COMMON.LOADING' | translate }}</p> }
        @else if (!items().length) { <p>{{ 'COMMON.NO_DATA' | translate }}</p> }
        @else {
          <table class="data-table">
            <thead><tr>
              <th>{{ 'COMMON.CODE' | translate }}</th>
              <th>{{ 'BENEFICIARIES.NAME' | translate }}</th>
              <th>{{ 'COMMON.ACTIVE' | translate }}</th>
              <th>{{ 'COMMON.ACTIONS' | translate }}</th>
            </tr></thead>
            <tbody>
              @for (item of items(); track item.beneficiaryId) {
                <tr>
                  <td>{{ item.beneficiaryCode }}</td>
                  <td>{{ item | localizedField:'beneficiaryNameEn':'beneficiaryNameAr' }}</td>
                  <td>{{ (item.isActive ? 'COMMON.YES' : 'COMMON.NO') | translate }}</td>
                  <td>
                    <a [routerLink]="['/admin/beneficiaries/edit', item.beneficiaryId]" class="btn-icon">✎</a>
                    <button type="button" class="btn-icon danger" (click)="confirmDelete(item)">🗑</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
      <app-pagination
        [page]="currentPage()"
        [pageSize]="pageSize()"
        [totalCount]="totalCount()"
        (pageChange)="goToPage($event)"
        (pageSizeChange)="changePageSize($event)"
      />
    </div>
  `,
})
export class BeneficiaryListComponent implements OnInit {
  private readonly api = inject(BeneficiariesApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly translate = inject(TranslateService);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly items = signal<Beneficiary[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);
  ngOnInit(): void { this.load(); }
  goToPage(page: number): void { this.currentPage.set(page); this.load(); }
  changePageSize(size: number): void { this.pageSize.set(size); this.currentPage.set(1); this.load(); }
  async confirmDelete(item: Beneficiary): Promise<void> {
    if (!(await this.confirm.confirmDelete())) return;
    this.api.delete(item.beneficiaryId).subscribe({
      next: () => { this.toast.success(this.translate.instant('COMMON.DELETED')); this.load(); },
      error: (err) => this.toast.error(extractHttpError(err)),
    });
  }
  private load(): void {
    this.loading.set(true);
    this.api.getPaged({ activeOnly: false, page: this.currentPage(), pageSize: this.pageSize() }).subscribe({
      next: (d) => {
        this.items.set(d.items ?? []);
        this.totalCount.set(d.totalCount ?? 0);
        this.loading.set(false);
      },
      error: (err) => { this.loading.set(false); this.error.set(extractHttpError(err)); },
    });
  }
}

@Component({
  selector: 'app-beneficiary-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ (isEdit ? 'COMMON.EDIT' : 'BENEFICIARIES.ADD') | translate }}</h1>
        <a routerLink="/admin/beneficiaries" class="btn-secondary">{{ 'COMMON.BACK' | translate }}</a>
      </div>
      @if (error()) { <div class="error-banner">{{ error() }}</div> }
      <form class="form-panel" [formGroup]="form" (ngSubmit)="save()">
        @if (isEdit) {
          <label>{{ 'COMMON.CODE' | translate }}<input formControlName="beneficiaryCode" readonly /></label>
        }
        <label>{{ 'BENEFICIARIES.NAME_EN' | translate }} *<input formControlName="beneficiaryNameEn" /></label>
        <label>{{ 'BENEFICIARIES.NAME_AR' | translate }}<input formControlName="beneficiaryNameAr" /></label>
        @if (isEdit) { <label class="checkbox"><input type="checkbox" formControlName="isActive" /> {{ 'COMMON.ACTIVE' | translate }}</label> }
        <div class="form-actions"><button type="submit" class="btn-primary" [disabled]="form.invalid">{{ 'COMMON.SAVE' | translate }}</button></div>
      </form>
    </div>
  `,
})
export class BeneficiaryFormComponent implements OnInit {
  private readonly api = inject(BeneficiariesApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  isEdit = false; id = '';
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    beneficiaryCode: [''],
    beneficiaryNameEn: ['', Validators.required],
    beneficiaryNameAr: [''],
    isActive: [true],
  });
  ngOnInit(): void {
    const segments = this.router.url.split('/');
    if (segments.includes('edit')) {
      this.isEdit = true;
      this.id = segments[segments.indexOf('edit') + 1];
      this.api.getAll().subscribe({
        next: (items) => {
          const item = items.find((b) => b.beneficiaryId === this.id);
          if (item) {
            this.form.patchValue({
              beneficiaryCode: item.beneficiaryCode,
              beneficiaryNameEn: item.beneficiaryNameEn,
              beneficiaryNameAr: item.beneficiaryNameAr ?? '',
              isActive: item.isActive,
            });
          }
        },
        error: (err) => this.error.set(extractHttpError(err)),
      });
    }
  }
  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const payload = {
      ...value,
      beneficiaryCode: this.isEdit ? value.beneficiaryCode : generateEntityCode('BNF'),
      actor: SYSTEM_USER,
      beneficiaryId: this.isEdit ? this.id : null,
    };
    const request$ = this.isEdit ? this.api.update(this.id, payload) : this.api.create(payload);
    request$.subscribe({
      next: () => this.router.navigateByUrl('/admin/beneficiaries'),
      error: (err) => { this.error.set(extractHttpError(err)); this.toast.error(extractHttpError(err)); },
    });
  }
}

// --- Currencies ---
@Component({
  selector: 'app-currency-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LocalizedFieldPipe, PaginationComponent],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'NAV.CURRENCIES' | translate }}</h1>
        <a routerLink="/admin/currencies/create" class="btn-primary">{{ 'CURRENCIES.ADD' | translate }}</a>
      </div>
      @if (error()) { <div class="error-banner">{{ error() }}</div> }
      <div class="panel">
        @if (loading()) { <p>{{ 'COMMON.LOADING' | translate }}</p> }
        @else if (!items().length) { <p>{{ 'COMMON.NO_DATA' | translate }}</p> }
        @else {
          <table class="data-table">
            <thead><tr>
              <th>{{ 'CURRENCIES.NAME_EN' | translate }}</th>
              <th>{{ 'CURRENCIES.NAME_AR' | translate }}</th>
              <th>{{ 'CURRENCIES.SHORT_NAME' | translate }}</th>
              <th>{{ 'COMMON.ACTIONS' | translate }}</th>
            </tr></thead>
            <tbody>
              @for (item of items(); track item.currencyId) {
                <tr>
                  <td>{{ item.currencyNameEn }}</td>
                  <td>{{ item.currencyNameAr }}</td>
                  <td>{{ item.symbol }}</td>
                  <td>
                    <a [routerLink]="['/admin/currencies/edit', item.currencyId]" class="btn-icon">✎</a>
                    <button type="button" class="btn-icon danger" (click)="confirmDelete(item)">🗑</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
      <app-pagination
        [page]="currentPage()"
        [pageSize]="pageSize()"
        [totalCount]="totalCount()"
        (pageChange)="goToPage($event)"
        (pageSizeChange)="changePageSize($event)"
      />
    </div>
  `,
})
export class CurrencyListComponent implements OnInit {
  private readonly api = inject(CurrenciesApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly translate = inject(TranslateService);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly items = signal<Currency[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);
  ngOnInit(): void { this.load(); }
  goToPage(page: number): void { this.currentPage.set(page); this.load(); }
  changePageSize(size: number): void { this.pageSize.set(size); this.currentPage.set(1); this.load(); }
  async confirmDelete(item: Currency): Promise<void> {
    if (!(await this.confirm.confirmDelete())) return;
    this.api.delete(item.currencyId).subscribe({
      next: () => { this.toast.success(this.translate.instant('COMMON.DELETED')); this.load(); },
      error: (err) => this.toast.error(extractHttpError(err)),
    });
  }
  private load(): void {
    this.loading.set(true);
    this.api.getPaged({ page: this.currentPage(), pageSize: this.pageSize() }).subscribe({
      next: (d) => {
        this.items.set(d.items ?? []);
        this.totalCount.set(d.totalCount ?? 0);
        this.loading.set(false);
      },
      error: (err) => { this.loading.set(false); this.error.set(extractHttpError(err)); },
    });
  }
}

@Component({
  selector: 'app-currency-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ (isEdit ? 'COMMON.EDIT' : 'CURRENCIES.ADD') | translate }}</h1>
        <a routerLink="/admin/currencies" class="btn-secondary">{{ 'COMMON.BACK' | translate }}</a>
      </div>
      @if (error()) { <div class="error-banner">{{ error() }}</div> }
      <form class="form-panel" [formGroup]="form" (ngSubmit)="save()">
        <label>{{ 'COMMON.CODE' | translate }} *<input formControlName="currencyCode" /></label>
        <label>{{ 'BANKS.NAME_EN' | translate }} *<input formControlName="currencyNameEn" /></label>
        <label>{{ 'BANKS.NAME_AR' | translate }}<input formControlName="currencyNameAr" /></label>
        <label>{{ 'CURRENCIES.SYMBOL' | translate }}<input formControlName="symbol" /></label>
        <label>{{ 'CURRENCIES.DECIMALS' | translate }} *<input type="number" formControlName="decimalPlaces" /></label>
        @if (isEdit) { <label class="checkbox"><input type="checkbox" formControlName="isActive" /> {{ 'COMMON.ACTIVE' | translate }}</label> }
        <div class="form-actions"><button type="submit" class="btn-primary" [disabled]="form.invalid">{{ 'COMMON.SAVE' | translate }}</button></div>
      </form>
    </div>
  `,
})
export class CurrencyFormComponent implements OnInit {
  private readonly api = inject(CurrenciesApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  isEdit = false; id = '';
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    currencyCode: ['', Validators.required],
    currencyNameEn: ['', Validators.required],
    currencyNameAr: [''],
    symbol: [''],
    decimalPlaces: [2, Validators.required],
    isActive: [true],
  });
  ngOnInit(): void {
    const segments = this.router.url.split('/');
    if (segments.includes('edit')) {
      this.isEdit = true;
      this.id = segments[segments.indexOf('edit') + 1];
      this.api.getAll().subscribe({
        next: (items) => {
          const item = items.find((c) => c.currencyId === this.id);
          if (item) this.form.patchValue(item);
        },
      });
    }
  }
  save(): void {
    if (this.form.invalid) return;
    const payload = { ...this.form.getRawValue(), actor: SYSTEM_USER, currencyId: this.isEdit ? this.id : null };
    const request$ = this.isEdit ? this.api.update(this.id, payload) : this.api.create(payload);
    request$.subscribe({
      next: () => this.router.navigateByUrl('/admin/currencies'),
      error: (err) => { this.error.set(extractHttpError(err)); this.toast.error(extractHttpError(err)); },
    });
  }
}

// --- Resource Types ---
@Component({
  selector: 'app-resource-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LocalizedFieldPipe, PaginationComponent],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'NAV.RESOURCES' | translate }}</h1>
        <a routerLink="/admin/resources/create" class="btn-primary">{{ 'RESOURCES.ADD' | translate }}</a>
      </div>
      @if (error()) { <div class="error-banner">{{ error() }}</div> }
      <div class="panel">
        @if (loading()) { <p>{{ 'COMMON.LOADING' | translate }}</p> }
        @else if (!items().length) { <p>{{ 'COMMON.NO_DATA' | translate }}</p> }
        @else {
          <table class="data-table">
            <thead><tr>
              <th>{{ 'COMMON.CODE' | translate }}</th>
              <th>{{ 'RESOURCES.NAME' | translate }}</th>
              <th>{{ 'COMMON.ACTIVE' | translate }}</th>
              <th>{{ 'COMMON.ACTIONS' | translate }}</th>
            </tr></thead>
            <tbody>
              @for (item of items(); track item.resourceTypeId) {
                <tr>
                  <td>{{ item.resourceTypeCode }}</td>
                  <td>{{ item | localizedField:'resourceTypeNameEn':'resourceTypeNameAr' }}</td>
                  <td>{{ (item.isActive ? 'COMMON.YES' : 'COMMON.NO') | translate }}</td>
                  <td>
                    <a [routerLink]="['/admin/resources/edit', item.resourceTypeId]" class="btn-icon">✎</a>
                    <button type="button" class="btn-icon danger" (click)="confirmDelete(item)">🗑</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
      <app-pagination
        [page]="currentPage()"
        [pageSize]="pageSize()"
        [totalCount]="totalCount()"
        (pageChange)="goToPage($event)"
        (pageSizeChange)="changePageSize($event)"
      />
    </div>
  `,
})
export class ResourceListComponent implements OnInit {
  private readonly api = inject(ResourcesApiService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly confirm = inject(ConfirmService);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly items = signal<ResourceType[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);
  ngOnInit(): void { this.load(); }
  goToPage(page: number): void { this.currentPage.set(page); this.load(); }
  changePageSize(size: number): void { this.pageSize.set(size); this.currentPage.set(1); this.load(); }
  async confirmDelete(item: ResourceType): Promise<void> {
    if (!(await this.confirm.confirmDelete())) return;
    this.api.deleteType(item.resourceTypeId, this.auth.actor()).subscribe({
      next: () => { this.toast.success(this.translate.instant('COMMON.DELETED')); this.load(); },
      error: (err) => this.toast.error(extractHttpError(err)),
    });
  }
  private load(): void {
    this.loading.set(true);
    this.api.getTypesPaged({ activeOnly: false, page: this.currentPage(), pageSize: this.pageSize() }).subscribe({
      next: (d) => {
        this.items.set(d.items ?? []);
        this.totalCount.set(d.totalCount ?? 0);
        this.loading.set(false);
      },
      error: (err) => { this.loading.set(false); this.error.set(extractHttpError(err)); },
    });
  }
}

@Component({
  selector: 'app-resource-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ (isEdit ? 'COMMON.EDIT' : 'RESOURCES.ADD') | translate }}</h1>
        <a routerLink="/admin/resources" class="btn-secondary">{{ 'COMMON.BACK' | translate }}</a>
      </div>
      @if (error()) { <div class="error-banner">{{ error() }}</div> }
      <form class="form-panel" [formGroup]="form" (ngSubmit)="save()">
        @if (isEdit) {
          <label>{{ 'COMMON.CODE' | translate }}<input formControlName="resourceTypeCode" readonly /></label>
        }
        <label>{{ 'RESOURCES.NAME_EN' | translate }} *<input formControlName="resourceTypeNameEn" /></label>
        <label>{{ 'RESOURCES.NAME_AR' | translate }}<input formControlName="resourceTypeNameAr" /></label>
        @if (isEdit) { <label class="checkbox"><input type="checkbox" formControlName="isActive" /> {{ 'COMMON.ACTIVE' | translate }}</label> }
        <div class="form-actions"><button type="submit" class="btn-primary" [disabled]="form.invalid">{{ 'COMMON.SAVE' | translate }}</button></div>
      </form>
    </div>
  `,
})
export class ResourceFormComponent implements OnInit {
  private readonly api = inject(ResourcesApiService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  isEdit = false; id = '';
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    resourceTypeCode: [''],
    resourceTypeNameEn: ['', Validators.required],
    resourceTypeNameAr: [''],
    isActive: [true],
  });
  ngOnInit(): void {
    const segments = this.router.url.split('/');
    if (segments.includes('edit')) {
      this.isEdit = true;
      this.id = segments[segments.indexOf('edit') + 1];
      this.api.getTypes({ activeOnly: false }).subscribe({
        next: (items) => {
          const item = items.find((r) => r.resourceTypeId === this.id);
          if (item) {
            this.form.patchValue({
              resourceTypeCode: item.resourceTypeCode,
              resourceTypeNameEn: item.resourceTypeNameEn,
              resourceTypeNameAr: item.resourceTypeNameAr ?? '',
              isActive: item.isActive,
            });
          }
        },
        error: (err) => this.error.set(extractHttpError(err)),
      });
    }
  }
  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const payload = {
      ...value,
      resourceTypeCode: this.isEdit ? value.resourceTypeCode : generateEntityCode('RST'),
      actor: this.auth.actor(),
      resourceTypeId: this.isEdit ? this.id : null,
    };
    const request$ = this.isEdit ? this.api.updateType(this.id, payload) : this.api.createType(payload);
    request$.subscribe({
      next: () => this.router.navigateByUrl('/admin/resources'),
      error: (err) => { this.error.set(extractHttpError(err)); this.toast.error(extractHttpError(err)); },
    });
  }
}
