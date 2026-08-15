using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Commands.UpdateCountry;

public class UpdateCountryCommandHandler : ICommandHandler<UpdateCountryCommand>
{
    private readonly ILookupRepository _lookupRepository;

    public UpdateCountryCommandHandler(ILookupRepository lookupRepository)
    {
        _lookupRepository = lookupRepository;
    }

    public async Task Handle(UpdateCountryCommand request, CancellationToken cancellationToken)
    {
        var country = new Country
        {
            CountryId = request.CountryId,
            CountryCode = request.CountryCode,
            CountryNameEn = request.CountryNameEn,
            CountryNameAr = request.CountryNameAr,
            IsoCode = request.IsoCode,
            IsActive = request.IsActive,
            ModifiedBy = request.ModifiedBy
        };

        await _lookupRepository.UpdateCountryAsync(country, cancellationToken);
    }
}
