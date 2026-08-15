import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  Deal,
  DeleteMasterDataRequest,
  Obligation,
  PagedResponse,
  ReserveSnapshot,
  ResourceType,
  TransferListItem,
} from '../models/common.model';
import { SYSTEM_USER } from '../constants/system-user';

type QueryParams = Record<string, string | number | boolean | undefined | null>;

function toHttpParams(params?: QueryParams): HttpParams | undefined {
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

@Injectable({ providedIn: 'root' })
export class LookupsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/lookups`;

  getBanks() {
    return this.http.get<Bank[]>(`${this.baseUrl}/banks`);
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

  getCompanies() {
    return this.http.get<Company[]>(`${this.baseUrl}/companies`);
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

  getCountries() {
    return this.http.get<Country[]>(`${this.baseUrl}/countries`);
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

  getAll() {
    return this.http.get<Correspondent[]>(this.baseUrl);
  }

  getById(id: string) {
    return this.http.get<Correspondent>(`${this.baseUrl}/${id}`);
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
export class CorrespondentAccountsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/correspondentaccounts`;

  getAll(params?: { correspondentId?: string; currencyId?: string }) {
    return this.http.get<CorrespondentAccount[]>(this.baseUrl, { params: toHttpParams(params) });
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

  getAll() {
    return this.http.get<Beneficiary[]>(this.baseUrl);
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

  getAll() {
    return this.http.get<Currency[]>(this.baseUrl);
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

  getBalances() {
    return this.http.get<unknown[]>(`${this.baseUrl}/balances`);
  }

  getDailyValuation(valuationDate?: string) {
    return this.http.get<unknown[]>(`${this.baseUrl}/daily-valuation`, {
      params: toHttpParams({ valuationDate }),
    });
  }

  getExchangeRates(params?: { rateDate?: string; fromCurrencyId?: string; toCurrencyId?: string }) {
    return this.http.get<unknown[]>(`${this.baseUrl}/exchange-rates`, { params: toHttpParams(params) });
  }

  addExchangeRate(payload: Record<string, unknown>) {
    return this.http.post(`${this.baseUrl}/exchange-rates`, { ...payload, createdBy: SYSTEM_USER });
  }

  deleteExchangeRate(exchangeRateId: string) {
    return this.http.delete(`${this.baseUrl}/exchange-rates/${exchangeRateId}`, {
      body: { deletedBy: SYSTEM_USER },
    });
  }

  getCorrespondentBalances() {
    return this.http.get<unknown[]>(`${this.baseUrl}/correspondent-balances`);
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
    return this.http.get<unknown[]>(`${this.baseUrl}/Statement/GetCorrespondentAccountStatement`, {
      params: toHttpParams(params),
    });
  }

  getFinalBankPosition(date: string) {
    return this.http.get<unknown>(`${this.baseUrl}/Statement/GetFinalBankPosition`, {
      params: toHttpParams({ date }),
    });
  }

  getCurrencyStatement(currencyId: string, asOfDate: string) {
    return this.http.get<unknown[]>(`${this.baseUrl}/Statement/GetCurrencyStatement`, {
      params: toHttpParams({ currencyId, asOfDate }),
    });
  }
}

@Injectable({ providedIn: 'root' })
export class ObligationsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/obligations`;

  getAll() {
    return this.http.get<Obligation[]>(this.baseUrl);
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

  getTypes() {
    return this.http.get<ResourceType[]>(`${this.baseUrl}/types`);
  }

  createType(payload: Record<string, unknown>) {
    return this.http.post(`${this.baseUrl}/types`, { ...payload, actor: SYSTEM_USER });
  }

  updateType(id: string, payload: Record<string, unknown>) {
    return this.http.put(`${this.baseUrl}/types/${id}`, { ...payload, actor: SYSTEM_USER });
  }

  deleteType(id: string) {
    return this.http.delete(`${this.baseUrl}/types/${id}`, {
      body: { deletedBy: SYSTEM_USER } satisfies DeleteMasterDataRequest,
    });
  }

  addResource(payload: Record<string, unknown>) {
    return this.http.post(this.baseUrl, { ...payload, createdBy: SYSTEM_USER });
  }

  getStatement(correspondentAccountId: string, params?: { startDate?: string; endDate?: string }) {
    return this.http.get<unknown[]>(`${this.baseUrl}/statement/${correspondentAccountId}`, {
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

  getAll(params?: { correspondentAccountId?: string; startDate?: string; endDate?: string }) {
    return this.http.get<Deal[]>(this.baseUrl, { params: toHttpParams(params) });
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

  getAll(params?: { correspondentAccountId?: string; startDate?: string; endDate?: string }) {
    return this.http.get<Coverage[]>(this.baseUrl, { params: toHttpParams(params) });
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

  getAll(params?: { startDate?: string; endDate?: string }) {
    return this.http.get<ReserveSnapshot[]>(this.baseUrl, { params: toHttpParams(params) });
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
    return this.http.get(`${this.baseUrl}/dashboard`, { params: toHttpParams({ asOfDate }) });
  }

  getForeignReserve(startDate: string, endDate: string) {
    return this.http.get(`${this.baseUrl}/foreign-reserve`, { params: toHttpParams({ startDate, endDate }) });
  }

  getObligationsReport(params?: { startDate?: string; endDate?: string; status?: string }) {
    return this.http.get(`${this.baseUrl}/obligations`, { params: toHttpParams(params) });
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
