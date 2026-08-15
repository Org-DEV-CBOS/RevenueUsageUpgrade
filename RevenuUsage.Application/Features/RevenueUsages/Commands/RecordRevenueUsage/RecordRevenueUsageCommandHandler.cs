using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Application.Interfaces;

namespace RevenuUsage.Application.Features.RevenueUsages.Commands.RecordRevenueUsage;

public sealed class RecordRevenueUsageCommandHandler : ICommandHandler<RecordRevenueUsageCommand, RevenueUsageDto>
{
    private readonly IRevenueUsageService _revenueUsageService;

    public RecordRevenueUsageCommandHandler(IRevenueUsageService revenueUsageService)
    {
        _revenueUsageService = revenueUsageService;
    }

    public async Task<RevenueUsageDto> Handle(RecordRevenueUsageCommand request, CancellationToken cancellationToken)
    {
        var dto = new RevenueUsageDto(
            request.Id,
            request.CustomerId,
            request.Amount,
            request.RecordedAt,
            request.Notes);

        return await _revenueUsageService.AddAsync(dto, cancellationToken);
    }
}
