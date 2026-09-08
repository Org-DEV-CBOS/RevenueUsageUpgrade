namespace RevenuUsage.Application.DTOs;

public sealed record BeneficiaryDto(Guid BeneficiaryId, string BeneficiaryCode, string BeneficiaryNameEn, string? BeneficiaryNameAr, bool IsActive, bool HasMovements);
public sealed record SaveBeneficiaryDto(Guid? BeneficiaryId, string BeneficiaryCode, string BeneficiaryNameEn, string? BeneficiaryNameAr, bool IsActive = true, string? Actor = null);
public sealed record CurrencyDto(Guid CurrencyId, string CurrencyCode, string CurrencyNameEn, string? CurrencyNameAr, string? Symbol, int DecimalPlaces, bool IsActive, bool HasMovements);
public sealed record SaveCurrencyDto(Guid? CurrencyId, string CurrencyCode, string CurrencyNameEn, string? CurrencyNameAr, string? Symbol, int DecimalPlaces = 2, bool IsActive = true, string? Actor = null);
public sealed record ResourceTypeDto(Guid ResourceTypeId, string ResourceTypeCode, string ResourceTypeNameEn, string? ResourceTypeNameAr, bool IsActive, bool HasMovements);
public sealed record SaveResourceTypeDto(Guid? ResourceTypeId, string ResourceTypeCode, string ResourceTypeNameEn, string? ResourceTypeNameAr, bool IsActive = true, string? Actor = null);
public sealed record OperationTypeDto(Guid OperationTypeId, string OperationTypeCode, string OperationTypeNameEn, string? OperationTypeNameAr, bool IsActive, bool HasMovements);
public sealed record SaveOperationTypeDto(Guid? OperationTypeId, string OperationTypeCode, string OperationTypeNameEn, string? OperationTypeNameAr, bool IsActive = true, string? Actor = null);
public sealed record UsageTypeDto(Guid UsageTypeId, string UsageTypeCode, string UsageTypeNameEn, string? UsageTypeNameAr, bool IsActive, bool HasMovements);
public sealed record SaveUsageTypeDto(Guid? UsageTypeId, string UsageTypeCode, string UsageTypeNameEn, string? UsageTypeNameAr, bool IsActive = true, string? Actor = null);
public sealed record ClientTypeDto(Guid ClientTypeId, string ClientTypeCode, string ClientTypeNameEn, string? ClientTypeNameAr, bool IsActive, bool HasMovements);
/* No id-less variant: client types are renamed and deactivated, never created. */
public sealed record SaveClientTypeDto(string ClientTypeNameEn, string? ClientTypeNameAr, bool IsActive = true, string? Actor = null);
public sealed record ObligationTypeDto(Guid ObligationTypeId, string ObligationTypeNameEn, string? ObligationTypeNameAr, bool IsActive, bool HasMovements);
public sealed record SaveObligationTypeDto(Guid? ObligationTypeId, string ObligationTypeNameEn, string? ObligationTypeNameAr, bool IsActive = true, string? Actor = null);
