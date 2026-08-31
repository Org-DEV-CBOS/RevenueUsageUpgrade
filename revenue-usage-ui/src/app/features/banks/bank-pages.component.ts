import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Bank } from '../../core/models/bank.model';
import { SYSTEM_USER } from '../../core/constants/system-user';
import { LookupsApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { extractHttpError } from '../../core/utils/http-error.util';
import { LocalizedFieldPipe } from '../../shared/pipes/localized-name.pipe';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-bank-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, ReactiveFormsModule, LocalizedFieldPipe, PaginationComponent],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'BANKS.TITLE' | translate }}</h1>
        <a routerLink="/admin/banks/create" class="btn-primary">{{ 'BANKS.ADD' | translate }}</a>
      </div>

      @if (error()) {
        <div class="error-banner">{{ error() }}</div>
      }

      <div class="search-row">
        <input [formControl]="searchControl" [placeholder]="'COMMON.SEARCH' | translate" />
        <button type="button" class="btn-primary" (click)="applySearch()">{{ 'COMMON.SEARCH' | translate }}</button>
      </div>

      <div class="panel">
        @if (loading()) {
          <p>{{ 'COMMON.LOADING' | translate }}</p>
        } @else if (!banks().length) {
          <p>{{ 'COMMON.NO_DATA' | translate }}</p>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ 'BANKS.NAME' | translate }}</th>
                <th>{{ 'BANKS.CODE' | translate }}</th>
                <th>{{ 'BANKS.SHORT_NAME' | translate }}</th>
                <th>{{ 'COMMON.ACTIVE' | translate }}</th>
                <th>{{ 'COMMON.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (bank of banks(); track bank.bankId) {
                <tr>
                  <td>{{ bank | localizedField:'bankNameEn':'bankNameAr' }}</td>
                  <td>{{ bank.bankCode }}</td>
                  <td>{{ bank.shortName }}</td>
                  <td>{{ (bank.isActive ? 'COMMON.YES' : 'COMMON.NO') | translate }}</td>
                  <td>
                    <a [routerLink]="['/admin/banks/edit', bank.bankId]" class="btn-icon">✎</a>
                    <button type="button" class="btn-icon danger" (click)="confirmDelete(bank)">🗑</button>
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
export class BankListComponent implements OnInit {
  private readonly api = inject(LookupsApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly banks = signal<Bank[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);

  readonly searchControl = this.fb.nonNullable.control('');

  ngOnInit(): void {
    this.loadBanks();
  }

  applySearch(): void {
    this.currentPage.set(1);
    this.loadBanks();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadBanks();
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadBanks();
  }

  async confirmDelete(bank: Bank): Promise<void> {
    const confirmed = await this.confirm.confirmDelete();
    if (!confirmed) {
      return;
    }

    this.api
      .deleteBank(bank.bankId, {
        bankId: bank.bankId,
        deletedBy: SYSTEM_USER,
      })
      .subscribe({
        next: () => {
          this.toast.success(this.translate.instant('COMMON.DELETED'));
          this.loadBanks();
        },
        error: () => this.toast.error(this.translate.instant('COMMON.ERROR')),
      });
  }

  private loadBanks(): void {
    this.loading.set(true);
    this.error.set('');
    this.api
      .getBanksPaged({
        page: this.currentPage(),
        pageSize: this.pageSize(),
        search: this.searchControl.value.trim() || undefined,
      })
      .subscribe({
        next: (response) => {
          this.banks.set(response.items ?? []);
          this.totalCount.set(response.totalCount ?? 0);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(extractHttpError(err));
          this.toast.error(extractHttpError(err));
        },
      });
  }
}

@Component({
  selector: 'app-bank-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ (isEdit ? 'COMMON.EDIT' : 'BANKS.ADD') | translate }}</h1>
        <a routerLink="/admin/banks" class="btn-secondary">{{ 'COMMON.BACK' | translate }}</a>
      </div>

      <form class="form-panel" [formGroup]="form" (ngSubmit)="save()">
        <label>
          {{ 'BANKS.CODE' | translate }} *
          <input type="number" formControlName="bankCode" />
        </label>
        <label>
          {{ 'BANKS.NAME_EN' | translate }}
          <input formControlName="bankNameEn" />
        </label>
        <label>
          {{ 'BANKS.NAME_AR' | translate }} *
          <input formControlName="bankNameAr" />
        </label>
        <label>
          {{ 'BANKS.SHORT_NAME' | translate }}
          <input formControlName="shortName" />
        </label>
        @if (isEdit) {
          <label class="checkbox">
            <input type="checkbox" formControlName="isActive" />
            {{ 'COMMON.ACTIVE' | translate }}
          </label>
        }

        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
            {{ 'COMMON.SAVE' | translate }}
          </button>
          <a routerLink="/admin/banks" class="btn-secondary">{{ 'COMMON.CANCEL' | translate }}</a>
        </div>
      </form>
    </div>
  `,
})
export class BankFormComponent implements OnInit {
  private readonly api = inject(LookupsApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly saving = signal(false);
  isEdit = false;
  bankId = '';

  readonly form = this.fb.nonNullable.group({
    bankCode: [0, [Validators.required, Validators.min(1)]],
    bankNameEn: [''],
    bankNameAr: ['', Validators.required],
    shortName: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    const segments = this.router.url.split('/');
    const editIndex = segments.indexOf('edit');
    if (editIndex >= 0) {
      this.isEdit = true;
      this.bankId = segments[editIndex + 1];
      this.loadBank();
    }
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();
    const actor = SYSTEM_USER;

    const request$ = this.isEdit
      ? this.api.updateBank(this.bankId, {
          bankId: this.bankId,
          ...value,
          modifiedBy: actor,
        })
      : this.api.createBank({ ...value, createdBy: actor });

    request$.subscribe({
      next: () => {
        this.toast.success('Saved');
        this.router.navigateByUrl('/admin/banks');
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Save failed');
      },
    });
  }

  private loadBank(): void {
    this.api.getBank(this.bankId).subscribe({
      next: (bank) =>
        this.form.patchValue({
          bankCode: bank.bankCode,
          bankNameEn: bank.bankNameEn ?? '',
          bankNameAr: bank.bankNameAr,
          shortName: bank.shortName ?? '',
          isActive: bank.isActive,
        }),
      error: () => this.toast.error('Failed to load bank'),
    });
  }
}
