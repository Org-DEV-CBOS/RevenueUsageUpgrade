using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Currencies.Commands.DeleteExchangeRate;

public sealed class DeleteExchangeRateCommandHandler : ICommandHandler<DeleteExchangeRateCommand>
{
    private readonly ICurrencyRepository _repository;

    public DeleteExchangeRateCommandHandler(ICurrencyRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(DeleteExchangeRateCommand request, CancellationToken cancellationToken)
    {
        await _repository.DeleteExchangeRateAsync(
            request.ExchangeRateId,
            request.DeletedBy,
            cancellationToken).ConfigureAwait(false);
    }
}
