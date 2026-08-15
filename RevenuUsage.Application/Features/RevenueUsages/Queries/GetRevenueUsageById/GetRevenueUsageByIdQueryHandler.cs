using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Application.Interfaces;

namespace RevenuUsage.Application.Features.RevenueUsages.Queries.GetRevenueUsageById;

public sealed class GetRevenueUsageByIdQueryHandler : IQueryHandler<GetRevenueUsageByIdQuery, RevenueUsageDto?>
{
    private readonly IRevenueUsageService _revenueUsageService;

    public GetRevenueUsageByIdQueryHandler(IRevenueUsageService revenueUsageService)
    {
        _revenueUsageService = revenueUsageService;
    }

    public async Task<RevenueUsageDto?> Handle(GetRevenueUsageByIdQuery request, CancellationToken cancellationToken)
    {
        // This is a placeholder - you'll need to implement GetByIdAsync in your service
        // return await _revenueUsageService.GetByIdAsync(request.Id, cancellationToken);
        
        // For now, returning null as a placeholder
        await Task.CompletedTask;
        return null;
    }
}
