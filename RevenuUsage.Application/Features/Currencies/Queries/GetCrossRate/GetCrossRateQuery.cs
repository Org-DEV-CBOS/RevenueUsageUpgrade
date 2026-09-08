using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.Currencies.Queries.GetCrossRate;

public sealed record GetCrossRateQuery(
    Guid FromCurrencyId,
    Guid ToCurrencyId,
    DateTime? AsOfDate) : IQuery<CrossRateDto?>;
