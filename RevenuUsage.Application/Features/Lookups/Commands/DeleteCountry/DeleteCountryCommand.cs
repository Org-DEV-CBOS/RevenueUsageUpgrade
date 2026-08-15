using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Commands.DeleteCountry;

public record DeleteCountryCommand(Guid CountryId, string? DeletedBy) : ICommand;
