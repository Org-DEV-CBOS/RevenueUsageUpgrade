using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.Lookups.Queries.GetAllCountries;

public record GetAllCountriesQuery : IQuery<IEnumerable<CountryDto>>;
