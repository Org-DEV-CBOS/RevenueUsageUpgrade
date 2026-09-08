import { Injectable, inject, signal } from '@angular/core';
import {
  Beneficiary,
  ClientType,
  ClientTypeCode,
  CorrespondentAccount,
  Currency,
  ObligationType,
  ResourceType,
} from '../models/common.model';
import { Bank } from '../models/bank.model';
import { Company } from '../models/company.model';
import {
  BeneficiariesApiService,
  CorrespondentAccountsApiService,
  CurrenciesApiService,
  LookupsApiService,
  ObligationsApiService,
  ResourcesApiService,
} from './api.service';
import { LanguageService } from './language.service';
import { SearchSelectOption } from '../../shared/components/search-select/search-select.component';

/**
 * Operation forms all need the same reference lists. Loading them here keeps a single
 * copy in memory instead of refetching on every form open.
 */
@Injectable({ providedIn: 'root' })
export class LookupCacheService {
  private readonly accountsApi = inject(CorrespondentAccountsApiService);
  private readonly currenciesApi = inject(CurrenciesApiService);
  private readonly beneficiariesApi = inject(BeneficiariesApiService);
  private readonly resourcesApi = inject(ResourcesApiService);
  private readonly lookupsApi = inject(LookupsApiService);
  private readonly obligationsApi = inject(ObligationsApiService);
  private readonly language = inject(LanguageService);

  readonly accounts = signal<CorrespondentAccount[]>([]);
  readonly currencies = signal<Currency[]>([]);
  readonly beneficiaries = signal<Beneficiary[]>([]);
  readonly resourceTypes = signal<ResourceType[]>([]);
  readonly banks = signal<Bank[]>([]);
  readonly companies = signal<Company[]>([]);
  readonly clientTypes = signal<ClientType[]>([]);
  readonly obligationTypes = signal<ObligationType[]>([]);

  private readonly loaded = new Set<string>();

  private get isArabic(): boolean {
    return this.language.currentLanguage() === 'ar';
  }

  loadAccounts(): void {
    if (!this.once('accounts')) return;
    this.accountsApi.getAll({ activeOnly: true }).subscribe({
      next: (data) => this.accounts.set(data),
      error: () => this.accounts.set([]),
    });
  }

  loadCurrencies(): void {
    if (!this.once('currencies')) return;
    this.currenciesApi.getAll().subscribe({
      next: (data) => this.currencies.set(data),
      error: () => this.currencies.set([]),
    });
  }

  loadBeneficiaries(): void {
    if (!this.once('beneficiaries')) return;
    this.beneficiariesApi.getAll({ activeOnly: true }).subscribe({
      next: (data) => this.beneficiaries.set(data),
      error: () => this.beneficiaries.set([]),
    });
  }

  loadResourceTypes(): void {
    if (!this.once('resourceTypes')) return;
    this.resourcesApi.getTypes({ activeOnly: true }).subscribe({
      next: (data) => this.resourceTypes.set(data),
      error: () => this.resourceTypes.set([]),
    });
  }

  loadBanks(): void {
    if (!this.once('banks')) return;
    this.lookupsApi.getBanks().subscribe({
      next: (data) => this.banks.set(data),
      error: () => this.banks.set([]),
    });
  }

  loadCompanies(): void {
    if (!this.once('companies')) return;
    this.lookupsApi.getCompanies().subscribe({
      next: (data) => this.companies.set(data),
      error: () => this.companies.set([]),
    });
  }

  loadClientTypes(): void {
    if (!this.once('clientTypes')) return;
    this.obligationsApi.getClientTypes({ activeOnly: true }).subscribe({
      next: (data) => this.clientTypes.set(data),
      error: () => this.clientTypes.set([]),
    });
  }

  loadObligationTypes(): void {
    if (!this.once('obligationTypes')) return;
    this.obligationsApi.getTypes({ activeOnly: true }).subscribe({
      next: (data) => this.obligationTypes.set(data),
      error: () => this.obligationTypes.set([]),
    });
  }

  /** Force a refetch after a balance-changing operation. */
  refreshAccounts(): void {
    this.loaded.delete('accounts');
    this.loadAccounts();
  }

  findAccount(accountId: string): CorrespondentAccount | undefined {
    return this.accounts().find((a) => a.correspondentAccountId === accountId);
  }

  /** The ISO-style short name, not CurrencyCode, which holds a legacy numeric code. */
  currencySymbol(account: CorrespondentAccount): string {
    return (
      account.currencySymbol ||
      this.currencies().find((c) => c.currencyId === account.currencyId)?.symbol ||
      account.currencyCode
    );
  }

  accountLabel(account: CorrespondentAccount): string {
    const name =
      (this.isArabic ? account.correspondentNameAr : account.correspondentNameEn) ||
      account.correspondentNameEn;
    return `${name} — ${account.accountNumber} (${this.currencySymbol(account)})`;
  }

  accountOptions(filter?: { currencyId?: string; excludeId?: string }): SearchSelectOption[] {
    return this.accounts()
      .filter((a) => !filter?.currencyId || a.currencyId === filter.currencyId)
      .filter((a) => a.correspondentAccountId !== filter?.excludeId)
      .map((a) => ({ value: a.correspondentAccountId, label: this.accountLabel(a) }));
  }

  currencyOptions(): SearchSelectOption[] {
    return this.currencies().map((c) => ({
      value: c.currencyId,
      label: `${c.symbol || c.currencyCode} — ${(this.isArabic ? c.currencyNameAr : c.currencyNameEn) || c.currencyNameEn}`,
    }));
  }

  beneficiaryOptions(): SearchSelectOption[] {
    return this.beneficiaries().map((b) => ({
      value: b.beneficiaryId,
      label: (this.isArabic ? b.beneficiaryNameAr : b.beneficiaryNameEn) || b.beneficiaryNameEn,
    }));
  }

  resourceTypeOptions(): SearchSelectOption[] {
    return this.resourceTypes().map((r) => ({
      value: r.resourceTypeId,
      label: (this.isArabic ? r.resourceTypeNameAr : r.resourceTypeNameEn) || r.resourceTypeNameEn,
    }));
  }

  bankOptions(): SearchSelectOption[] {
    return this.banks().map((b) => ({
      value: b.bankId,
      label: (this.isArabic ? b.bankNameAr : b.bankNameEn) || b.bankNameAr || '',
    }));
  }

  companyOptions(): SearchSelectOption[] {
    return this.companies().map((c) => ({
      value: c.companyId,
      label: (this.isArabic ? c.companyNameAr : c.companyNameEn) || c.companyNameAr || '',
    }));
  }

  clientTypeOptions(): SearchSelectOption[] {
    return this.clientTypes().map((t) => ({
      value: t.clientTypeId,
      label: (this.isArabic ? t.clientTypeNameAr : t.clientTypeNameEn) || t.clientTypeNameEn,
    }));
  }

  /** Which branch a client type drives, since the names are admin-editable. */
  clientTypeCode(clientTypeId: string): ClientTypeCode | undefined {
    return this.clientTypes().find((t) => t.clientTypeId === clientTypeId)?.clientTypeCode;
  }

  obligationTypeOptions(): SearchSelectOption[] {
    return this.obligationTypes().map((t) => ({
      value: t.obligationTypeId,
      label: (this.isArabic ? t.obligationTypeNameAr : t.obligationTypeNameEn) || t.obligationTypeNameEn,
    }));
  }

  private once(key: string): boolean {
    if (this.loaded.has(key)) {
      return false;
    }
    this.loaded.add(key);
    return true;
  }
}
