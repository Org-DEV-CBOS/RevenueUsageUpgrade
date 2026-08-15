using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Commands.CreateCountry;

public class CreateCountryCommandHandler : ICommandHandler<CreateCountryCommand, Guid>
{
    private readonly ILookupRepository _lookupRepository;

    public CreateCountryCommandHandler(ILookupRepository lookupRepository)
    {
        _lookupRepository = lookupRepository;
    }

    public async Task<Guid> Handle(CreateCountryCommand request, CancellationToken cancellationToken)
    {
        var country = new Country
        {
            CountryCode = request.CountryCode,
            CountryNameEn = request.CountryNameEn,
            CountryNameAr = request.CountryNameAr,
            IsoCode = request.IsoCode,
            CreatedBy = request.CreatedBy
        };

        var countryId = await _lookupRepository.CreateCountryAsync(country, cancellationToken);

        return countryId;
    }
}
