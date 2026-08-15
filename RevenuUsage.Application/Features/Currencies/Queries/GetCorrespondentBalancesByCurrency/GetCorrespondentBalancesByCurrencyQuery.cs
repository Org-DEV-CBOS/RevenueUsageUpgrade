using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.Currencies.Queries.GetCorrespondentBalancesByCurrency;

public sealed record GetCorrespondentBalancesByCurrencyQuery() : IQuery<IEnumerable<CorrespondentBalanceByCurrencyDto>>;
