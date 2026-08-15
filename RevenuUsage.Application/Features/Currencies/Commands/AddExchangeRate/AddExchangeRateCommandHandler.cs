using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Currencies.Commands.AddExchangeRate;

public sealed class AddExchangeRateCommandHandler : ICommandHandler<AddExchangeRateCommand>
{
    private readonly ICurrencyRepository _repository;

    public AddExchangeRateCommandHandler(ICurrencyRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(AddExchangeRateCommand request, CancellationToken cancellationToken)
    {
        await _repository.AddExchangeRateAsync(
            request.RateDate,
            request.FromCurrencyId,
            request.ToCurrencyId,
            request.RateValue,
            request.CreatedBy,
            cancellationToken).ConfigureAwait(false);
    }
}
