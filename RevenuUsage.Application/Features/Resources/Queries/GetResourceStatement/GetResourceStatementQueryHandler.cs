using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Resources.Queries.GetResourceStatement;

public sealed class GetResourceStatementQueryHandler 
    : IQueryHandler<GetResourceStatementQuery, IEnumerable<ResourceStatementDto>>
{
    private readonly IResourceRepository _resourceRepository;

    public GetResourceStatementQueryHandler(IResourceRepository resourceRepository)
    {
        _resourceRepository = resourceRepository;
    }

    public async Task<IEnumerable<ResourceStatementDto>> Handle(
        GetResourceStatementQuery request, 
        CancellationToken cancellationToken)
    {
        var results = await _resourceRepository.GetResourceStatementAsync(
            request.CorrespondentAccountId,
            request.StartDate,
            request.EndDate,
            cancellationToken);

        // Map domain entity to DTO
        return results.Select(r => new ResourceStatementDto(
            r.ResourceId,
            r.ResourceDate,
            r.ResourceType,
            r.Amount,
            r.ReferenceNo,
            r.Notes));
    }
}

