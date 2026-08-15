using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.Currencies.Queries.GetDailyValuation;

public sealed record GetDailyValuationQuery(DateTime? ValuationDate) : IQuery<IEnumerable<DailyValuationDto>>;
