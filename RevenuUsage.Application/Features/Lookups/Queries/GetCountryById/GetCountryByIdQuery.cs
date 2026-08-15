using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.Lookups.Queries.GetCountryById;

public record GetCountryByIdQuery(Guid CountryId) : IQuery<CountryDto?>;
