import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ReserveSnapshot } from '../../core/models/common.model';
import { ReservesApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { today } from '../../core/utils/date.util';
import { getFieldError, markFormTouched } from '../../core/utils/form-errors.util';
import { extractHttpError } from '../../core/utils/http-error.util';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';
import { MoneyInputComponent } from '../../shared/components/money-input/money-input.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

@Component({
  selector: 'app-reserve-list',
  standalone: true,
  imports: [RouterLink, DatePipe, TranslatePipe, MoneyPipe, PaginationComponent, FilterBarComponent],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'NAV.GOLD_AND_CASH' | translate }}</h1>
        <a routerLink="/app/reserves/create" class="btn-primary">{{ 'RESERVES.ADD' | translate }}</a>
      </div>

      <app-filter-bar [(startDate)]="startDate" [(endDate)]="endDate" (filtersChange)="applyFilters()" />

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
                  <th>{{ 'RESERVES.GOLD' | translate }}</th>
                  <th>{{ 'RESERVES.CASH' | translate }}</th>
                  <th>{{ 'RESERVES.DEPOSITS' | translate }}</th>
                  <th>{{ 'RESERVES.TOTAL' | translate }}</th>
                  <th>{{ 'RESOURCES.NOTES' | translate }}</th>
                  <th>{{ 'COMMON.ACTIONS' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (item of items(); track item.reserveSnapshotId) {
                  <tr>
                    <td>{{ item.reserveDate | date: 'mediumDate' }}</td>
                    <td class="money">{{ item.goldValue | money }}</td>
                    <td class="money">{{ item.cashInHand | money }}</td>
                    <td class="money">{{ item.deposits | money }}</td>
                    <td class="money">{{ item.totalValue | money }}</td>
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
export class ReserveListComponent implements OnInit {
  private readonly api = inject(ReservesApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly items = signal<ReserveSnapshot[]>([]);
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);

  startDate = signal('');
  endDate = signal('');

  ngOnInit(): void {
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

  async confirmDelete(item: ReserveSnapshot): Promise<void> {
    if (!(await this.confirm.confirmDelete())) return;
    this.api.delete(item.reserveSnapshotId).subscribe({
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
        startDate: this.startDate(),
        endDate: this.endDate(),
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
  selector: 'app-reserve-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, MoneyInputComponent, MoneyPipe],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'RESERVES.ADD' | translate }}</h1>
        <a routerLink="/app/reserves" class="btn-secondary">{{ 'COMMON.BACK' | translate }}</a>
      </div>

      @if (error()) { <div class="error-banner">{{ error() }}</div> }

      <form class="form-panel" [formGroup]="form" (ngSubmit)="save()">
        <label [class.invalid]="isInvalid('reserveDate')">
          {{ 'TRANSFERS.DATE' | translate }} *
          <input type="date" formControlName="reserveDate" />
          @if (fieldError('reserveDate'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </label>

        <label><span>{{ 'RESERVES.GOLD' | translate }}</span><app-money-input formControlName="goldValue" /></label>
        <label><span>{{ 'RESERVES.CASH' | translate }}</span><app-money-input formControlName="cashInHand" /></label>
        <label><span>{{ 'RESERVES.DEPOSITS' | translate }}</span><app-money-input formControlName="deposits" /></label>

        <p class="hint">{{ 'RESERVES.TOTAL' | translate }}: {{ total() | money }}</p>

        @if (form.hasError('allZero') && form.touched) {
          <span class="field-error">{{ 'RESERVES.AT_LEAST_ONE' | translate }}</span>
        }

        <label>
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
export class ReserveFormComponent {
  private readonly api = inject(ReservesApiService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly saving = signal(false);
  readonly error = signal('');
  private readonly values = signal({ goldValue: 0, cashInHand: 0, deposits: 0 });

  readonly form = this.fb.nonNullable.group(
    {
      reserveDate: [today(), Validators.required],
      goldValue: [0 as number | null, Validators.min(0)],
      cashInHand: [0 as number | null, Validators.min(0)],
      deposits: [0 as number | null, Validators.min(0)],
      notes: [''],
    },
    { validators: [atLeastOnePositive] },
  );

  readonly total = computed(() => {
    const { goldValue, cashInHand, deposits } = this.values();
    return goldValue + cashInHand + deposits;
  });

  constructor() {
    this.form.valueChanges.subscribe((value) =>
      this.values.set({
        goldValue: value.goldValue ?? 0,
        cashInHand: value.cashInHand ?? 0,
        deposits: value.deposits ?? 0,
      }),
    );
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
    this.form.markAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.saving.set(true);
    this.error.set('');
    const value = this.form.getRawValue();
    this.api
      .create({
        reserveDate: value.reserveDate,
        goldValue: value.goldValue ?? 0,
        cashInHand: value.cashInHand ?? 0,
        deposits: value.deposits ?? 0,
        notes: value.notes || null,
      })
      .subscribe({
        next: () => {
          this.toast.success(this.translate.instant('COMMON.SUCCESS'));
          this.router.navigateByUrl('/app/reserves');
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(extractHttpError(err));
        },
      });
  }
}

/** Mirrors the backend rule that a snapshot must carry at least one non-zero holding. */
function atLeastOnePositive(control: AbstractControl): ValidationErrors | null {
  const value = control.value as { goldValue?: number; cashInHand?: number; deposits?: number };
  const total = (value.goldValue ?? 0) + (value.cashInHand ?? 0) + (value.deposits ?? 0);
  return total > 0 ? null : { allZero: true };
}
