import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

export interface DateRange {
  startDate: string;
  endDate: string;
}

/** Date-range plus optional free-text search, shared by every operation list and report. */
@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  template: `
    <div class="filter-bar">
      <label>
        {{ 'COMMON.FROM_DATE' | translate }}
        <input type="date" [(ngModel)]="startDate" />
      </label>
      <label>
        {{ 'COMMON.TO_DATE' | translate }}
        <input type="date" [(ngModel)]="endDate" />
      </label>
      @if (showSearch()) {
        <label class="grow">
          {{ 'COMMON.SEARCH' | translate }}
          <input type="search" [(ngModel)]="search" (keyup.enter)="apply()" />
        </label>
      }
      <ng-content />
      <div class="filter-actions">
        <button type="button" class="btn-primary" (click)="apply()">
          {{ 'COMMON.APPLY' | translate }}
        </button>
        <button type="button" class="btn-secondary" (click)="reset()">
          {{ 'COMMON.CLEAR' | translate }}
        </button>
      </div>
    </div>
  `,
})
export class FilterBarComponent {
  readonly showSearch = input(false);

  readonly startDate = model('');
  readonly endDate = model('');
  readonly search = model('');

  readonly filtersChange = output<void>();

  apply(): void {
    this.filtersChange.emit();
  }

  reset(): void {
    this.startDate.set('');
    this.endDate.set('');
    this.search.set('');
    this.filtersChange.emit();
  }
}
