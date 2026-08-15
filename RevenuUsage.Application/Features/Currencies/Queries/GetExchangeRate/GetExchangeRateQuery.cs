using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.Currencies.Queries.GetExchangeRate;

public sealed record GetExchangeRateQuery(
    DateTime? RateDate,
    Guid? FromCurrencyId,
    Guid? ToCurrencyId) : IQuery<IEnumerable<ExchangeRateDto>>;
