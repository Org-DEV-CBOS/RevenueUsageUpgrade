using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Currencies.Queries.GetCurrencyBalances;

public sealed class GetCurrencyBalancesQueryHandler : IQueryHandler<GetCurrencyBalancesQuery, IEnumerable<CurrencyBalanceDto>>
{
    private readonly ICurrencyRepository _repository;

    public GetCurrencyBalancesQueryHandler(ICurrencyRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<CurrencyBalanceDto>> Handle(GetCurrencyBalancesQuery request, CancellationToken cancellationToken)
    {
        var balances = await _repository.GetCurrencyBalancesAsync(cancellationToken);

        return balances.Select(b => new CurrencyBalanceDto(
            b.CurrencyId,
            b.CurrencyCode,
            b.CurrencyNameAr,
            b.CurrencyNameEn,
            b.TotalOpeningBalance,
            b.TotalResources,
            b.TotalCoverageOut,
            b.TotalCoverageIn,
            b.TotalConfirmedTransfers,
            b.CurrentBalance));
    }
}
