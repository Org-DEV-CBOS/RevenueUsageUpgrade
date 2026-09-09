export interface DashboardSummary {
  asOfDate: string;
  totalResourcesUsd: number;
  confirmedTransfersUsd: number;
  totalAccountBalance: number;
  netPositionUsd: number;
  outstandingObligationsUsd: number;
  reserveTotalUsd: number;
  /** Currencies with a balance but no published USD rate, so excluded from the totals. */
  unconvertedCurrencyCount: number;
  correspondentCount: number;
  accountCount: number;
  pendingTransferCount: number;
  confirmedTransferCount: number;
  bankCount: number;
  companyCount: number;
  countryCount: number;
  currencyCount: number;
  beneficiaryCount: number;
  resourceTypeCount: number;
  obligationCount: number;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageNumber?: number;
  pageSize: number;
  totalPages: number;
  /** Figures over the whole result set, for reports that foot a column. */
  totals?: Record<string, number>;
}

export interface DeleteMasterDataRequest {
  deletedBy?: string;
}

export interface TransferListItem {
  transferId: string;
  transferDate: string;
  correspondentAccountId: string;
  accountNumber: string;
  accountName: string;
  beneficiaryId: string;
  beneficiaryName: string;
  currencyId?: string;
  currencyCode: string;
  currencySymbol?: string;
  amount: number;
  purpose?: string | null;
  referenceNo?: string | null;
  statementDate?: string | null;
  transferStatus: string;
  confirmedTime?: string;
  rejectedTime?: string;
  rejectReason?: string;
}

export interface CreateTransferRequest {
  correspondentAccountId: string;
  beneficiaryId: string;
  /** Optional while Pending; a reference and statement date are required to confirm. */
  purpose?: string | null;
  referenceNo?: string | null;
  statementDate?: string | null;
  createdBy?: string;
  transferDate: string;
  amount: number;
}

export interface Correspondent {
  correspondentId: string;
  correspondentCode: string;
  correspondentNameEn: string;
  correspondentNameAr?: string;
  countryId?: string;
  countryNameEn?: string;
  countryNameAr?: string;
  isActive: boolean;
}

export interface CorrespondentAccount {
  correspondentAccountId: string;
  correspondentId: string;
  correspondentNameEn: string;
  correspondentNameAr?: string;
  currencyId: string;
  currencyCode: string;
  currencySymbol?: string;
  currencyNameEn?: string;
  currencyNameAr?: string;
  accountNumber: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  hasMovements: boolean;
}

export interface Beneficiary {
  beneficiaryId: string;
  beneficiaryCode: string;
  beneficiaryNameEn: string;
  beneficiaryNameAr?: string;
  isActive: boolean;
  hasMovements: boolean;
}

export interface Currency {
  currencyId: string;
  currencyCode: string;
  currencyNameEn: string;
  currencyNameAr?: string;
  symbol?: string;
  decimalPlaces: number;
  isActive: boolean;
  hasMovements: boolean;
}

export interface ResourceType {
  resourceTypeId: string;
  resourceTypeCode: string;
  resourceTypeNameEn: string;
  resourceTypeNameAr?: string;
  isActive: boolean;
  hasMovements: boolean;
}

/** Matches dbo.ClientTypes.ClientTypeCode; the display names are admin-editable. */
export type ClientTypeCode = 'BANK' | 'COMPANY';

export interface ClientType {
  clientTypeId: string;
  clientTypeCode: ClientTypeCode;
  clientTypeNameEn: string;
  clientTypeNameAr?: string;
  isActive: boolean;
  hasMovements: boolean;
}

export interface ObligationType {
  obligationTypeId: string;
  obligationTypeNameEn: string;
  obligationTypeNameAr?: string;
  isActive: boolean;
  hasMovements: boolean;
}

export interface Obligation {
  obligationId: string;
  obligationDate: string;
  clientTypeId: string;
  clientTypeCode?: ClientTypeCode;
  clientTypeNameEn?: string;
  clientTypeNameAr?: string;
  /** Company clients only. */
  obligationTypeId?: string;
  obligationTypeNameEn?: string;
  obligationTypeNameAr?: string;
  bankId?: string;
  companyId?: string;
  bankName?: string;
  companyName?: string;
  /** Whichever of the bank or the company the client type points at. */
  clientNameEn?: string;
  clientNameAr?: string;
  currencyId: string;
  currencyCode?: string;
  currencyNameEn?: string;
  currencyNameAr?: string;
  currencySymbol?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate?: string;
  referenceNo?: string;
  notes?: string;
  isActive: boolean;
}

export interface ObligationPayment {
  obligationPaymentId: string;
  obligationId: string;
  paymentDate: string;
  amount: number;
  referenceNo?: string;
  notes?: string;
  createdBy?: string;
  createdTime?: string;
}

export interface ObligationStatement {
  /** The statement endpoint omits the list-only fields, so this is a subset of Obligation. */
  obligation: Omit<Obligation, 'isActive'>;
  payments: ObligationPayment[];
}

export interface Deal {
  dealId: string;
  fromCorrespondentAccountId: string;
  fromCorrespondentName: string;
  fromCurrencyCode: string;
  fromCurrencySymbol?: string;
  toCorrespondentAccountId: string;
  toCorrespondentName: string;
  toCurrencyCode: string;
  toCurrencySymbol?: string;
  fromAmount: number;
  exchangeRate: number;
  toAmount: number;
  referenceNo?: string;
  narration?: string;
  transactionDate: string;
}

export interface Coverage {
  coverageId: string;
  fromCorrespondentAccountId: string;
  fromCorrespondentName: string;
  toCorrespondentAccountId: string;
  toCorrespondentName: string;
  currencyId: string;
  currencyCode: string;
  currencySymbol?: string;
  amount: number;
  referenceNo?: string;
  narration?: string;
  transactionDate: string;
}

export interface ReserveSnapshot {
  reserveSnapshotId: string;
  reserveDate: string;
  goldValue: number;
  cashInHand: number;
  deposits: number;
  totalValue: number;
  notes?: string;
}

export interface ResourceListItem {
  resourceId: string;
  resourceDate: string;
  correspondentAccountId: string;
  accountNumber: string;
  correspondentId: string;
  correspondentNameEn: string;
  correspondentNameAr?: string;
  currencyId: string;
  currencyCode: string;
  currencySymbol?: string;
  resourceTypeId: string;
  resourceTypeNameEn: string;
  resourceTypeNameAr?: string;
  amount: number;
  notes?: string;
  remittingBankId?: string | null;
  remittingBankNameEn?: string;
  remittingBankNameAr?: string;
  referenceNo?: string;
  statementDate?: string | null;
  createdBy?: string;
  createdTime?: string;
}

export interface AccountStatementRow {
  /** The brought-forward row that opens the statement; a balance, not a movement. */
  isOpening: boolean;
  /** The business date the movement is booked under. */
  eventDate?: string;
  /** The moment the balance actually moved. Absent on rows predating the timestamps. */
  eventTime?: string;
  eventType?: string;
  amountIn: number;
  amountOut: number;
  runningBalance: number;
  notes?: string;
}

export interface CurrencyStatementRow {
  correspondentAccountId: string;
  accountNumber: string;
  accountName: string;
  currentBalance: number;
  totalResources: number;
  totalCoverageIn: number;
  totalCoverageOut: number;
  totalConfirmedTransfers: number;
  netBalance: number;
}

export interface FinalBankPosition {
  positionDate: string;
  cashInHandUsd: number;
  goldValueUsd: number;
  totalCorrespondentBalancesUsd: number;
  bankNetPositionUsd: number;
}

/** One correspondent's row of a balance report, aligned to the report's currencies. */
export interface CorrespondentBalanceRow {
  correspondentName: string;
  correspondentNameAr?: string;
  /** Null where the correspondent holds nothing in that currency. */
  balances: (number | null)[];
}

/**
 * A whole balance report rather than a page of one: the totals underneath only mean
 * anything over the full set.
 */
export interface CorrespondentBalanceReport {
  generatedAt: string;
  asOfDate: string;
  /** Column headings. A single `USD` entry when the report is in USD totals mode. */
  currencies: string[];
  rows: CorrespondentBalanceRow[];
  currencyTotals: (number | null)[];
  currencyTotalsUsd: (number | null)[];
  equivalentUsd: number;
  pendingUsd: number;
  netBalanceUsd: number;
  /** Non-zero means currencies without a published rate are missing from the USD figures. */
  unconvertedCurrencyCount: number;
}

export interface ExchangeRateRow {
  exchangeRateId: string;
  rateDate: string;
  fromCurrencyId: string;
  fromCurrencyCode: string;
  fromCurrencyNameEn?: string;
  fromCurrencyNameAr?: string;
  fromCurrencySymbol?: string;
  toCurrencyId: string;
  toCurrencyCode: string;
  rateValue: number;
}

/** Rate between two currencies, derived through USD. `rateValue` is null if unpublished. */
export interface CrossRate {
  rateDate: string;
  fromCurrencyId: string;
  toCurrencyId: string;
  fromRateToUsd: number | null;
  toRateToUsd: number | null;
  rateValue: number | null;
}
