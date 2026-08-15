using RevenuUsage.Domain.Entities;

namespace RevenuUsage.Domain.Interfaces;

public interface IRevenueUsageRepository
{
    Task<IReadOnlyCollection<RevenueUsage>> GetRecentAsync(CancellationToken cancellationToken = default);

    Task<RevenueUsage> AddAsync(RevenueUsage revenueUsage, CancellationToken cancellationToken = default);
}
