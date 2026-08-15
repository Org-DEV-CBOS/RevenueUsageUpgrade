using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Currencies.Queries.GetDailyValuation;

public sealed class GetDailyValuationQueryHandler : IQueryHandler<GetDailyValuationQuery, IEnumerable<DailyValuationDto>>
{
    private readonly ICurrencyRepository _repository;

    public GetDailyValuationQueryHandler(ICurrencyRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<DailyValuationDto>> Handle(GetDailyValuationQuery request, CancellationToken cancellationToken)
    {
        var valuations = await _repository.GetDailyValuationAsync(request.ValuationDate, cancellationToken);

        return valuations.Select(v => new DailyValuationDto(
            v.DailyValuationId,
            v.ValuationDate,
            v.CashInHandUsd,
            v.GoldOunces,
            v.GoldPricePerOunceUsd,
            v.GoldValueUsd,
            v.Notes));
    }
}
