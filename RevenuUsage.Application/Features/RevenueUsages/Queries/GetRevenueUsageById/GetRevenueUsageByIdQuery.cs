using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.RevenueUsages.Queries.GetRevenueUsageById;

public sealed record GetRevenueUsageByIdQuery(Guid Id) : IQuery<RevenueUsageDto?>;
