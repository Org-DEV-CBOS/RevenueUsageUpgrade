using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Currencies.Commands.DeleteExchangeRate;

public sealed record DeleteExchangeRateCommand(
    Guid ExchangeRateId,
    string DeletedBy) : ICommand;
