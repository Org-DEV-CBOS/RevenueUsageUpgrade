import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SYSTEM_USER } from '../../core/constants/system-user';
import { Correspondent } from '../../core/models/common.model';
import { Country } from '../../core/models/country.model';
import { CorrespondentsApiService, LookupsApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { extractHttpError } from '../../core/utils/http-error.util';
import { LocalizedFieldPipe } from '../../shared/pipes/localized-name.pipe';

@Component({
  selector: 'app-correspondent-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, ReactiveFormsModule, LocalizedFieldPipe],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'NAV.CORRESPONDENTS' | translate }}</h1>
        <a routerLink="/admin/correspondents/create" class="btn-primary">{{ 'CORRESPONDENTS.ADD' | translate }}</a>
      </div>

      @if (error()) {
        <div class="error-banner">{{ error() }}</div>
      }

      <div class="panel">
        @if (loading()) {
          <p>{{ 'COMMON.LOADING' | translate }}</p>
        } @else if (!items().length) {
          <p>{{ 'COMMON.NO_DATA' | translate }}</p>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ 'COMMON.CODE' | translate }}</th>
                <th>{{ 'BANKS.NAME' | translate }}</th>
                <th>{{ 'COMMON.ACTIVE' | translate }}</th>
                <th>{{ 'COMMON.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (item of items(); track item.correspondentId) {
                <tr>
                  <td>{{ item.correspondentCode }}</td>
                  <td>{{ item | localizedField:'correspondentNameEn':'correspondentNameAr' }}</td>
                  <td>{{ (item.isActive ? 'COMMON.YES' : 'COMMON.NO') | translate }}</td>
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
    </div>
  `,
})
export class CorrespondentListComponent implements OnInit {
  private readonly api = inject(CorrespondentsApiService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly items = signal<Correspondent[]>([]);

  ngOnInit(): void {
    this.load();
  }

  confirmDelete(item: Correspondent): void {
    if (!confirm('Delete correspondent?')) {
      return;
    }

    this.api.delete(item.correspondentId).subscribe({
      next: () => {
        this.toast.success('Deleted');
        this.load();
      },
      error: (err) => this.toast.error(extractHttpError(err)),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getAll().subscribe({
      next: (data) => {
        this.items.set(data);
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
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink],
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
        <label>{{ 'COMMON.CODE' | translate }} *<input formControlName="correspondentCode" /></label>
        <label>{{ 'BANKS.NAME_EN' | translate }} *<input formControlName="correspondentNameEn" /></label>
        <label>{{ 'BANKS.NAME_AR' | translate }}<input formControlName="correspondentNameAr" /></label>
        <label>
          {{ 'COUNTRIES.TITLE' | translate }}
          <select formControlName="countryId">
            <option value="">—</option>
            @for (country of countries(); track country.countryId) {
              <option [value]="country.countryId">{{ country.countryNameEn || country.countryNameAr }}</option>
            }
          </select>
        </label>
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
export class CorrespondentFormComponent implements OnInit {
  private readonly api = inject(CorrespondentsApiService);
  private readonly lookups = inject(LookupsApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  isEdit = false;
  id = '';
  readonly saving = signal(false);
  readonly error = signal('');
  readonly countries = signal<Country[]>([]);

  readonly form = this.fb.nonNullable.group({
    correspondentCode: ['', Validators.required],
    correspondentNameEn: ['', Validators.required],
    correspondentNameAr: [''],
    countryId: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    this.lookups.getCountries().subscribe({
      next: (data) => this.countries.set(data),
      error: () => this.countries.set([]),
    });

    const segments = this.router.url.split('/');
    const editIndex = segments.indexOf('edit');
    if (editIndex >= 0) {
      this.isEdit = true;
      this.id = segments[editIndex + 1];
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
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    this.saving.set(true);
    this.error.set('');
    const value = this.form.getRawValue();
    const request$ = this.isEdit
      ? this.api.update(this.id, {
          correspondentId: this.id,
          correspondentCode: value.correspondentCode,
          correspondentNameEn: value.correspondentNameEn,
          correspondentNameAr: value.correspondentNameAr || null,
          countryId: value.countryId || null,
          isActive: value.isActive,
          modifiedBy: SYSTEM_USER,
        })
      : this.api.create({
          correspondentCode: value.correspondentCode,
          correspondentNameEn: value.correspondentNameEn,
          correspondentNameAr: value.correspondentNameAr || null,
          countryId: value.countryId || null,
          createdBy: SYSTEM_USER,
        });

    request$.subscribe({
      next: () => this.router.navigateByUrl('/admin/correspondents'),
      error: (err) => {
        this.saving.set(false);
        this.error.set(extractHttpError(err));
        this.toast.error(extractHttpError(err));
      },
    });
  }
}
