export const SYSTEM_USER = 'system';

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
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
  amount: number;
  purpose: string;
  referenceNo: string;
  transferStatus: string;
  confirmedTime?: string;
  rejectedTime?: string;
  rejectReason?: string;
}

export interface CreateTransferRequest {
  correspondentAccountId: string;
  beneficiaryId: string;
  purpose: string;
  referenceNo: string;
  createdBy?: string;
  transferDate: string;
  amount: number;
  transferId: string;
  operationTypeId: string;
  resourceTypeId: string;
  usageTypeId: string;
  bankId: string;
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

export interface Obligation {
  obligationId: string;
  obligationCode?: string;
  obligationNameEn?: string;
  obligationNameAr?: string;
  totalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface Deal {
  dealId: string;
  [key: string]: unknown;
}

export interface Coverage {
  coverageId: string;
  [key: string]: unknown;
}

export interface ReserveSnapshot {
  reserveSnapshotId: string;
  [key: string]: unknown;
}
