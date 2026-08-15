using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Commands.DeleteCompany;

public class DeleteCompanyCommandHandler : ICommandHandler<DeleteCompanyCommand>
{
    private readonly ILookupRepository _lookupRepository;

    public DeleteCompanyCommandHandler(ILookupRepository lookupRepository)
    {
        _lookupRepository = lookupRepository;
    }

    public async Task Handle(DeleteCompanyCommand request, CancellationToken cancellationToken)
    {
        await _lookupRepository.DeleteCompanyAsync(request.CompanyId, request.DeletedBy ?? "system", cancellationToken);
    }
}
