namespace RevenuUsage.Application.DTOs;

public sealed record RevenueUsageDto(
    Guid Id,
    string CustomerId,
    decimal Amount,
    DateTime RecordedAt,
    string? Notes);
