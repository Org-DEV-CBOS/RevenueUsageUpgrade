namespace RevenuUsage.Application.DTOs;

public sealed record CorrespondentBalanceByCurrencyDto(
    Guid CurrencyId,
    string CurrencyNameAr,
    string CurrencyNameEn,
    string Symbol,
    decimal TotalBalance);
