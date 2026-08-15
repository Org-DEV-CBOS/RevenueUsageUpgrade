namespace RevenuUsage.Application.DTOs;

public sealed record CurrencyBalanceDto(
    Guid CurrencyId,
    string CurrencyCode,
    string CurrencyNameAr,
    string CurrencyNameEn,
    decimal TotalOpeningBalance,
    decimal TotalResources,
    decimal TotalCoverageOut,
    decimal TotalCoverageIn,
    decimal TotalConfirmedTransfers,
    decimal CurrentBalance);
