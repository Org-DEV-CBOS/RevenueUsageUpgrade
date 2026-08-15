export interface Country {
  countryId: string;
  countryCode: number;
  countryNameEn?: string;
  countryNameAr: string;
  isoCode?: string;
  isActive: boolean;
}

export interface CreateCountryRequest {
  countryCode: number;
  countryNameEn?: string;
  countryNameAr: string;
  isoCode?: string;
  createdBy?: string;
}

export interface UpdateCountryRequest {
  countryId: string;
  countryCode: number;
  countryNameEn?: string;
  countryNameAr: string;
  isoCode?: string;
  isActive: boolean;
  modifiedBy?: string;
}

export interface DeleteCountryRequest {
  countryId: string;
  deletedBy?: string;
}
