import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { generateEntityCode } from '../../core/utils/generate-code';
import { LocalizedFieldPipe } from '../../shared/pipes/localized-name.pipe';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { SearchSelectComponent, SearchSelectOption } from '../../shared/components/search-select/search-select.component';

// --- Accounts ---
@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LocalizedFieldPipe, MoneyPipe],
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
    </div>
  `,
})
export class AccountListComponent implements OnInit {
  private readonly api = inject(CorrespondentAccountsApiService);
  private readonly currenciesApi = inject(CurrenciesApiService);
  private readonly toast = inject(ToastService);
  private readonly localized = inject(LocalizedFieldPipe);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly items = signal<CorrespondentAccount[]>([]);
  readonly currencies = signal<Currency[]>([]);

  ngOnInit(): void { this.load(); }

  currencySymbol(item: CorrespondentAccount): string {
    const currency = this.currencies().find((c) => c.currencyId === item.currencyId);
    return currency?.symbol || item.currencyCode || '';
  }

  confirmDelete(item: CorrespondentAccount): void {
    if (!confirm('Delete account?')) return;
    this.api.delete(item.correspondentAccountId).subscribe({
      next: () => { this.toast.success('Deleted'); this.load(); },
      error: (err) => this.toast.error(extractHttpError(err)),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getAll({ activeOnly: false }).subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
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
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink, SearchSelectComponent],
  providers: [LocalizedFieldPipe],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ (isEdit ? 'COMMON.EDIT' : 'ACCOUNTS.ADD') | translate }}</h1>
        <a routerLink="/admin/accounts" class="btn-secondary">{{ 'COMMON.BACK' | translate }}</a>
      </div>
      @if (error()) { <div class="error-banner">{{ error() }}</div> }
      <form class="form-panel" [formGroup]="form" (ngSubmit)="save()">
        <label>{{ 'NAV.CORRESPONDENTS' | translate }} *
          <app-search-select formControlName="correspondentId" [options]="correspondentOptions()" />
        </label>
        <label>{{ 'NAV.CURRENCIES' | translate }} *
          <app-search-select formControlName="currencyId" [options]="currencyOptions()" />
        </label>
        <label>{{ 'ACCOUNTS.NUMBER' | translate }} *<input formControlName="accountNumber" /></label>
        <label>{{ 'ACCOUNTS.OPENING_BALANCE' | translate }} *<input type="number" step="0.01" formControlName="openingBalance" /></label>
        @if (isEdit) {
          <label class="checkbox"><input type="checkbox" formControlName="isActive" /> {{ 'COMMON.ACTIVE' | translate }}</label>
        }
        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">{{ 'COMMON.SAVE' | translate }}</button>
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

  isEdit = false;
  id = '';
  readonly saving = signal(false);
  readonly error = signal('');
  readonly correspondents = signal<Correspondent[]>([]);
  readonly currencies = signal<Currency[]>([]);

  correspondentOptions(): SearchSelectOption[] {
    return this.correspondents().map((item) => ({
      value: item.correspondentId,
      label: this.localized.transform(item, 'correspondentNameEn', 'correspondentNameAr'),
    }));
  }

  currencyOptions(): SearchSelectOption[] {
    return this.currencies().map((item) => ({
      value: item.currencyId,
      label: item.symbol || item.currencyCode,
    }));
  }

  readonly form = this.fb.nonNullable.group({
    correspondentId: ['', Validators.required],
    currencyId: ['', Validators.required],
    accountNumber: ['', Validators.required],
    openingBalance: [0, Validators.required],
    isActive: [true],
  });

  ngOnInit(): void {
    this.correspondentsApi.getAll().subscribe({ next: (d) => this.correspondents.set(d), error: () => {} });
    this.currenciesApi.getAll().subscribe({ next: (d) => this.currencies.set(d), error: () => {} });

    const segments = this.router.url.split('/');
    const editIndex = segments.indexOf('edit');
    if (editIndex >= 0) {
      this.isEdit = true;
      this.id = segments[editIndex + 1];
      this.api.getById(this.id).subscribe({
        next: (item) => this.form.patchValue({
          correspondentId: item.correspondentId,
          currencyId: item.currencyId,
          accountNumber: item.accountNumber,
          openingBalance: item.openingBalance,
          isActive: item.isActive,
        }),
        error: (err) => this.error.set(extractHttpError(err)),
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const value = this.form.getRawValue();
    const payload = { ...value, correspondentAccountId: this.id, createdBy: SYSTEM_USER, modifiedBy: SYSTEM_USER };
    const request$ = this.isEdit ? this.api.update(this.id, payload) : this.api.create(payload);
    request$.subscribe({
      next: () => this.router.navigateByUrl('/admin/accounts'),
      error: (err) => { this.saving.set(false); this.error.set(extractHttpError(err)); this.toast.error(extractHttpError(err)); },
    });
  }
}

// --- Beneficiaries ---
@Component({
  selector: 'app-beneficiary-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LocalizedFieldPipe],
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
    </div>
  `,
})
export class BeneficiaryListComponent implements OnInit {
  private readonly api = inject(BeneficiariesApiService);
  private readonly toast = inject(ToastService);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly items = signal<Beneficiary[]>([]);
  ngOnInit(): void { this.load(); }
  confirmDelete(item: Beneficiary): void {
    if (!confirm('Delete?')) return;
    this.api.delete(item.beneficiaryId).subscribe({
      next: () => { this.toast.success('Deleted'); this.load(); },
      error: (err) => this.toast.error(extractHttpError(err)),
    });
  }
  private load(): void {
    this.loading.set(true);
    this.api.getAll({ activeOnly: false }).subscribe({
      next: (d) => { this.items.set(d); this.loading.set(false); },
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
  imports: [RouterLink, TranslatePipe, LocalizedFieldPipe],
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
              <th>{{ 'COMMON.CODE' | translate }}</th><th>{{ 'BANKS.NAME' | translate }}</th>
              <th>{{ 'CURRENCIES.SYMBOL' | translate }}</th><th>{{ 'COMMON.ACTIONS' | translate }}</th>
            </tr></thead>
            <tbody>
              @for (item of items(); track item.currencyId) {
                <tr>
                  <td>{{ item.currencyCode }}</td>
                  <td>{{ item | localizedField:'currencyNameEn':'currencyNameAr' }}</td>
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
    </div>
  `,
})
export class CurrencyListComponent implements OnInit {
  private readonly api = inject(CurrenciesApiService);
  private readonly toast = inject(ToastService);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly items = signal<Currency[]>([]);
  ngOnInit(): void { this.load(); }
  confirmDelete(item: Currency): void {
    if (!confirm('Delete?')) return;
    this.api.delete(item.currencyId).subscribe({
      next: () => { this.toast.success('Deleted'); this.load(); },
      error: (err) => this.toast.error(extractHttpError(err)),
    });
  }
  private load(): void {
    this.loading.set(true);
    this.api.getAll().subscribe({
      next: (d) => { this.items.set(d); this.loading.set(false); },
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
  imports: [RouterLink, TranslatePipe, LocalizedFieldPipe],
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
    </div>
  `,
})
export class ResourceListComponent implements OnInit {
  private readonly api = inject(ResourcesApiService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly items = signal<ResourceType[]>([]);
  ngOnInit(): void { this.load(); }
  confirmDelete(item: ResourceType): void {
    if (!confirm(this.translate.instant('COMMON.CONFIRM_DELETE'))) return;
    this.api.deleteType(item.resourceTypeId, this.auth.actor()).subscribe({
      next: () => { this.toast.success(this.translate.instant('COMMON.SUCCESS')); this.load(); },
      error: (err) => this.toast.error(extractHttpError(err)),
    });
  }
  private load(): void {
    this.loading.set(true);
    this.api.getTypes({ activeOnly: false }).subscribe({
      next: (d) => { this.items.set(d); this.loading.set(false); },
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
