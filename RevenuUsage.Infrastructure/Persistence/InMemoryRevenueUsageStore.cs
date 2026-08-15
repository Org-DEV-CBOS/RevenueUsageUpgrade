using RevenuUsage.Domain.Entities;

namespace RevenuUsage.Infrastructure.Persistence;

public class InMemoryRevenueUsageStore
{
    private readonly List<RevenueUsage> _items = new();
    private readonly object _syncRoot = new();

    public IReadOnlyCollection<RevenueUsage> GetRecent(int take = 20)
    {
        lock (_syncRoot)
        {
            return _items
                .OrderByDescending(x => x.RecordedAt)
                .Take(take)
                .ToList();
        }
    }

    public void Add(RevenueUsage revenueUsage)
    {
        lock (_syncRoot)
        {
            _items.Add(revenueUsage);
        }
    }
}
