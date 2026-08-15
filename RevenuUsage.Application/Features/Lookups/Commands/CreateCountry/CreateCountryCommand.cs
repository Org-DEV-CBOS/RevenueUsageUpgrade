using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Commands.CreateCountry;

public record CreateCountryCommand(
    long CountryCode,
    string CountryNameEn,
    string CountryNameAr,
    string? IsoCode,
    string? CreatedBy) : ICommand<Guid>;
