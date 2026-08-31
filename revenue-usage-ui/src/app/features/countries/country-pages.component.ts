import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Country } from '../../core/models/country.model';
import { SYSTEM_USER } from '../../core/constants/system-user';
import { LookupsApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { LocalizedFieldPipe } from '../../shared/pipes/localized-name.pipe';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-country-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, ReactiveFormsModule, LocalizedFieldPipe, PaginationComponent],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'COUNTRIES.TITLE' | translate }}</h1>
        <a routerLink="/admin/countries/create" class="btn-primary">{{ 'COUNTRIES.ADD' | translate }}</a>
      </div>

      <div class="panel">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ 'COUNTRIES.NAME' | translate }}</th>
              <th>{{ 'COUNTRIES.CODE' | translate }}</th>
              <th>{{ 'COUNTRIES.ISO' | translate }}</th>
              <th>{{ 'COMMON.ACTIONS' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (country of countries(); track country.countryId) {
              <tr>
                <td>{{ country | localizedField:'countryNameEn':'countryNameAr' }}</td>
                <td>{{ country.countryCode }}</td>
                <td>{{ country.isoCode }}</td>
                <td>
                  <a [routerLink]="['/admin/countries/edit', country.countryId]" class="btn-icon">✎</a>
                  <button type="button" class="btn-icon danger" (click)="confirmDelete(country)">🗑</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
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
export class CountryListComponent implements OnInit {
  private readonly api = inject(LookupsApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly translate = inject(TranslateService);

  readonly countries = signal<Country[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);

  ngOnInit(): void {
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

  async confirmDelete(country: Country): Promise<void> {
    if (!(await this.confirm.confirmDelete())) {
      return;
    }

    this.api
      .deleteCountry(country.countryId, {
        countryId: country.countryId,
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
    this.api.getCountriesPaged({ page: this.currentPage(), pageSize: this.pageSize() }).subscribe({
      next: (response) => {
        this.countries.set(response.items ?? []);
        this.totalCount.set(response.totalCount ?? 0);
      },
      error: () => this.toast.error('Failed to load countries'),
    });
  }
}

@Component({
  selector: 'app-country-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ (isEdit ? 'COMMON.EDIT' : 'COUNTRIES.ADD') | translate }}</h1>
        <a routerLink="/admin/countries" class="btn-secondary">{{ 'COMMON.BACK' | translate }}</a>
      </div>

      <form class="form-panel" [formGroup]="form" (ngSubmit)="save()">
        <label>{{ 'COUNTRIES.CODE' | translate }} *<input type="number" formControlName="countryCode" /></label>
        <label>{{ 'COUNTRIES.NAME_EN' | translate }}<input formControlName="countryNameEn" /></label>
        <label>{{ 'COUNTRIES.NAME_AR' | translate }} *<input formControlName="countryNameAr" /></label>
        <label>{{ 'COUNTRIES.ISO' | translate }}<input formControlName="isoCode" /></label>
        @if (isEdit) {
          <label class="checkbox"><input type="checkbox" formControlName="isActive" /> {{ 'COMMON.ACTIVE' | translate }}</label>
        }
        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="form.invalid">{{ 'COMMON.SAVE' | translate }}</button>
        </div>
      </form>
    </div>
  `,
})
export class CountryFormComponent implements OnInit {
  private readonly api = inject(LookupsApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  isEdit = false;
  countryId = '';

  readonly form = this.fb.nonNullable.group({
    countryCode: [0, Validators.required],
    countryNameEn: [''],
    countryNameAr: ['', Validators.required],
    isoCode: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    const segments = this.router.url.split('/');
    const editIndex = segments.indexOf('edit');
    if (editIndex >= 0) {
      this.isEdit = true;
      this.countryId = segments[editIndex + 1];
      this.api.getCountry(this.countryId).subscribe({
        next: (country) => this.form.patchValue(country),
        error: () => this.toast.error('Failed to load country'),
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
      ? this.api.updateCountry(this.countryId, { countryId: this.countryId, ...value, modifiedBy: actor })
      : this.api.createCountry({ ...value, createdBy: actor });

    request$.subscribe({
      next: () => this.router.navigateByUrl('/admin/countries'),
      error: () => this.toast.error('Save failed'),
    });
  }
}
