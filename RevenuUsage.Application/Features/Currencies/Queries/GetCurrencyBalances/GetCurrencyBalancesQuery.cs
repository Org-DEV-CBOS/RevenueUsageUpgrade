using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.Currencies.Queries.GetCurrencyBalances;

public sealed record GetCurrencyBalancesQuery() : IQuery<IEnumerable<CurrencyBalanceDto>>;
