using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Resources.Commands.AddResourceToCorrespondentAccount;

public sealed class AddResourceToCorrespondentAccountCommandHandler 
    : ICommandHandler<AddResourceToCorrespondentAccountCommand>
{
    private readonly IResourceRepository _resourceRepository;

    public AddResourceToCorrespondentAccountCommandHandler(IResourceRepository resourceRepository)
    {
        _resourceRepository = resourceRepository;
    }

    public async Task Handle(AddResourceToCorrespondentAccountCommand request, CancellationToken cancellationToken)
    {
        await _resourceRepository.AddResourceToCorrespondentAccountAsync(
            request.ResourceDate,
            request.CorrespondentAccountId,
            request.Amount,
            request.ResourceTypeId,
            request.Notes,
            request.CreatedBy,
            cancellationToken);
    }
}
