export interface Company {
  companyId: string;
  companyCode: number;
  companyNameEn?: string;
  companyNameAr: string;
  shortName?: string;
  notes?: string;
  isActive: boolean;
}

export interface CreateCompanyRequest {
  companyCode: number;
  companyNameEn?: string;
  companyNameAr: string;
  shortName?: string;
  notes?: string;
  createdBy?: string;
}

export interface UpdateCompanyRequest {
  companyId: string;
  companyCode: number;
  companyNameEn?: string;
  companyNameAr: string;
  shortName?: string;
  notes?: string;
  isActive: boolean;
  modifiedBy?: string;
}

export interface DeleteCompanyRequest {
  companyId: string;
  deletedBy?: string;
}
