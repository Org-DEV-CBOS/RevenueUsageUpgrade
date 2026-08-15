namespace RevenuUsage.Application.DTOs;

public sealed record DailyValuationDto(
    Guid DailyValuationId,
    DateTime ValuationDate,
    decimal CashInHandUsd,
    decimal GoldOunces,
    decimal GoldPricePerOunceUsd,
    decimal GoldValueUsd,
    string? Notes);
