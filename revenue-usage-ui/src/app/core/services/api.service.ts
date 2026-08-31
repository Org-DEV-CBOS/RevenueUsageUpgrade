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
  Beneficiary,
  Correspondent,
  CorrespondentAccount,
  Coverage,
  CreateTransferRequest,
  Currency,
  DashboardSummary,
  Deal,
  DeleteMasterDataRequest,
  Obligation,
  PagedResponse,
  ReserveSnapshot,
  ResourceType,
  TransferListItem,
} from '../models/common.model';
import { SYSTEM_USER } from '../constants/system-user';

export const LOOKUP_PAGE_SIZE = 500;

export interface PageQuery {
  page?: number;
  pageSize?: number;
  pageNumber?: number;
  search?: string;
}

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
    return this.http.post<string>(this.baseUrl, { createdBy: SYSTEM_USER, ...payload });
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.http.put(`${this.baseUrl}/${id}`, { modifiedBy: SYSTEM_USER, ...payload });
  }

  delete(id: string, deletedBy?: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      body: { deletedBy: deletedBy ?? SYSTEM_USER } satisfies DeleteMasterDataRequest,
    });
  }
}

@Injectable({ providedIn: 'root' })
export class CorrespondentAccountsApiService {
  private readonly http = inject(HttpClient);
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
    return this.http.post<string>(this.baseUrl, { ...payload, createdBy: SYSTEM_USER });
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.http.put(`${this.baseUrl}/${id}`, { ...payload, modifiedBy: SYSTEM_USER });
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      body: { deletedBy: SYSTEM_USER } satisfies DeleteMasterDataRequest,
    });
  }
}

@Injectable({ providedIn: 'root' })
export class BeneficiariesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/beneficiaries`;

  getPaged(params?: { activeOnly?: boolean } & PageQuery) {
    return this.http.get<PagedResponse<Beneficiary>>(this.baseUrl, { params: toHttpParams(params) });
  }

  getAll(params?: { activeOnly?: boolean }) {
    return this.getPaged({ ...params, page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  create(payload: Record<string, unknown>) {
    return this.http.post(this.baseUrl, { ...payload, actor: SYSTEM_USER });
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.http.put(`${this.baseUrl}/${id}`, { ...payload, actor: SYSTEM_USER });
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      body: { deletedBy: SYSTEM_USER } satisfies DeleteMasterDataRequest,
    });
  }

  getTransfers(beneficiaryId: string, params?: { startDate?: string; endDate?: string }) {
    return this.http.get<unknown[]>(`${this.baseUrl}/${beneficiaryId}/transfers`, {
      params: toHttpParams(params),
    });
  }
}

@Injectable({ providedIn: 'root' })
export class CurrenciesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/currencies`;

  getPaged(params?: PageQuery) {
    return this.http.get<PagedResponse<Currency>>(this.baseUrl, { params: toHttpParams(params) });
  }

  getAll() {
    return this.getPaged({ page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  create(payload: Record<string, unknown>) {
    return this.http.post(this.baseUrl, { ...payload, actor: SYSTEM_USER });
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.http.put(`${this.baseUrl}/${id}`, { ...payload, actor: SYSTEM_USER });
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      body: { deletedBy: SYSTEM_USER } satisfies DeleteMasterDataRequest,
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
    return this.http.get<PagedResponse<unknown>>(`${this.baseUrl}/exchange-rates`, {
      params: toHttpParams(params),
    });
  }

  addExchangeRate(payload: Record<string, unknown>) {
    return this.http.post(`${this.baseUrl}/exchange-rates`, { ...payload, createdBy: SYSTEM_USER });
  }

  deleteExchangeRate(exchangeRateId: string) {
    return this.http.delete(`${this.baseUrl}/exchange-rates/${exchangeRateId}`, {
      body: { deletedBy: SYSTEM_USER },
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
  private readonly baseUrl = `${environment.apiUrl}/transfer`;

  getTransfers(params?: QueryParams) {
    return this.http.get<PagedResponse<TransferListItem>>(this.baseUrl, { params: toHttpParams(params) });
  }

  createTransfer(payload: CreateTransferRequest) {
    return this.http.post(this.baseUrl, { ...payload, createdBy: payload.createdBy ?? SYSTEM_USER });
  }

  confirmTransfer(transferId: string, confirmedBy = SYSTEM_USER) {
    return this.http.put(`${this.baseUrl}/ConfirmTransfer`, { transferId, confirmedBy });
  }

  rejectTransfer(transferId: string, rejectReason: string, rejectedBy = SYSTEM_USER) {
    return this.http.put(`${this.baseUrl}/RejectTransfer`, { transferId, rejectReason, rejectedBy });
  }

  deleteTransfer(transferId: string, deletedBy = SYSTEM_USER) {
    return this.http.delete(`${this.baseUrl}/${transferId}`, { body: { transferId, deletedBy } });
  }

  getCorrespondentAccountStatement(params: QueryParams) {
    return this.http.get<PagedResponse<unknown>>(`${this.baseUrl}/Statement/GetCorrespondentAccountStatement`, {
      params: toHttpParams(params),
    });
  }

  getFinalBankPosition(date: string) {
    return this.http.get<unknown>(`${this.baseUrl}/Statement/GetFinalBankPosition`, {
      params: toHttpParams({ date }),
    });
  }

  getCurrencyStatement(currencyId: string, asOfDate: string, params?: PageQuery) {
    return this.http.get<PagedResponse<unknown>>(`${this.baseUrl}/Statement/GetCurrencyStatement`, {
      params: toHttpParams({ currencyId, asOfDate, ...params }),
    });
  }
}

@Injectable({ providedIn: 'root' })
export class ObligationsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/obligations`;

  getPaged(params?: PageQuery) {
    return this.http.get<PagedResponse<Obligation>>(this.baseUrl, { params: toHttpParams(params) });
  }

  getAll() {
    return this.getPaged({ page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  create(payload: Record<string, unknown>) {
    return this.http.post(this.baseUrl, payload);
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      body: { deletedBy: SYSTEM_USER } satisfies DeleteMasterDataRequest,
    });
  }

  addPayment(payload: Record<string, unknown>) {
    return this.http.post(`${this.baseUrl}/payment`, { ...payload, createdBy: SYSTEM_USER });
  }

  deletePayment(obligationPaymentId: string) {
    return this.http.delete(`${this.baseUrl}/payment/${obligationPaymentId}`, {
      body: { deletedBy: SYSTEM_USER },
    });
  }

  getStatement(obligationId: string) {
    return this.http.get<unknown>(`${this.baseUrl}/statement/${obligationId}`);
  }
}

@Injectable({ providedIn: 'root' })
export class ResourcesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/resources`;

  getTypesPaged(params?: { activeOnly?: boolean } & PageQuery) {
    return this.http.get<PagedResponse<ResourceType>>(`${this.baseUrl}/types`, { params: toHttpParams(params) });
  }

  getTypes(params?: { activeOnly?: boolean }) {
    return this.getTypesPaged({ ...params, page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  createType(payload: Record<string, unknown>) {
    return this.http.post(`${this.baseUrl}/types`, { actor: SYSTEM_USER, ...payload });
  }

  updateType(id: string, payload: Record<string, unknown>) {
    return this.http.put(`${this.baseUrl}/types/${id}`, { actor: SYSTEM_USER, ...payload });
  }

  deleteType(id: string, deletedBy?: string) {
    return this.http.delete(`${this.baseUrl}/types/${id}`, {
      body: { deletedBy: deletedBy ?? SYSTEM_USER } satisfies DeleteMasterDataRequest,
    });
  }

  addResource(payload: Record<string, unknown>) {
    return this.http.post(this.baseUrl, { ...payload, createdBy: SYSTEM_USER });
  }

  getStatement(correspondentAccountId: string, params?: { startDate?: string; endDate?: string } & PageQuery) {
    return this.http.get<PagedResponse<unknown>>(`${this.baseUrl}/statement/${correspondentAccountId}`, {
      params: toHttpParams(params),
    });
  }

  deleteResource(resourceId: string) {
    return this.http.delete(`${this.baseUrl}/${resourceId}`, { body: { deletedBy: SYSTEM_USER } });
  }
}

@Injectable({ providedIn: 'root' })
export class DealsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/deals`;

  getPaged(params?: { correspondentAccountId?: string; startDate?: string; endDate?: string } & PageQuery) {
    return this.http.get<PagedResponse<Deal>>(this.baseUrl, { params: toHttpParams(params) });
  }

  getAll(params?: { correspondentAccountId?: string; startDate?: string; endDate?: string }) {
    return this.getPaged({ ...params, page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  create(payload: Record<string, unknown>) {
    return this.http.post(this.baseUrl, payload);
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, { body: { deletedBy: SYSTEM_USER } });
  }
}

@Injectable({ providedIn: 'root' })
export class CoveragesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/coverages`;

  getPaged(params?: { correspondentAccountId?: string; startDate?: string; endDate?: string } & PageQuery) {
    return this.http.get<PagedResponse<Coverage>>(this.baseUrl, { params: toHttpParams(params) });
  }

  getAll(params?: { correspondentAccountId?: string; startDate?: string; endDate?: string }) {
    return this.getPaged({ ...params, page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  create(payload: Record<string, unknown>) {
    return this.http.post(this.baseUrl, payload);
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, { body: { deletedBy: SYSTEM_USER } });
  }
}

@Injectable({ providedIn: 'root' })
export class ReservesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reserves`;

  getPaged(params?: { startDate?: string; endDate?: string } & PageQuery) {
    return this.http.get<PagedResponse<ReserveSnapshot>>(this.baseUrl, { params: toHttpParams(params) });
  }

  getAll(params?: { startDate?: string; endDate?: string }) {
    return this.getPaged({ ...params, page: 1, pageSize: LOOKUP_PAGE_SIZE }).pipe(map(pagedItems));
  }

  create(payload: Record<string, unknown>) {
    return this.http.post(this.baseUrl, payload);
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, { body: { deletedBy: SYSTEM_USER } });
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

  getObligationsReport(params?: { startDate?: string; endDate?: string; status?: string } & PageQuery) {
    return this.http.get<PagedResponse<unknown>>(`${this.baseUrl}/obligations`, { params: toHttpParams(params) });
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
