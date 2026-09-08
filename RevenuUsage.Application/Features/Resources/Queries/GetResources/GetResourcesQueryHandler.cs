using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Resources.Queries.GetResources;

public sealed class GetResourcesQueryHandler : IQueryHandler<GetResourcesQuery, IEnumerable<ResourceListItem>>
{
    private readonly IResourceRepository _resourceRepository;

    public GetResourcesQueryHandler(IResourceRepository resourceRepository)
    {
        _resourceRepository = resourceRepository;
    }

    public Task<IEnumerable<ResourceListItem>> Handle(GetResourcesQuery request, CancellationToken cancellationToken) =>
        _resourceRepository.GetResourcesAsync(
            request.CorrespondentAccountId,
            request.ResourceTypeId,
            request.StartDate,
            request.EndDate,
            cancellationToken);
}
