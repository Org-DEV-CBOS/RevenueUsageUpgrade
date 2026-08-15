export interface Bank {
  bankId: string;
  bankCode: number;
  bankNameEn?: string;
  bankNameAr: string;
  shortName?: string;
  isActive: boolean;
}

export interface CreateBankRequest {
  bankCode: number;
  bankNameEn?: string;
  bankNameAr: string;
  shortName?: string;
  createdBy?: string;
}

export interface UpdateBankRequest {
  bankId: string;
  bankCode: number;
  bankNameEn?: string;
  bankNameAr: string;
  shortName?: string;
  isActive: boolean;
  modifiedBy?: string;
}

export interface DeleteBankRequest {
  bankId: string;
  deletedBy?: string;
}
