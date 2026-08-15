using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Commands.UpdateCountry;

public record UpdateCountryCommand(
    Guid CountryId,
    long CountryCode,
    string CountryNameEn,
    string CountryNameAr,
    string? IsoCode,
    bool IsActive,
    string? ModifiedBy) : ICommand;
