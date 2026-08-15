using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Interfaces;

public interface IRevenueUsageService
{
    Task<IReadOnlyCollection<RevenueUsageDto>> GetRecentAsync(CancellationToken cancellationToken = default);

    Task<RevenueUsageDto> AddAsync(RevenueUsageDto usage, CancellationToken cancellationToken = default);
}
