using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Queries.GetCountryById;

public class GetCountryByIdQueryHandler : IQueryHandler<GetCountryByIdQuery, CountryDto?>
{
    private readonly ILookupRepository _lookupRepository;

    public GetCountryByIdQueryHandler(ILookupRepository lookupRepository)
    {
        _lookupRepository = lookupRepository;
    }

    public async Task<CountryDto?> Handle(GetCountryByIdQuery request, CancellationToken cancellationToken)
    {
        var country = await _lookupRepository.GetCountryByIdAsync(request.CountryId, cancellationToken);

        if (country == null)
            return null;

        return new CountryDto
        {
            CountryId = country.CountryId,
            CountryCode = country.CountryCode,
            CountryNameEn = country.CountryNameEn,
            CountryNameAr = country.CountryNameAr,
            IsoCode = country.IsoCode,
            IsActive = country.IsActive
        };
    }
}
