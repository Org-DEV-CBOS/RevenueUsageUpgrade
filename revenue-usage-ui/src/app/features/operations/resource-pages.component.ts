import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ResourceListItem } from '../../core/models/common.model';
import { ResourcesApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { LookupCacheService } from '../../core/services/lookup-cache.service';
import { ToastService } from '../../core/services/toast.service';
import { getFieldError, markFormTouched } from '../../core/utils/form-errors.util';
import { extractHttpError } from '../../core/utils/http-error.util';
import { today } from '../../core/utils/date.util';
import { bindLiveFilter } from '../../core/utils/live-filter.util';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';
import { MoneyInputComponent } from '../../shared/components/money-input/money-input.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SearchSelectComponent } from '../../shared/components/search-select/search-select.component';
import { LocalizedFieldPipe } from '../../shared/pipes/localized-name.pipe';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

@Component({
  selector: 'app-resource-entry-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    TranslatePipe,
    LocalizedFieldPipe,
    MoneyPipe,
    PaginationComponent,
    FilterBarComponent,
    SearchSelectComponent,
    ReactiveFormsModule,
  ],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'RESOURCES.ENTRIES' | translate }}</h1>
        <a routerLink="/app/resources/create" class="btn-primary">{{ 'RESOURCES.ADD_ENTRY' | translate }}</a>
      </div>

      <app-filter-bar [(startDate)]="startDate" [(endDate)]="endDate" (filtersChange)="applyFilters()">
        <label>
          {{ 'RESOURCES.TYPE' | translate }}
          <app-search-select [options]="lookups.resourceTypeOptions()" [formControl]="resourceTypeControl" />
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
                  <th>{{ 'NAV.CORRESPONDENTS' | translate }}</th>
                  <th>{{ 'ACCOUNTS.NUMBER' | translate }}</th>
                  <th>{{ 'RESOURCES.TYPE' | translate }}</th>
                  <th>{{ 'TRANSFERS.AMOUNT' | translate }}</th>
                  <th>{{ 'RESOURCES.REMITTING_BANK' | translate }}</th>
                  <th>{{ 'TRANSFERS.REFERENCE' | translate }}</th>
                  <th>{{ 'RESOURCES.STATEMENT_DATE' | translate }}</th>
                  <th>{{ 'RESOURCES.NOTES' | translate }}</th>
                  <th>{{ 'COMMON.ACTIONS' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (item of items(); track item.resourceId) {
                  <tr>
                    <td>{{ item.resourceDate | date: 'mediumDate' }}</td>
                    <td>{{ item | localizedField: 'correspondentNameEn' : 'correspondentNameAr' }}</td>
                    <td>{{ item.accountNumber }}</td>
                    <td>{{ item | localizedField: 'resourceTypeNameEn' : 'resourceTypeNameAr' }}</td>
                    <td class="money">{{ item.amount | money }} {{ item.currencySymbol || item.currencyCode }}</td>
                    <td>{{ item | localizedField: 'remittingBankNameEn' : 'remittingBankNameAr' }}</td>
                    <td>{{ item.referenceNo }}</td>
                    <td>{{ item.statementDate | date: 'mediumDate' }}</td>
                    <td>{{ item.notes }}</td>
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
export class ResourceEntryListComponent implements OnInit {
  private readonly api = inject(ResourcesApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);
  readonly lookups = inject(LookupCacheService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly items = signal<ResourceListItem[]>([]);
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);

  startDate = signal('');
  endDate = signal('');
  readonly resourceTypeControl = this.fb.nonNullable.control('');

  ngOnInit(): void {
    this.lookups.loadResourceTypes();
    bindLiveFilter(this.destroyRef, () => this.applyFilters(), this.resourceTypeControl);
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

  async confirmDelete(item: ResourceListItem): Promise<void> {
    if (!(await this.confirm.confirmDelete())) return;
    this.api.deleteResource(item.resourceId).subscribe({
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
        resourceTypeId: this.resourceTypeControl.value,
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

@Component({
  selector: 'app-resource-entry-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    SearchSelectComponent,
    MoneyInputComponent,
    MoneyPipe,
  ],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'RESOURCES.ADD_ENTRY' | translate }}</h1>
        <a routerLink="/app/resources" class="btn-secondary">{{ 'COMMON.BACK' | translate }}</a>
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

        <label [class.invalid]="isInvalid('resourceTypeId')">
          {{ 'RESOURCES.TYPE' | translate }} *
          <app-search-select formControlName="resourceTypeId" [options]="lookups.resourceTypeOptions()" />
          @if (fieldError('resourceTypeId'); as message) {
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

        <label [class.invalid]="isInvalid('resourceDate')">
          {{ 'TRANSFERS.DATE' | translate }} *
          <input type="date" formControlName="resourceDate" />
          @if (fieldError('resourceDate'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>

        <label>
          {{ 'RESOURCES.REMITTING_BANK' | translate }}
          <app-search-select formControlName="remittingBankId" [options]="lookups.bankOptions()" />
        </label>

        <label [class.invalid]="isInvalid('referenceNo')">
          {{ 'TRANSFERS.REFERENCE' | translate }}
          <input formControlName="referenceNo" maxlength="100" />
          @if (fieldError('referenceNo'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>

        <label>
          {{ 'RESOURCES.STATEMENT_DATE' | translate }}
          <input type="date" formControlName="statementDate" />
        </label>

        <label class="full-width">
          {{ 'RESOURCES.NOTES' | translate }}
          <textarea rows="2" formControlName="notes"></textarea>
        </label>

        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="saving()">{{ 'COMMON.SAVE' | translate }}</button>
        </div>
      </form>
    </div>
  `,
})
export class ResourceEntryFormComponent implements OnInit {
  private readonly api = inject(ResourcesApiService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly lookups = inject(LookupCacheService);

  readonly saving = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    correspondentAccountId: ['', Validators.required],
    resourceTypeId: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.0001)]],
    resourceDate: [today(), Validators.required],
    remittingBankId: [''],
    referenceNo: ['', Validators.maxLength(100)],
    statementDate: [''],
    notes: [''],
  });

  ngOnInit(): void {
    this.lookups.loadAccounts();
    this.lookups.loadResourceTypes();
    this.lookups.loadBanks();
  }

  selectedAccount() {
    return this.lookups.findAccount(this.form.controls.correspondentAccountId.value);
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
    const { remittingBankId, referenceNo, statementDate, ...rest } = this.form.getRawValue();
    // The optional fields bind to '' when untouched; the API expects null for a
    // missing Guid or date rather than an empty string.
    this.api
      .addResource({
        ...rest,
        remittingBankId: remittingBankId || null,
        referenceNo: referenceNo.trim() || null,
        statementDate: statementDate || null,
      })
      .subscribe({
        next: () => {
          this.toast.success(this.translate.instant('COMMON.SUCCESS'));
          this.lookups.refreshAccounts();
          this.router.navigateByUrl('/app/resources');
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(extractHttpError(err));
        },
      });
  }
}
