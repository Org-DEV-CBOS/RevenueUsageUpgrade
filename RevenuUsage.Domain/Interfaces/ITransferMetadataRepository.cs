using RevenuUsage.Domain.Entities;

namespace RevenuUsage.Domain.Interfaces;

public interface ITransferMetadataRepository
{
    Task<IEnumerable<OperationType>> GetOperationTypesAsync(bool activeOnly, CancellationToken cancellationToken = default);
    Task<OperationType?> GetOperationTypeAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Guid> CreateOperationTypeAsync(OperationType item, string? actor, CancellationToken cancellationToken = default);
    Task UpdateOperationTypeAsync(OperationType item, string? actor, CancellationToken cancellationToken = default);
    Task DeleteOperationTypeAsync(Guid id, string? actor, CancellationToken cancellationToken = default);

    Task<IEnumerable<UsageType>> GetUsageTypesAsync(bool activeOnly, CancellationToken cancellationToken = default);
    Task<UsageType?> GetUsageTypeAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Guid> CreateUsageTypeAsync(UsageType item, string? actor, CancellationToken cancellationToken = default);
    Task UpdateUsageTypeAsync(UsageType item, string? actor, CancellationToken cancellationToken = default);
    Task DeleteUsageTypeAsync(Guid id, string? actor, CancellationToken cancellationToken = default);
}
