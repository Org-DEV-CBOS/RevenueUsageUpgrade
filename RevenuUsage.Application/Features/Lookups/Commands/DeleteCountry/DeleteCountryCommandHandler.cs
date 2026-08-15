using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Commands.DeleteCountry;

public class DeleteCountryCommandHandler : ICommandHandler<DeleteCountryCommand>
{
    private readonly ILookupRepository _lookupRepository;

    public DeleteCountryCommandHandler(ILookupRepository lookupRepository)
    {
        _lookupRepository = lookupRepository;
    }

    public async Task Handle(DeleteCountryCommand request, CancellationToken cancellationToken)
    {
        await _lookupRepository.DeleteCountryAsync(request.CountryId, request.DeletedBy ?? "system", cancellationToken);
    }
}
