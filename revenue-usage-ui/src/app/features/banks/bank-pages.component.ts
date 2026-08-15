import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Bank } from '../../core/models/bank.model';
import { SYSTEM_USER } from '../../core/constants/system-user';
import { LookupsApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { extractHttpError } from '../../core/utils/http-error.util';
import { LocalizedFieldPipe } from '../../shared/pipes/localized-name.pipe';

@Component({
  selector: 'app-bank-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, ReactiveFormsModule, LocalizedFieldPipe],
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
        } @else if (!filtered().length) {
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
              @for (bank of paged(); track bank.bankId) {
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

      <div class="pagination">
        <span>{{ 'COMMON.RECORDS_PER_PAGE' | translate }}</span>
        <select [value]="pageSize()" (change)="setPageSize($event)">
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
        </select>
        <span>{{ currentPage() }} {{ 'COMMON.OF' | translate }} {{ totalPages() }}</span>
        <button type="button" (click)="prevPage()" [disabled]="currentPage() <= 1">&lt;</button>
        <button type="button" (click)="nextPage()" [disabled]="currentPage() >= totalPages()">&gt;</button>
      </div>
    </div>
  `,
})
export class BankListComponent implements OnInit {
  private readonly api = inject(LookupsApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly banks = signal<Bank[]>([]);
  readonly filtered = signal<Bank[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly searchControl = this.fb.nonNullable.control('');

  ngOnInit(): void {
    this.loadBanks();
  }

  paged(): Bank[] {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered().length / this.pageSize()));
  }

  applySearch(): void {
    const term = this.searchControl.value.trim().toLowerCase();
    const items = this.banks().filter((bank) =>
      [bank.bankNameEn, bank.bankNameAr, bank.shortName, String(bank.bankCode)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
    this.filtered.set(items);
    this.currentPage.set(1);
  }

  setPageSize(event: Event): void {
    this.pageSize.set(Number((event.target as HTMLSelectElement).value));
    this.currentPage.set(1);
  }

  prevPage(): void {
    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  nextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
  }

  confirmDelete(bank: Bank): void {
    if (!confirm('Delete bank?')) {
      return;
    }

    this.api
      .deleteBank(bank.bankId, {
        bankId: bank.bankId,
        deletedBy: SYSTEM_USER,
      })
      .subscribe({
        next: () => {
          this.toast.success('Deleted');
          this.loadBanks();
        },
        error: () => this.toast.error('Delete failed'),
      });
  }

  private loadBanks(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getBanks().subscribe({
      next: (items) => {
        this.banks.set(items);
        this.filtered.set(items);
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
