import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import {
  BeneficiariesApiService,
  CorrespondentAccountsApiService,
  CorrespondentsApiService,
  CoveragesApiService,
  CurrenciesApiService,
  DealsApiService,
  ObligationsApiService,
  ReportsApiService,
  ReservesApiService,
  ResourcesApiService,
  TransfersApiService,
} from '../../core/services/api.service';
import { extractHttpError } from '../../core/utils/http-error.util';

export interface ApiPageConfig {
  titleKey: string;
  columns: { key: string; label: string }[];
  endpoint: string;
}

@Component({
  selector: 'app-api-route-page',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="page">
      <div class="page-toolbar">
        <h1>{{ (config?.titleKey ?? '') | translate }}</h1>
      </div>

      @if (error()) {
        <div class="error-banner">{{ error() }}</div>
      }

      <div class="panel">
        @if (loading()) {
          <p>{{ 'COMMON.LOADING' | translate }}</p>
        } @else if (!rows().length) {
          <p>{{ 'COMMON.NO_DATA' | translate }}</p>
        } @else {
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  @for (column of config?.columns ?? []; track column.key) {
                    <th>{{ column.label | translate }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of rows(); track $index) {
                  <tr>
                    @for (column of config?.columns ?? []; track column.key) {
                      <td>{{ formatCell(row, column.key) }}</td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class ApiRoutePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly correspondentsApi = inject(CorrespondentsApiService);
  private readonly accountsApi = inject(CorrespondentAccountsApiService);
  private readonly beneficiariesApi = inject(BeneficiariesApiService);
  private readonly currenciesApi = inject(CurrenciesApiService);
  private readonly transfersApi = inject(TransfersApiService);
  private readonly obligationsApi = inject(ObligationsApiService);
  private readonly resourcesApi = inject(ResourcesApiService);
  private readonly dealsApi = inject(DealsApiService);
  private readonly coveragesApi = inject(CoveragesApiService);
  private readonly reservesApi = inject(ReservesApiService);
  private readonly reportsApi = inject(ReportsApiService);

  config: ApiPageConfig | null = null;
  readonly loading = signal(false);
  readonly error = signal('');
  readonly rows = signal<Record<string, unknown>[]>([]);

  ngOnInit(): void {
    this.config = this.route.snapshot.data['apiPage'] as ApiPageConfig;
    this.load();
  }

  load(): void {
    const request = this.resolveRequest();
    if (!request) {
      this.error.set('COMMON.ERROR');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    request.subscribe({
      next: (data) => {
        const items = this.normalizeRows(data);
        this.rows.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(extractHttpError(err));
      },
    });
  }

  formatCell(row: Record<string, unknown>, key: string): string {
    const value = row[key];
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  private resolveRequest(): Observable<unknown> | null {
    switch (this.config?.endpoint) {
      case 'correspondents':
        return this.correspondentsApi.getAll();
      case 'accounts':
        return this.accountsApi.getAll();
      case 'beneficiaries':
        return this.beneficiariesApi.getAll();
      case 'currencies':
        return this.currenciesApi.getAll();
      case 'currency-balances':
        return this.currenciesApi.getBalances();
      case 'currency-exchange-rates':
        return this.currenciesApi.getExchangeRates();
      case 'currency-correspondent-balances':
        return this.currenciesApi.getCorrespondentBalances();
      case 'obligations':
        return this.obligationsApi.getAll();
      case 'resource-types':
        return this.resourcesApi.getTypes();
      case 'deals':
        return this.dealsApi.getAll();
      case 'coverages':
        return this.coveragesApi.getAll();
      case 'reserves':
        return this.reservesApi.getAll();
      case 'transfers':
        return this.transfersApi.getTransfers({ pageNumber: 1, pageSize: 50 });
      case 'report-obligations':
        return this.reportsApi.getObligationsReport();
      case 'report-foreign-reserve':
        return this.reportsApi.getForeignReserve(
          new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
          new Date().toISOString(),
        );
      default:
        return null;
    }
  }

  private normalizeRows(data: unknown): Record<string, unknown>[] {
    if (Array.isArray(data)) {
      return data as Record<string, unknown>[];
    }

    if (data && typeof data === 'object' && 'items' in data) {
      return (data as { items: Record<string, unknown>[] }).items ?? [];
    }

    if (data && typeof data === 'object') {
      return [data as Record<string, unknown>];
    }

    return [];
  }
}

export const API_PAGE_CONFIGS = {
  correspondents: {
    titleKey: 'NAV.CORRESPONDENTS',
    endpoint: 'correspondents',
    columns: [
      { key: 'correspondentCode', label: 'COMMON.CODE' },
      { key: 'correspondentNameEn', label: 'BANKS.NAME_EN' },
      { key: 'correspondentNameAr', label: 'BANKS.NAME_AR' },
      { key: 'isActive', label: 'COMMON.ACTIVE' },
    ],
  },
  accounts: {
    titleKey: 'NAV.ACCOUNTS',
    endpoint: 'accounts',
    columns: [
      { key: 'accountNumber', label: 'TRANSFERS.REFERENCE' },
      { key: 'correspondentNameEn', label: 'NAV.CORRESPONDENTS' },
      { key: 'currencyCode', label: 'NAV.CURRENCIES' },
      { key: 'currentBalance', label: 'DASHBOARD.TOTAL_BALANCE' },
      { key: 'isActive', label: 'COMMON.ACTIVE' },
    ],
  },
  beneficiaries: {
    titleKey: 'NAV.BENEFICIARIES',
    endpoint: 'beneficiaries',
    columns: [
      { key: 'beneficiaryCode', label: 'COMMON.CODE' },
      { key: 'beneficiaryNameEn', label: 'BANKS.NAME_EN' },
      { key: 'beneficiaryNameAr', label: 'BANKS.NAME_AR' },
      { key: 'isActive', label: 'COMMON.ACTIVE' },
    ],
  },
  currencies: {
    titleKey: 'NAV.CURRENCIES',
    endpoint: 'currencies',
    columns: [
      { key: 'currencyCode', label: 'COMMON.CODE' },
      { key: 'currencyNameEn', label: 'BANKS.NAME_EN' },
      { key: 'currencyNameAr', label: 'BANKS.NAME_AR' },
      { key: 'symbol', label: 'BANKS.SHORT_NAME' },
      { key: 'isActive', label: 'COMMON.ACTIVE' },
    ],
  },
  obligations: {
    titleKey: 'NAV.OBLIGATIONS',
    endpoint: 'obligations',
    columns: [
      { key: 'obligationId', label: 'COMMON.CODE' },
      { key: 'obligationCode', label: 'TRANSFERS.REFERENCE' },
      { key: 'totalAmount', label: 'TRANSFERS.AMOUNT' },
      { key: 'paidAmount', label: 'TRANSFERS.STATUS' },
      { key: 'remainingAmount', label: 'DASHBOARD.TOTAL_BALANCE' },
    ],
  },
  resourceTypes: {
    titleKey: 'NAV.RESOURCES',
    endpoint: 'resource-types',
    columns: [
      { key: 'resourceTypeCode', label: 'COMMON.CODE' },
      { key: 'resourceTypeNameEn', label: 'BANKS.NAME_EN' },
      { key: 'resourceTypeNameAr', label: 'BANKS.NAME_AR' },
      { key: 'isActive', label: 'COMMON.ACTIVE' },
    ],
  },
  deals: {
    titleKey: 'NAV.DEALING',
    endpoint: 'deals',
    columns: [{ key: 'dealId', label: 'COMMON.CODE' }],
  },
  coverages: {
    titleKey: 'NAV.REPLENISHMENTS',
    endpoint: 'coverages',
    columns: [{ key: 'coverageId', label: 'COMMON.CODE' }],
  },
  reserves: {
    titleKey: 'NAV.GOLD_AND_CASH',
    endpoint: 'reserves',
    columns: [{ key: 'reserveSnapshotId', label: 'COMMON.CODE' }],
  },
  currencyBalances: {
    titleKey: 'NAV.BALANCES',
    endpoint: 'currency-balances',
    columns: [
      { key: 'currencyCode', label: 'NAV.CURRENCIES' },
      { key: 'balance', label: 'DASHBOARD.TOTAL_BALANCE' },
    ],
  },
  exchangeRates: {
    titleKey: 'NAV.CURRENCIES',
    endpoint: 'currency-exchange-rates',
    columns: [
      { key: 'rateDate', label: 'TRANSFERS.DATE' },
      { key: 'fromCurrencyCode', label: 'NAV.CURRENCIES' },
      { key: 'toCurrencyCode', label: 'NAV.CURRENCIES' },
      { key: 'rateValue', label: 'TRANSFERS.AMOUNT' },
    ],
  },
  correspondentBalances: {
    titleKey: 'NAV.BALANCES',
    endpoint: 'currency-correspondent-balances',
    columns: [
      { key: 'correspondentNameEn', label: 'NAV.CORRESPONDENTS' },
      { key: 'currencyCode', label: 'NAV.CURRENCIES' },
      { key: 'balance', label: 'DASHBOARD.TOTAL_BALANCE' },
    ],
  },
  obligationsReport: {
    titleKey: 'NAV.OBLIGATIONS',
    endpoint: 'report-obligations',
    columns: [{ key: 'obligationId', label: 'COMMON.CODE' }],
  },
  foreignReserveReport: {
    titleKey: 'NAV.FOREIGN_RESERVE',
    endpoint: 'report-foreign-reserve',
    columns: [{ key: 'reserveDate', label: 'TRANSFERS.DATE' }],
  },
} satisfies Record<string, ApiPageConfig>;
