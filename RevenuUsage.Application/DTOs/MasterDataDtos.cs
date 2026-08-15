namespace RevenuUsage.Application.DTOs;

public sealed record BeneficiaryDto(Guid BeneficiaryId, string BeneficiaryCode, string BeneficiaryNameEn, string? BeneficiaryNameAr, bool IsActive, bool HasMovements);
public sealed record SaveBeneficiaryDto(Guid? BeneficiaryId, string BeneficiaryCode, string BeneficiaryNameEn, string? BeneficiaryNameAr, bool IsActive = true, string? Actor = null);
public sealed record CurrencyDto(Guid CurrencyId, string CurrencyCode, string CurrencyNameEn, string? CurrencyNameAr, string? Symbol, int DecimalPlaces, bool IsActive, bool HasMovements);
public sealed record SaveCurrencyDto(Guid? CurrencyId, string CurrencyCode, string CurrencyNameEn, string? CurrencyNameAr, string? Symbol, int DecimalPlaces = 2, bool IsActive = true, string? Actor = null);
public sealed record ResourceTypeDto(Guid ResourceTypeId, string ResourceTypeCode, string ResourceTypeNameEn, string? ResourceTypeNameAr, bool IsActive, bool HasMovements);
public sealed record SaveResourceTypeDto(Guid? ResourceTypeId, string ResourceTypeCode, string ResourceTypeNameEn, string? ResourceTypeNameAr, bool IsActive = true, string? Actor = null);
