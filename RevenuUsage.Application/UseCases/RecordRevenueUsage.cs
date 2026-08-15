using RevenuUsage.Application.DTOs;
using RevenuUsage.Application.Interfaces;

namespace RevenuUsage.Application.UseCases;

public class RecordRevenueUsage
{
    private readonly IRevenueUsageService _revenueUsageService;

    public RecordRevenueUsage(IRevenueUsageService revenueUsageService)
    {
        _revenueUsageService = revenueUsageService;
    }

    public Task<RevenueUsageDto> ExecuteAsync(RevenueUsageDto usage, CancellationToken cancellationToken = default) =>
        _revenueUsageService.AddAsync(usage, cancellationToken);
}
