import { Component, DestroyRef, inject, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { SearchFieldComponent } from '../search-field/search-field.component';

export interface DateRange {
  startDate: string;
  endDate: string;
}

const SEARCH_DEBOUNCE_MS = 300;

/** Date-range plus optional free-text search, shared by every operation list and report. */
@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [FormsModule, TranslatePipe, SearchFieldComponent],
  template: `
    <div class="filter-bar">
      <label>
        {{ 'COMMON.FROM_DATE' | translate }}
        <input type="date" [(ngModel)]="startDate" (ngModelChange)="apply()" />
      </label>
      <label>
        {{ 'COMMON.TO_DATE' | translate }}
        <input type="date" [(ngModel)]="endDate" (ngModelChange)="apply()" />
      </label>
      @if (showSearch()) {
        <label class="grow">
          {{ 'COMMON.SEARCH' | translate }}
          <app-search-field [(ngModel)]="search" (ngModelChange)="onSearchChange()" />
        </label>
      }
      <ng-content />
      <div class="filter-actions">
        <button type="button" class="btn-secondary" (click)="reset()">
          {{ 'COMMON.CLEAR' | translate }}
        </button>
      </div>
    </div>
  `,
})
export class FilterBarComponent {
  private readonly destroyRef = inject(DestroyRef);
  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  readonly showSearch = input(false);

  readonly startDate = model('');
  readonly endDate = model('');
  readonly search = model('');

  readonly filtersChange = output<void>();

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.searchTimer));
  }

  apply(): void {
    this.filtersChange.emit();
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.apply(), SEARCH_DEBOUNCE_MS);
  }

  reset(): void {
    clearTimeout(this.searchTimer);
    this.startDate.set('');
    this.endDate.set('');
    this.search.set('');
    this.filtersChange.emit();
  }
}
