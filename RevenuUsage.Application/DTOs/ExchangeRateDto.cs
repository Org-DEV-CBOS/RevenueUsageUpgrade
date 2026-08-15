namespace RevenuUsage.Application.DTOs;

public sealed record ExchangeRateDto(
    Guid ExchangeRateId,
    DateTime RateDate,
    Guid FromCurrencyId,
    string FromCurrencyCode,
    string FromCurrencyNameAr,
    string FromCurrencyNameEn,
    Guid ToCurrencyId,
    string ToCurrencyCode,
    string ToCurrencyNameAr,
    string ToCurrencyNameEn,
    decimal RateValue);
