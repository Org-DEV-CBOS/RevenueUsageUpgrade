using RevenuUsage.Domain.Entities;

namespace RevenuUsage.Domain.Interfaces;

public interface IResourceRepository
{
    Task<IEnumerable<ResourceType>> GetResourceTypesAsync(bool activeOnly, CancellationToken cancellationToken = default);
    Task<ResourceType?> GetResourceTypeAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Guid> CreateResourceTypeAsync(ResourceType item, string? actor, CancellationToken cancellationToken = default);
    Task UpdateResourceTypeAsync(ResourceType item, string? actor, CancellationToken cancellationToken = default);
    Task DeleteResourceTypeAsync(Guid id, string? actor, CancellationToken cancellationToken = default);
    Task AddResourceToCorrespondentAccountAsync(
        DateTime resourceDate,
        Guid correspondentAccountId,
        decimal amount,
        Guid resourceTypeId,
        string? notes,
        string createdBy,
        CancellationToken cancellationToken = default);

    Task DeleteResourceAsync(
        Guid resourceId,
        string deletedBy,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<ResourceStatement>> GetResourceStatementAsync(
        Guid correspondentAccountId,
        DateTime? startDate,
        DateTime? endDate,
        CancellationToken cancellationToken = default);
}


