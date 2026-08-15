using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Queries.GetAllCountries;

public class GetAllCountriesQueryHandler : IQueryHandler<GetAllCountriesQuery, IEnumerable<CountryDto>>
{
    private readonly ILookupRepository _lookupRepository;

    public GetAllCountriesQueryHandler(ILookupRepository lookupRepository)
    {
        _lookupRepository = lookupRepository;
    }

    public async Task<IEnumerable<CountryDto>> Handle(GetAllCountriesQuery request, CancellationToken cancellationToken)
    {
        var countries = await _lookupRepository.GetAllCountriesAsync(cancellationToken);

        return countries.Select(c => new CountryDto
        {
            CountryId = c.CountryId,
            CountryCode = c.CountryCode,
            CountryNameEn = c.CountryNameEn,
            CountryNameAr = c.CountryNameAr,
            IsoCode = c.IsoCode,
            IsActive = c.IsActive
        });
    }
}
