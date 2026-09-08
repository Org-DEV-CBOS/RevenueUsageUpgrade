import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Bank,
  CreateBankRequest,
  DeleteBankRequest,
  UpdateBankRequest,
} from '../models/bank.model';
import {
  Company,
  CreateCompanyRequest,
  DeleteCompanyRequest,
  UpdateCompanyRequest,
} from '../models/company.model';
import {
  Country,
  CreateCountryRequest,
  DeleteCountryRequest,
  UpdateCountryRequest,
} from '../models/country.model';
import {
  AccountStatementRow,
  Beneficiary,
  ClientType,
  Correspondent,
  CorrespondentAccount,
  Coverage,
  CreateTransferRequest,
  Currency,
  CurrencyStatementRow,
  DashboardSummary,
  Deal,
  DeleteMasterDataRequest,
  CrossRate,
  ExchangeRateRow,
  FinalBankPosition,
  MovementReportRow,
  Obligation,
  ObligationStatement,
  ObligationType,
  PagedResponse,
  ReserveSnapshot,
  ResourceListItem,
  ResourceType,
  TransferListItem,
} from '../models/common.model';
import { AuthService } from '../auth/auth.service';

export const LOOKUP_PAGE_SIZE = 500;

export interface PageQuery {
  page?: number;
  pageSize?: number;
  pageNumber?: number;
  search?: string;
}

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}

export type ExportFormat = 'xlsx' | 'pdf';

function toHttpParams(params?: Record<string, unknown> | object): HttpParams | undefined {
  if (!params) {
    return undefined;
  }

  let httpParams = new HttpParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      httpParams = httpParams.set(key, String(value));
    }
  }

  return httpParams.keys().length ? httpParams : undefined;
}

export function pagedItems<T>(response: PagedResponse<T> | T[] | null | undefined): T[] {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  return response.items ?? [];
}

type QueryParams = Record<string, string | number | boolean | undefined | null>;

@Injectable({ providedIn: 'root' })
export class LookupsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/lookups`;

  getBanksPaged(params?: PageQuery) {
    return this.http.get<PagedResponse<Bank>>(`${this.baseUrl}/banks`, { params: toHttpParams(params) });
  }

  getBanks() {
    return this.getBanksPaged({ page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  getBank(id: string) {
    return this.http.get<Bank>(`${this.baseUrl}/banks/${id}`);
  }

  createBank(payload: CreateBankRequest) {
    return this.http.post<string>(`${this.baseUrl}/banks`, payload);
  }

  updateBank(id: string, payload: UpdateBankRequest) {
    return this.http.put(`${this.baseUrl}/banks/${id}`, payload);
  }

  deleteBank(id: string, payload: DeleteBankRequest) {
    return this.http.delete(`${this.baseUrl}/banks/${id}`, { body: payload });
  }

  getCompaniesPaged(params?: PageQuery) {
    return this.http.get<PagedResponse<Company>>(`${this.baseUrl}/companies`, { params: toHttpParams(params) });
  }

  getCompanies() {
    return this.getCompaniesPaged({ page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  getCompany(id: string) {
    return this.http.get<Company>(`${this.baseUrl}/companies/${id}`);
  }

  createCompany(payload: CreateCompanyRequest) {
    return this.http.post<string>(`${this.baseUrl}/companies`, payload);
  }

  updateCompany(id: string, payload: UpdateCompanyRequest) {
    return this.http.put(`${this.baseUrl}/companies/${id}`, payload);
  }

  deleteCompany(id: string, payload: DeleteCompanyRequest) {
    return this.http.delete(`${this.baseUrl}/companies/${id}`, { body: payload });
  }

  getCountriesPaged(params?: PageQuery) {
    return this.http.get<PagedResponse<Country>>(`${this.baseUrl}/countries`, { params: toHttpParams(params) });
  }

  getCountries() {
    return this.getCountriesPaged({ page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  getCountry(id: string) {
    return this.http.get<Country>(`${this.baseUrl}/countries/${id}`);
  }

  createCountry(payload: CreateCountryRequest) {
    return this.http.post<string>(`${this.baseUrl}/countries`, payload);
  }

  updateCountry(id: string, payload: UpdateCountryRequest) {
    return this.http.put(`${this.baseUrl}/countries/${id}`, payload);
  }

  deleteCountry(id: string, payload: DeleteCountryRequest) {
    return this.http.delete(`${this.baseUrl}/countries/${id}`, { body: payload });
  }
}

@Injectable({ providedIn: 'root' })
export class CorrespondentsApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/correspondents`;

  getPaged(params?: { activeOnly?: boolean } & PageQuery) {
    return this.http.get<PagedResponse<Correspondent>>(this.baseUrl, { params: toHttpParams(params) });
  }

  getAll(params?: { activeOnly?: boolean }) {
    return this.getPaged({ ...params, page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  getById(id: string) {
    return this.http.get<Correspondent>(`${this.baseUrl}/${id}`);
  }

  create(payload: Record<string, unknown>) {
    return this.http.post<string>(this.baseUrl, { createdBy: this.auth.actor(), ...payload });
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.http.put(`${this.baseUrl}/${id}`, { modifiedBy: this.auth.actor(), ...payload });
  }

  delete(id: string, deletedBy?: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      body: { deletedBy: deletedBy ?? this.auth.actor() } satisfies DeleteMasterDataRequest,
    });
  }
}

@Injectable({ providedIn: 'root' })
export class CorrespondentAccountsApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/correspondentaccounts`;

  getPaged(params?: { correspondentId?: string; currencyId?: string; activeOnly?: boolean } & PageQuery) {
    return this.http.get<PagedResponse<CorrespondentAccount>>(this.baseUrl, { params: toHttpParams(params) });
  }

  getAll(params?: { correspondentId?: string; currencyId?: string; activeOnly?: boolean }) {
    return this.getPaged({ ...params, page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  getById(id: string) {
    return this.http.get<CorrespondentAccount>(`${this.baseUrl}/${id}`);
  }

  create(payload: Record<string, unknown>) {
    return this.http.post<string>(this.baseUrl, { ...payload, createdBy: this.auth.actor() });
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.http.put(`${this.baseUrl}/${id}`, { ...payload, modifiedBy: this.auth.actor() });
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      body: { deletedBy: this.auth.actor() } satisfies DeleteMasterDataRequest,
    });
  }
}

@Injectable({ providedIn: 'root' })
export class BeneficiariesApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/beneficiaries`;

  getPaged(params?: { activeOnly?: boolean } & PageQuery) {
    return this.http.get<PagedResponse<Beneficiary>>(this.baseUrl, { params: toHttpParams(params) });
  }

  getAll(params?: { activeOnly?: boolean }) {
    return this.getPaged({ ...params, page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  create(payload: Record<string, unknown>) {
    return this.http.post(this.baseUrl, { ...payload, actor: this.auth.actor() });
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.http.put(`${this.baseUrl}/${id}`, { ...payload, actor: this.auth.actor() });
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      body: { deletedBy: this.auth.actor() } satisfies DeleteMasterDataRequest,
    });
  }

  getTransfers(beneficiaryId: string, params?: DateRangeQuery & PageQuery) {
    return this.http.get<PagedResponse<TransferListItem>>(`${this.baseUrl}/${beneficiaryId}/transfers`, {
      params: toHttpParams(params),
    });
  }
}

@Injectable({ providedIn: 'root' })
export class CurrenciesApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/currencies`;

  getPaged(params?: PageQuery) {
    return this.http.get<PagedResponse<Currency>>(this.baseUrl, { params: toHttpParams(params) });
  }

  getAll() {
    return this.getPaged({ page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  create(payload: Record<string, unknown>) {
    return this.http.post(this.baseUrl, { ...payload, actor: this.auth.actor() });
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.http.put(`${this.baseUrl}/${id}`, { ...payload, actor: this.auth.actor() });
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      body: { deletedBy: this.auth.actor() } satisfies DeleteMasterDataRequest,
    });
  }

  getBalances(params?: PageQuery) {
    return this.http.get<PagedResponse<unknown>>(`${this.baseUrl}/balances`, { params: toHttpParams(params) });
  }

  getDailyValuation(valuationDate?: string, params?: PageQuery) {
    return this.http.get<PagedResponse<unknown>>(`${this.baseUrl}/daily-valuation`, {
      params: toHttpParams({ valuationDate, ...params }),
    });
  }

  getExchangeRates(
    params?: { rateDate?: string; fromCurrencyId?: string; toCurrencyId?: string } & PageQuery,
  ) {
    return this.http.get<PagedResponse<ExchangeRateRow>>(`${this.baseUrl}/exchange-rates`, {
      params: toHttpParams(params),
    });
  }

  /** Rate between two currencies as of a date, derived through USD by the server. */
  getCrossRate(fromCurrencyId: string, toCurrencyId: string, asOfDate?: string) {
    return this.http.get<CrossRate>(`${this.baseUrl}/cross-rate`, {
      params: toHttpParams({ fromCurrencyId, toCurrencyId, asOfDate }),
    });
  }

  addExchangeRate(payload: Record<string, unknown>) {
    return this.http.post(`${this.baseUrl}/exchange-rates`, { ...payload, createdBy: this.auth.actor() });
  }

  deleteExchangeRate(exchangeRateId: string) {
    return this.http.delete(`${this.baseUrl}/exchange-rates/${exchangeRateId}`, {
      body: { exchangeRateId, deletedBy: this.auth.actor() },
    });
  }

  getCorrespondentBalances(params?: PageQuery) {
    return this.http.get<PagedResponse<unknown>>(`${this.baseUrl}/correspondent-balances`, {
      params: toHttpParams(params),
    });
  }
}

@Injectable({ providedIn: 'root' })
export class TransfersApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/transfer`;

  getTransfers(params?: QueryParams) {
    return this.http.get<PagedResponse<TransferListItem>>(this.baseUrl, { params: toHttpParams(params) });
  }

  createTransfer(payload: CreateTransferRequest) {
    return this.http.post(this.baseUrl, { ...payload, createdBy: payload.createdBy ?? this.auth.actor() });
  }

  /** Reference and statement date are only sent when the transfer is still missing them. */
  confirmTransfer(transferId: string, referenceNo?: string | null, statementDate?: string | null) {
    return this.http.put(`${this.baseUrl}/ConfirmTransfer`, {
      transferId,
      referenceNo: referenceNo || null,
      statementDate: statementDate || null,
      confirmedBy: this.auth.actor(),
    });
  }

  rejectTransfer(transferId: string, rejectReason: string) {
    return this.http.put(`${this.baseUrl}/RejectTransfer`, {
      transferId,
      rejectReason,
      rejectedBy: this.auth.actor(),
    });
  }

  deleteTransfer(transferId: string) {
    return this.http.delete(`${this.baseUrl}/${transferId}`, {
      body: { transferId, deletedBy: this.auth.actor() },
    });
  }

  getCorrespondentAccountStatement(params: QueryParams) {
    return this.http.get<PagedResponse<AccountStatementRow>>(
      `${this.baseUrl}/Statement/GetCorrespondentAccountStatement`,
      { params: toHttpParams(params) },
    );
  }

  getFinalBankPosition(date: string) {
    return this.http.get<FinalBankPosition>(`${this.baseUrl}/Statement/GetFinalBankPosition`, {
      params: toHttpParams({ date }),
    });
  }

  getCurrencyStatement(currencyId: string, asOfDate: string, params?: PageQuery) {
    return this.http.get<PagedResponse<CurrencyStatementRow>>(`${this.baseUrl}/Statement/GetCurrencyStatement`, {
      params: toHttpParams({ currencyId, asOfDate, ...params }),
    });
  }
}

@Injectable({ providedIn: 'root' })
export class ObligationsApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/obligations`;

  getPaged(params?: { activeOnly?: boolean; clientTypeId?: string } & PageQuery) {
    return this.http.get<PagedResponse<Obligation>>(this.baseUrl, { params: toHttpParams(params) });
  }

  getAll(params?: { activeOnly?: boolean; clientTypeId?: string }) {
    return this.getPaged({ ...params, page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  getClientTypesPaged(params?: { activeOnly?: boolean } & PageQuery) {
    return this.http.get<PagedResponse<ClientType>>(`${this.baseUrl}/client-types`, {
      params: toHttpParams(params),
    });
  }

  getClientTypes(params?: { activeOnly?: boolean }) {
    return this.getClientTypesPaged({ ...params, page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  /** Client types are renamed and deactivated, never created or deleted. */
  updateClientType(id: string, payload: Record<string, unknown>) {
    return this.http.put(`${this.baseUrl}/client-types/${id}`, { actor: this.auth.actor(), ...payload });
  }

  getTypesPaged(params?: { activeOnly?: boolean } & PageQuery) {
    return this.http.get<PagedResponse<ObligationType>>(`${this.baseUrl}/types`, {
      params: toHttpParams(params),
    });
  }

  getTypes(params?: { activeOnly?: boolean }) {
    return this.getTypesPaged({ ...params, page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  createType(payload: Record<string, unknown>) {
    return this.http.post(`${this.baseUrl}/types`, { actor: this.auth.actor(), ...payload });
  }

  updateType(id: string, payload: Record<string, unknown>) {
    return this.http.put(`${this.baseUrl}/types/${id}`, { actor: this.auth.actor(), ...payload });
  }

  deleteType(id: string) {
    return this.http.delete(`${this.baseUrl}/types/${id}`, {
      body: { deletedBy: this.auth.actor() } satisfies DeleteMasterDataRequest,
    });
  }

  create(payload: Record<string, unknown>) {
    return this.http.post<{ obligationId: string }>(this.baseUrl, {
      ...payload,
      createdBy: this.auth.actor(),
    });
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      body: { deletedBy: this.auth.actor() } satisfies DeleteMasterDataRequest,
    });
  }

  addPayment(payload: Record<string, unknown>) {
    return this.http.post(`${this.baseUrl}/payment`, { ...payload, createdBy: this.auth.actor() });
  }

  deletePayment(obligationPaymentId: string) {
    return this.http.delete(`${this.baseUrl}/payment/${obligationPaymentId}`, {
      body: { obligationPaymentId, deletedBy: this.auth.actor() },
    });
  }

  getStatement(obligationId: string) {
    return this.http.get<ObligationStatement>(`${this.baseUrl}/statement/${obligationId}`);
  }
}

@Injectable({ providedIn: 'root' })
export class ResourcesApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/resources`;

  getTypesPaged(params?: { activeOnly?: boolean } & PageQuery) {
    return this.http.get<PagedResponse<ResourceType>>(`${this.baseUrl}/types`, { params: toHttpParams(params) });
  }

  getTypes(params?: { activeOnly?: boolean }) {
    return this.getTypesPaged({ ...params, page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  createType(payload: Record<string, unknown>) {
    return this.http.post(`${this.baseUrl}/types`, { actor: this.auth.actor(), ...payload });
  }

  updateType(id: string, payload: Record<string, unknown>) {
    return this.http.put(`${this.baseUrl}/types/${id}`, { actor: this.auth.actor(), ...payload });
  }

  deleteType(id: string, deletedBy?: string) {
    return this.http.delete(`${this.baseUrl}/types/${id}`, {
      body: { deletedBy: deletedBy ?? this.auth.actor() } satisfies DeleteMasterDataRequest,
    });
  }

  getPaged(
    params?: { correspondentAccountId?: string; resourceTypeId?: string } & DateRangeQuery & PageQuery,
  ) {
    return this.http.get<PagedResponse<ResourceListItem>>(this.baseUrl, { params: toHttpParams(params) });
  }

  addResource(payload: Record<string, unknown>) {
    return this.http.post(this.baseUrl, { ...payload, createdBy: this.auth.actor() });
  }

  getStatement(correspondentAccountId: string, params?: DateRangeQuery & PageQuery) {
    return this.http.get<PagedResponse<unknown>>(`${this.baseUrl}/statement/${correspondentAccountId}`, {
      params: toHttpParams(params),
    });
  }

  deleteResource(resourceId: string) {
    return this.http.delete(`${this.baseUrl}/${resourceId}`, {
      body: { resourceId, deletedBy: this.auth.actor() },
    });
  }
}

@Injectable({ providedIn: 'root' })
export class DealsApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/deals`;

  getPaged(params?: { correspondentAccountId?: string } & DateRangeQuery & PageQuery) {
    return this.http.get<PagedResponse<Deal>>(this.baseUrl, { params: toHttpParams(params) });
  }

  getAll(params?: { correspondentAccountId?: string } & DateRangeQuery) {
    return this.getPaged({ ...params, page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  create(payload: Record<string, unknown>) {
    return this.http.post<{ dealId: string }>(this.baseUrl, { ...payload, createdBy: this.auth.actor() });
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, { body: { deletedBy: this.auth.actor() } });
  }
}

@Injectable({ providedIn: 'root' })
export class CoveragesApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/coverages`;

  getPaged(params?: { correspondentAccountId?: string } & DateRangeQuery & PageQuery) {
    return this.http.get<PagedResponse<Coverage>>(this.baseUrl, { params: toHttpParams(params) });
  }

  getAll(params?: { correspondentAccountId?: string } & DateRangeQuery) {
    return this.getPaged({ ...params, page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  create(payload: Record<string, unknown>) {
    return this.http.post<{ coverageId: string }>(this.baseUrl, { ...payload, createdBy: this.auth.actor() });
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, { body: { deletedBy: this.auth.actor() } });
  }
}

@Injectable({ providedIn: 'root' })
export class ReservesApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/reserves`;

  getPaged(params?: DateRangeQuery & PageQuery) {
    return this.http.get<PagedResponse<ReserveSnapshot>>(this.baseUrl, { params: toHttpParams(params) });
  }

  getAll(params?: DateRangeQuery) {
    return this.getPaged({ ...params, page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  create(payload: Record<string, unknown>) {
    return this.http.post<{ reserveSnapshotId: string }>(this.baseUrl, {
      ...payload,
      createdBy: this.auth.actor(),
    });
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, { body: { deletedBy: this.auth.actor() } });
  }
}

@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reports`;

  getDashboard(asOfDate?: string) {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard`, { params: toHttpParams({ asOfDate }) });
  }

  getForeignReserve(startDate: string, endDate: string, params?: PageQuery) {
    return this.http.get<PagedResponse<unknown>>(`${this.baseUrl}/foreign-reserve`, {
      params: toHttpParams({ startDate, endDate, ...params }),
    });
  }

  getObligationsReport(
    params?: { status?: string; clientTypeId?: string } & DateRangeQuery & PageQuery,
  ) {
    return this.http.get<PagedResponse<unknown>>(`${this.baseUrl}/obligations`, { params: toHttpParams(params) });
  }

  getCreditMovements(startDate: string, endDate: string, params?: { searchValue?: string } & PageQuery) {
    return this.http.get<PagedResponse<MovementReportRow>>(`${this.baseUrl}/credit-movements`, {
      params: toHttpParams({ startDate, endDate, ...params }),
    });
  }

  getDebitMovements(startDate: string, endDate: string, params?: { searchValue?: string } & PageQuery) {
    return this.http.get<PagedResponse<MovementReportRow>>(`${this.baseUrl}/debit-movements`, {
      params: toHttpParams({ startDate, endDate, ...params }),
    });
  }

  getResourcesReport(params?: DateRangeQuery & PageQuery) {
    return this.http.get<PagedResponse<unknown>>(`${this.baseUrl}/resources`, { params: toHttpParams(params) });
  }

  getCorrespondentBalancesReport(params?: { searchValue?: string } & PageQuery) {
    return this.http.get<PagedResponse<unknown>>(`${this.baseUrl}/correspondent-balances`, {
      params: toHttpParams(params),
    });
  }

  /** Reports expose `/export` siblings that stream xlsx or pdf for the same filters. */
  export(reportPath: string, format: ExportFormat, filters?: Record<string, unknown>) {
    return this.http.get(`${this.baseUrl}/${reportPath}/export`, {
      params: toHttpParams({ ...filters, format }),
      responseType: 'blob',
    });
  }
}

@Injectable({ providedIn: 'root' })
export class HealthApiService {
  private readonly http = inject(HttpClient);

  check() {
    const root = environment.apiUrl.replace(/\/api\/?$/, '');
    return this.http.get<{ status: string }>(`${root}/HealthCheck`);
  }
}
