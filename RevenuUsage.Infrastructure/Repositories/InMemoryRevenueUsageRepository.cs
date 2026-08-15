using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;
using RevenuUsage.Infrastructure.Persistence;

namespace RevenuUsage.Infrastructure.Repositories;

public class InMemoryRevenueUsageRepository : IRevenueUsageRepository
{
    private readonly InMemoryRevenueUsageStore _store;

    public InMemoryRevenueUsageRepository(InMemoryRevenueUsageStore store)
    {
        _store = store;
    }

    public Task<IReadOnlyCollection<RevenueUsage>> GetRecentAsync(CancellationToken cancellationToken = default)
    {
        var items = _store.GetRecent();
        return Task.FromResult(items);
    }

    public Task<RevenueUsage> AddAsync(RevenueUsage revenueUsage, CancellationToken cancellationToken = default)
    {
        _store.Add(revenueUsage);
        return Task.FromResult(revenueUsage);
    }
}
