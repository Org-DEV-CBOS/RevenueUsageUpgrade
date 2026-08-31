import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    @if (totalCount() > 0) {
      <div class="pagination">
        <span>{{ 'COMMON.RECORDS_PER_PAGE' | translate }}</span>
        <select [value]="pageSize()" (change)="onPageSize($event)">
          @for (size of pageSizes; track size) {
            <option [value]="size">{{ size }}</option>
          }
        </select>
        <span>{{ page() }} {{ 'COMMON.OF' | translate }} {{ totalPages() }}</span>
        <button type="button" (click)="prev()" [disabled]="page() <= 1">&lt;</button>
        <button type="button" (click)="next()" [disabled]="page() >= totalPages()">&gt;</button>
      </div>
    }
  `,
})
export class PaginationComponent {
  readonly page = input(1);
  readonly pageSize = input(10);
  readonly totalCount = input(0);
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();
  readonly pageSizes = [10, 15, 20, 25, 50];

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount() / this.pageSize()) || 1);
  }

  prev(): void {
    if (this.page() > 1) {
      this.pageChange.emit(this.page() - 1);
    }
  }

  next(): void {
    if (this.page() < this.totalPages()) {
      this.pageChange.emit(this.page() + 1);
    }
  }

  onPageSize(event: Event): void {
    this.pageSizeChange.emit(Number((event.target as HTMLSelectElement).value));
  }
}
