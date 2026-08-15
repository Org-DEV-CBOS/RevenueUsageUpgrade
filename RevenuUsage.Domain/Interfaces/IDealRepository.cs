using RevenuUsage.Domain.Entities;
namespace RevenuUsage.Domain.Interfaces;
public interface IDealRepository
{
    Task<IEnumerable<Deal>> GetAsync(Guid? accountId, DateTime? startDate, DateTime? endDate, CancellationToken ct = default);
    Task<Guid> CreateAsync(Deal item, string actor, CancellationToken ct = default);
    Task DeleteAsync(Guid id, string actor, CancellationToken ct = default);
}
