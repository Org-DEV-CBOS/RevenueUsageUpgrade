import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { TransfersApiService } from '../../core/services/api.service';
import { TransferListItem } from '../../core/models/common.model';

@Component({
  selector: 'app-transfer-list',
  standalone: true,
  imports: [TranslatePipe, DecimalPipe, DatePipe],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ 'TRANSFERS.TITLE' | translate }}</h1>
      </div>

      <div class="panel">
        @if (loading()) {
          <p>{{ 'COMMON.LOADING' | translate }}</p>
        } @else if (!transfers().length) {
          <p>{{ 'COMMON.NO_DATA' | translate }}</p>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ 'TRANSFERS.REFERENCE' | translate }}</th>
                <th>{{ 'TRANSFERS.AMOUNT' | translate }}</th>
                <th>{{ 'TRANSFERS.DATE' | translate }}</th>
                <th>{{ 'NAV.ACCOUNTS' | translate }}</th>
                <th>{{ 'NAV.BENEFICIARIES' | translate }}</th>
                <th>{{ 'TRANSFERS.PURPOSE' | translate }}</th>
                <th>{{ 'TRANSFERS.STATUS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (transfer of transfers(); track transfer.transferId) {
                <tr>
                  <td>{{ transfer.referenceNo }}</td>
                  <td>{{ transfer.amount | number: '1.2-2' }} {{ transfer.currencyCode }}</td>
                  <td>{{ transfer.transferDate | date: 'mediumDate' }}</td>
                  <td>{{ transfer.accountName }}</td>
                  <td>{{ transfer.beneficiaryName }}</td>
                  <td>{{ transfer.purpose }}</td>
                  <td>{{ transfer.transferStatus }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
})
export class TransferListComponent implements OnInit {
  private readonly api = inject(TransfersApiService);

  readonly loading = signal(false);
  readonly transfers = signal<TransferListItem[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    this.api.getTransfers({ pageNumber: 1, pageSize: 50 }).subscribe({
      next: (response) => {
        this.transfers.set(response.items ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
