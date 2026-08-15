using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.RevenueUsages.Commands.RecordRevenueUsage;

public sealed record RecordRevenueUsageCommand(
    Guid Id,
    string CustomerId,
    decimal Amount,
    DateTime RecordedAt,
    string? Notes) : ICommand<RevenueUsageDto>;
