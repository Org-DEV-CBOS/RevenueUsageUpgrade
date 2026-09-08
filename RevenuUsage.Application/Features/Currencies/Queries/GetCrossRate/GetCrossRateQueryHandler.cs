using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Currencies.Queries.GetCrossRate;

public sealed class GetCrossRateQueryHandler : IQueryHandler<GetCrossRateQuery, CrossRateDto?>
{
    private readonly ICurrencyRepository _repository;

    public GetCrossRateQueryHandler(ICurrencyRepository repository)
    {
        _repository = repository;
    }

    public async Task<CrossRateDto?> Handle(GetCrossRateQuery request, CancellationToken cancellationToken)
    {
        var rate = await _repository.GetCrossRateAsync(
            request.FromCurrencyId,
            request.ToCurrencyId,
            request.AsOfDate,
            cancellationToken);

        if (rate is null)
        {
            return null;
        }

        return new CrossRateDto(
            rate.RateDate,
            rate.FromCurrencyId,
            rate.ToCurrencyId,
            rate.FromRateToUsd,
            rate.ToRateToUsd,
            rate.RateValue);
    }
}
