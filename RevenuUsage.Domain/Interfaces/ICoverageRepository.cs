using RevenuUsage.Domain.Entities;
namespace RevenuUsage.Domain.Interfaces;
public interface ICoverageRepository
{
    Task<IEnumerable<Coverage>> GetAsync(Guid? accountId, DateTime? startDate, DateTime? endDate, CancellationToken ct = default);
    Task<Guid> CreateAsync(Coverage item, string actor, CancellationToken ct = default);
    Task DeleteAsync(Guid id, string actor, CancellationToken ct = default);
}
