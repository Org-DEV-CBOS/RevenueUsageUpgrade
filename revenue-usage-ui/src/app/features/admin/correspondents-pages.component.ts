import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { Correspondent } from '../../core/models/common.model';
import { Country } from '../../core/models/country.model';
import { CorrespondentsApiService, LookupsApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { extractHttpError } from '../../core/utils/http-error.util';
import { LocalizedFieldPipe } from '../../shared/pipes/localized-name.pipe';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ConfirmService } from '../../core/services/confirm.service';
import { SearchSelectComponent, SearchSelectOption } from '../../shared/components/search-select/search-select.component';

@Component({
  selector: 'app-correspondent-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, ReactiveFormsModule, LocalizedFieldPipe, PaginationComponent],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'CORRESPONDENTS.TITLE' | translate }}</h1>
        <a routerLink="/admin/correspondents/create" class="btn-primary">{{ 'CORRESPONDENTS.ADD' | translate }}</a>
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
        } @else if (!items().length) {
          <p>{{ 'COMMON.NO_DATA' | translate }}</p>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ 'CORRESPONDENTS.NAME' | translate }}</th>
                <th>{{ 'CORRESPONDENTS.CODE' | translate }}</th>
                <th>{{ 'CORRESPONDENTS.COUNTRY' | translate }}</th>
                <th>{{ 'COMMON.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (item of items(); track item.correspondentId) {
                <tr>
                  <td>{{ item | localizedField:'correspondentNameEn':'correspondentNameAr' }}</td>
                  <td>{{ item.correspondentCode }}</td>
                  <td>{{ item | localizedField:'countryNameEn':'countryNameAr' }}</td>
                  <td>
                    <a [routerLink]="['/admin/correspondents/edit', item.correspondentId]" class="btn-icon">✎</a>
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
export class CorrespondentListComponent implements OnInit {
  private readonly api = inject(CorrespondentsApiService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly auth = inject(AuthService);
  private readonly confirm = inject(ConfirmService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly items = signal<Correspondent[]>([]);
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

  async confirmDelete(item: Correspondent): Promise<void> {
    if (!(await this.confirm.confirmDelete())) {
      return;
    }

    this.api.delete(item.correspondentId, this.auth.actor()).subscribe({
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
        activeOnly: false,
        page: this.currentPage(),
        pageSize: this.pageSize(),
        search: this.searchControl.value.trim() || undefined,
      })
      .subscribe({
        next: (response) => {
          this.items.set(response.items ?? []);
          this.totalCount.set(response.totalCount ?? 0);
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
  selector: 'app-correspondent-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink, SearchSelectComponent],
  providers: [LocalizedFieldPipe],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ (isEdit ? 'COMMON.EDIT' : 'CORRESPONDENTS.ADD') | translate }}</h1>
        <a routerLink="/admin/correspondents" class="btn-secondary">{{ 'COMMON.BACK' | translate }}</a>
      </div>

      @if (error()) {
        <div class="error-banner">{{ error() }}</div>
      }

      <form class="form-panel" [formGroup]="form" (ngSubmit)="save()">
        <label>
          {{ 'CORRESPONDENTS.NAME_EN' | translate }} *
          <input formControlName="correspondentNameEn" />
        </label>
        <label>
          {{ 'CORRESPONDENTS.NAME_AR' | translate }}
          <input formControlName="correspondentNameAr" />
        </label>
        <label>
          {{ 'CORRESPONDENTS.CODE' | translate }} *
          <input formControlName="correspondentCode" />
        </label>
        <label>
          {{ 'CORRESPONDENTS.COUNTRY' | translate }} *
          <app-search-select formControlName="countryId" [options]="countryOptions()" />
        </label>
        @if (isEdit) {
          <label class="checkbox">
            <input type="checkbox" formControlName="isActive" /> {{ 'COMMON.ACTIVE' | translate }}
          </label>
        }
        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
            {{ 'COMMON.SAVE' | translate }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class CorrespondentFormComponent implements OnInit {
  private readonly api = inject(CorrespondentsApiService);
  private readonly lookups = inject(LookupsApiService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly localized = inject(LocalizedFieldPipe);

  isEdit = false;
  id = '';
  readonly saving = signal(false);
  readonly error = signal('');
  readonly countries = signal<Country[]>([]);

  countryOptions(): SearchSelectOption[] {
    return this.countries().map((country) => ({
      value: country.countryId,
      label: this.localized.transform(country, 'countryNameEn', 'countryNameAr'),
    }));
  }

  readonly form = this.fb.nonNullable.group({
    correspondentCode: ['', Validators.required],
    correspondentNameEn: ['', [Validators.required, Validators.minLength(3)]],
    correspondentNameAr: [''],
    countryId: ['', Validators.required],
    isActive: [true],
  });

  ngOnInit(): void {
    this.lookups.getCountries().subscribe({
      next: (data) => this.countries.set(data),
      error: () => this.countries.set([]),
    });

    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEdit = !!this.id;
    if (!this.isEdit) {
      return;
    }

    this.api.getById(this.id).subscribe({
      next: (item) =>
        this.form.patchValue({
          correspondentCode: item.correspondentCode,
          correspondentNameEn: item.correspondentNameEn,
          correspondentNameAr: item.correspondentNameAr ?? '',
          countryId: item.countryId ?? '',
          isActive: item.isActive,
        }),
      error: (err) => this.error.set(extractHttpError(err)),
    });
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    this.saving.set(true);
    this.error.set('');
    const value = this.form.getRawValue();
    const actor = this.auth.actor();
    const request$ = this.isEdit
      ? this.api.update(this.id, {
          correspondentId: this.id,
          correspondentCode: value.correspondentCode,
          correspondentNameEn: value.correspondentNameEn,
          correspondentNameAr: value.correspondentNameAr || null,
          countryId: value.countryId,
          isActive: value.isActive,
          modifiedBy: actor,
        })
      : this.api.create({
          correspondentCode: value.correspondentCode,
          correspondentNameEn: value.correspondentNameEn,
          correspondentNameAr: value.correspondentNameAr || null,
          countryId: value.countryId,
          createdBy: actor,
        });

    request$.subscribe({
      next: () => {
        this.toast.success(this.translate.instant('COMMON.SUCCESS'));
        void this.router.navigateByUrl('/admin/correspondents');
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(extractHttpError(err));
        this.toast.error(extractHttpError(err));
      },
    });
  }
}
