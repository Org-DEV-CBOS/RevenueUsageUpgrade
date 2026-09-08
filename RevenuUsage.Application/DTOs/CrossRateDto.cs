namespace RevenuUsage.Application.DTOs;

/// <summary>
/// A rate between two currencies derived through USD. <paramref name="RateValue"/> is
/// null when either currency has no published rate on or before the requested date.
/// </summary>
public sealed record CrossRateDto(
    DateTime RateDate,
    Guid FromCurrencyId,
    Guid ToCurrencyId,
    decimal? FromRateToUsd,
    decimal? ToRateToUsd,
    decimal? RateValue);
