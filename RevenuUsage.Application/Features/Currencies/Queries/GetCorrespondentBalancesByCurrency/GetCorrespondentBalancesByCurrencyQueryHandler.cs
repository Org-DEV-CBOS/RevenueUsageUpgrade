using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Currencies.Queries.GetCorrespondentBalancesByCurrency;

public sealed class GetCorrespondentBalancesByCurrencyQueryHandler : IQueryHandler<GetCorrespondentBalancesByCurrencyQuery, IEnumerable<CorrespondentBalanceByCurrencyDto>>
{
    private readonly ICurrencyRepository _repository;

    public GetCorrespondentBalancesByCurrencyQueryHandler(ICurrencyRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<CorrespondentBalanceByCurrencyDto>> Handle(GetCorrespondentBalancesByCurrencyQuery request, CancellationToken cancellationToken)
    {
        var balances = await _repository.GetCorrespondentBalancesByCurrencyAsync(cancellationToken);

        return balances.Select(b => new CorrespondentBalanceByCurrencyDto(
            b.CurrencyId,
            b.CurrencyNameAr,
            b.CurrencyNameEn,
            b.Symbol,
            b.TotalBalance));
    }
}
