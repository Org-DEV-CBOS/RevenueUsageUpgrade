using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Resources.Commands.DeleteResource;

public sealed class DeleteResourceCommandHandler : ICommandHandler<DeleteResourceCommand>
{
    private readonly IResourceRepository _resourceRepository;

    public DeleteResourceCommandHandler(IResourceRepository resourceRepository)
    {
        _resourceRepository = resourceRepository;
    }

    public async Task Handle(DeleteResourceCommand request, CancellationToken cancellationToken)
    {
        await _resourceRepository.DeleteResourceAsync(
            request.ResourceId,
            request.DeletedBy,
            cancellationToken);
    }
}
