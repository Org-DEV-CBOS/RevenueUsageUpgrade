import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TransferListItem } from '../../core/models/common.model';
import { TransfersApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { LookupCacheService } from '../../core/services/lookup-cache.service';
import { ToastService } from '../../core/services/toast.service';
import { extractHttpError } from '../../core/utils/http-error.util';
import { promptForReason, promptForTransferConfirmation } from '../../core/utils/prompt.util';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SearchSelectComponent } from '../../shared/components/search-select/search-select.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

@Component({
  selector: 'app-transfer-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    ReactiveFormsModule,
    TranslatePipe,
    MoneyPipe,
    PaginationComponent,
    FilterBarComponent,
    SearchSelectComponent,
  ],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'TRANSFERS.TITLE' | translate }}</h1>
        <a routerLink="/app/transfers/create" class="btn-primary">{{ 'TRANSFERS.ADD' | translate }}</a>
      </div>

      <app-filter-bar [(startDate)]="startDate" [(endDate)]="endDate" (filtersChange)="applyFilters()">
        <label>
          {{ 'NAV.ACCOUNTS' | translate }}
          <app-search-select [options]="lookups.accountOptions()" [formControl]="accountControl" />
        </label>
        <label>
          {{ 'TRANSFERS.STATUS' | translate }}
          <select [formControl]="statusControl">
            <option value="">{{ 'COMMON.ALL' | translate }}</option>
            <option value="Pending">{{ 'TRANSFERS.PENDING' | translate }}</option>
            <option value="Confirmed">{{ 'TRANSFERS.CONFIRMED' | translate }}</option>
            <option value="Rejected">{{ 'TRANSFERS.REJECTED' | translate }}</option>
          </select>
        </label>
      </app-filter-bar>

      @if (error()) { <div class="error-banner">{{ error() }}</div> }

      <div class="panel">
        @if (loading()) {
          <p>{{ 'COMMON.LOADING' | translate }}</p>
        } @else if (!transfers().length) {
          <p>{{ 'COMMON.NO_DATA' | translate }}</p>
        } @else {
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ 'TRANSFERS.REFERENCE' | translate }}</th>
                  <th>{{ 'TRANSFERS.AMOUNT' | translate }}</th>
                  <th>{{ 'TRANSFERS.DATE' | translate }}</th>
                  <th>{{ 'TRANSFERS.STATEMENT_DATE' | translate }}</th>
                  <th>{{ 'NAV.ACCOUNTS' | translate }}</th>
                  <th>{{ 'NAV.BENEFICIARIES' | translate }}</th>
                  <th>{{ 'TRANSFERS.PURPOSE' | translate }}</th>
                  <th>{{ 'TRANSFERS.STATUS' | translate }}</th>
                  <th>{{ 'COMMON.ACTIONS' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (transfer of transfers(); track transfer.transferId) {
                  <tr>
                    <td>{{ transfer.referenceNo }}</td>
                    <td class="money">{{ transfer.amount | money }} {{ transfer.currencySymbol }}</td>
                    <td>{{ transfer.transferDate | date: 'mediumDate' }}</td>
                    <td>{{ transfer.statementDate | date: 'mediumDate' }}</td>
                    <td>{{ transfer.accountName }}</td>
                    <td>{{ transfer.beneficiaryName }}</td>
                    <td>{{ transfer.purpose }}</td>
                    <td>
                      <span class="status-badge {{ transfer.transferStatus.toLowerCase() }}">
                        {{ statusLabel(transfer.transferStatus) | translate }}
                      </span>
                    </td>
                    <td>
                      @if (transfer.transferStatus === 'Pending') {
                        <button type="button" class="btn-icon" [title]="'TRANSFERS.CONFIRM' | translate" (click)="confirmTransfer(transfer)">✔</button>
                        <button type="button" class="btn-icon danger" [title]="'TRANSFERS.REJECT' | translate" (click)="rejectTransfer(transfer)">✖</button>
                      }
                      <button type="button" class="btn-icon danger" [title]="'COMMON.DELETE' | translate" (click)="deleteTransfer(transfer)">🗑</button>
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
export class TransferListComponent implements OnInit {
  private readonly api = inject(TransfersApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);
  readonly lookups = inject(LookupCacheService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly transfers = signal<TransferListItem[]>([]);
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);

  startDate = signal('');
  endDate = signal('');
  readonly accountControl = this.fb.nonNullable.control('');
  readonly statusControl = this.fb.nonNullable.control('');

  ngOnInit(): void {
    this.lookups.loadAccounts();
    this.load();
  }

  statusLabel(status: string): string {
    return `TRANSFERS.${status.toUpperCase()}`;
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

  /**
   * A reference number and statement date are optional on a Pending transfer but
   * required to confirm, so ask for whatever is still missing before sending.
   */
  async confirmTransfer(transfer: TransferListItem): Promise<void> {
    let referenceNo = transfer.referenceNo;
    let statementDate = transfer.statementDate;

    if (!referenceNo || !statementDate) {
      const details = await promptForTransferConfirmation(transfer, this.translate);
      if (!details) return;
      referenceNo = details.referenceNo;
      statementDate = details.statementDate;
    }

    this.api.confirmTransfer(transfer.transferId, referenceNo, statementDate).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('TRANSFERS.CONFIRMED_MESSAGE'));
        this.lookups.refreshAccounts();
        this.load();
      },
      error: (err) => this.toast.error(extractHttpError(err)),
    });
  }

  async rejectTransfer(transfer: TransferListItem): Promise<void> {
    const reason = await promptForReason(
      this.translate.instant('TRANSFERS.REJECT'),
      this.translate.instant('TRANSFERS.REJECT_REASON'),
      this.translate,
    );
    if (reason === null) return;

    this.api.rejectTransfer(transfer.transferId, reason).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('TRANSFERS.REJECTED_MESSAGE'));
        this.load();
      },
      error: (err) => this.toast.error(extractHttpError(err)),
    });
  }

  async deleteTransfer(transfer: TransferListItem): Promise<void> {
    if (!(await this.confirm.confirmDelete())) return;
    this.api.deleteTransfer(transfer.transferId).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('COMMON.DELETED'));
        this.lookups.refreshAccounts();
        this.load();
      },
      error: (err) => this.toast.error(extractHttpError(err)),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api
      .getTransfers({
        page: this.page(),
        pageSize: this.pageSize(),
        startDate: this.startDate(),
        endDate: this.endDate(),
        correspondentAccountId: this.accountControl.value,
        status: this.statusControl.value,
      })
      .subscribe({
        next: (response) => {
          this.transfers.set(response.items ?? []);
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
