namespace RevenuUsage.Application.DTOs;

public sealed record CorrespondentDto(
    Guid CorrespondentId,
    string CorrespondentCode,
    string CorrespondentNameEn,
    string? CorrespondentNameAr,
    Guid? CountryId,
    string? CountryNameEn,
    string? CountryNameAr,
    bool IsActive);

public sealed record CreateCorrespondentDto(
    string CorrespondentCode,
    string CorrespondentNameEn,
    string? CorrespondentNameAr,
    Guid? CountryId,
    string? CreatedBy);

public sealed record UpdateCorrespondentDto(
    Guid CorrespondentId,
    string CorrespondentCode,
    string CorrespondentNameEn,
    string? CorrespondentNameAr,
    Guid? CountryId,
    bool IsActive,
    string? ModifiedBy);

public sealed record CorrespondentAccountDto(
    Guid CorrespondentAccountId,
    Guid CorrespondentId,
    string CorrespondentNameEn,
    string? CorrespondentNameAr,
    Guid CurrencyId,
    string CurrencyCode,
    string? CurrencyNameEn,
    string? CurrencyNameAr,
    string AccountNumber,
    decimal OpeningBalance,
    decimal CurrentBalance,
    bool IsActive,
    bool HasMovements);

public sealed record CreateCorrespondentAccountDto(
    Guid CorrespondentId,
    Guid CurrencyId,
    string AccountNumber,
    decimal OpeningBalance,
    string? CreatedBy);

public sealed record UpdateCorrespondentAccountDto(
    Guid CorrespondentAccountId,
    Guid CorrespondentId,
    Guid CurrencyId,
    string AccountNumber,
    decimal OpeningBalance,
    bool IsActive,
    string? ModifiedBy);

public sealed record DeleteMasterDataDto(string? DeletedBy);
