import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Company } from '../../core/models/company.model';
import { SYSTEM_USER } from '../../core/constants/system-user';
import { LookupsApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { LocalizedFieldPipe } from '../../shared/pipes/localized-name.pipe';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, ReactiveFormsModule, LocalizedFieldPipe, PaginationComponent],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'COMPANIES.TITLE' | translate }}</h1>
        <a routerLink="/admin/companies/create" class="btn-primary">{{ 'COMPANIES.ADD' | translate }}</a>
      </div>

      <div class="search-row">
        <input [formControl]="searchControl" [placeholder]="'COMMON.SEARCH' | translate" />
        <button type="button" class="btn-primary" (click)="applySearch()">{{ 'COMMON.SEARCH' | translate }}</button>
      </div>

      <div class="panel">
        @if (loading()) {
          <p>{{ 'COMMON.LOADING' | translate }}</p>
        } @else if (!companies().length) {
          <p>{{ 'COMMON.NO_DATA' | translate }}</p>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ 'COMPANIES.NAME' | translate }}</th>
                <th>{{ 'COMPANIES.CODE' | translate }}</th>
                <th>{{ 'COMPANIES.NOTES' | translate }}</th>
                <th>{{ 'COMMON.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (company of companies(); track company.companyId) {
                <tr>
                  <td>{{ company | localizedField:'companyNameEn':'companyNameAr' }}</td>
                  <td>{{ company.companyCode }}</td>
                  <td>{{ company.notes }}</td>
                  <td>
                    <a [routerLink]="['/admin/companies/edit', company.companyId]" class="btn-icon">✎</a>
                    <button type="button" class="btn-icon danger" (click)="confirmDelete(company)">🗑</button>
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
export class CompanyListComponent implements OnInit {
  private readonly api = inject(LookupsApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly companies = signal<Company[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);
  readonly searchControl = this.fb.nonNullable.control('');

  ngOnInit(): void {
    this.load();
  }

  applySearch(): void {
    this.currentPage.set(1);
    this.load();
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

  async confirmDelete(company: Company): Promise<void> {
    if (!(await this.confirm.confirmDelete())) {
      return;
    }

    this.api
      .deleteCompany(company.companyId, {
        companyId: company.companyId,
        deletedBy: SYSTEM_USER,
      })
      .subscribe({
        next: () => {
          this.toast.success(this.translate.instant('COMMON.DELETED'));
          this.load();
        },
        error: () => this.toast.error(this.translate.instant('COMMON.ERROR')),
      });
  }

  private load(): void {
    this.loading.set(true);
    this.api
      .getCompaniesPaged({
        page: this.currentPage(),
        pageSize: this.pageSize(),
        search: this.searchControl.value.trim() || undefined,
      })
      .subscribe({
        next: (response) => {
          this.companies.set(response.items ?? []);
          this.totalCount.set(response.totalCount ?? 0);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.toast.error('Failed to load companies');
        },
      });
  }
}

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ (isEdit ? 'COMMON.EDIT' : 'COMPANIES.ADD') | translate }}</h1>
        <a routerLink="/admin/companies" class="btn-secondary">{{ 'COMMON.BACK' | translate }}</a>
      </div>

      <form class="form-panel" [formGroup]="form" (ngSubmit)="save()">
        <label>{{ 'COMPANIES.CODE' | translate }} *<input type="number" formControlName="companyCode" /></label>
        <label>{{ 'COMPANIES.NAME_EN' | translate }}<input formControlName="companyNameEn" /></label>
        <label>{{ 'COMPANIES.NAME_AR' | translate }} *<input formControlName="companyNameAr" /></label>
        <label>{{ 'COMPANIES.SHORT_NAME' | translate }}<input formControlName="shortName" /></label>
        <label>{{ 'COMPANIES.NOTES' | translate }}<textarea formControlName="notes" rows="3"></textarea></label>
        @if (isEdit) {
          <label class="checkbox"><input type="checkbox" formControlName="isActive" /> {{ 'COMMON.ACTIVE' | translate }}</label>
        }
        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="form.invalid">{{ 'COMMON.SAVE' | translate }}</button>
          <a routerLink="/admin/companies" class="btn-secondary">{{ 'COMMON.CANCEL' | translate }}</a>
        </div>
      </form>
    </div>
  `,
})
export class CompanyFormComponent implements OnInit {
  private readonly api = inject(LookupsApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  isEdit = false;
  companyId = '';

  readonly form = this.fb.nonNullable.group({
    companyCode: [0, Validators.required],
    companyNameEn: [''],
    companyNameAr: ['', Validators.required],
    shortName: [''],
    notes: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    const segments = this.router.url.split('/');
    const editIndex = segments.indexOf('edit');
    if (editIndex >= 0) {
      this.isEdit = true;
      this.companyId = segments[editIndex + 1];
      this.api.getCompany(this.companyId).subscribe({
        next: (company) => this.form.patchValue(company),
        error: () => this.toast.error('Failed to load company'),
      });
    }
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    const actor = SYSTEM_USER;
    const request$ = this.isEdit
      ? this.api.updateCompany(this.companyId, { companyId: this.companyId, ...value, modifiedBy: actor })
      : this.api.createCompany({ ...value, createdBy: actor });

    request$.subscribe({
      next: () => this.router.navigateByUrl('/admin/companies'),
      error: () => this.toast.error('Save failed'),
    });
  }
}
