using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Currencies.Commands.AddExchangeRate;

public sealed record AddExchangeRateCommand(
    DateTime RateDate,
    Guid FromCurrencyId,
    Guid ToCurrencyId,
    decimal RateValue,
    string CreatedBy) : ICommand;
