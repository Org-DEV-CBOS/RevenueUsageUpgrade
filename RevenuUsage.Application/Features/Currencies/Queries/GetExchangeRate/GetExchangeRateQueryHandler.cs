using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Currencies.Queries.GetExchangeRate;

public sealed class GetExchangeRateQueryHandler : IQueryHandler<GetExchangeRateQuery, IEnumerable<ExchangeRateDto>>
{
    private readonly ICurrencyRepository _repository;

    public GetExchangeRateQueryHandler(ICurrencyRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ExchangeRateDto>> Handle(GetExchangeRateQuery request, CancellationToken cancellationToken)
    {
        var exchangeRates = await _repository.GetExchangeRateAsync(
            request.RateDate,
            request.FromCurrencyId,
            request.ToCurrencyId,
            cancellationToken);

        return exchangeRates.Select(er => new ExchangeRateDto(
            er.ExchangeRateId,
            er.RateDate,
            er.FromCurrencyId,
            er.FromCurrencyCode,
            er.FromCurrencyNameAr,
            er.FromCurrencyNameEn,
            er.ToCurrencyId,
            er.ToCurrencyCode,
            er.ToCurrencyNameAr,
            er.ToCurrencyNameEn,
            er.RateValue));
    }
}
