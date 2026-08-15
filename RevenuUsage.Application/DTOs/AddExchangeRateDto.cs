namespace RevenuUsage.Application.DTOs;

public sealed record AddExchangeRateDto(
    DateTime RateDate,
    Guid FromCurrencyId,
    Guid ToCurrencyId,
    decimal RateValue,
    string CreatedBy);
