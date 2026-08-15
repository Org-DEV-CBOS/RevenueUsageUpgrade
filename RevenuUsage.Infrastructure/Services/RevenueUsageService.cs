using RevenuUsage.Application.DTOs;
using RevenuUsage.Application.Interfaces;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Infrastructure.Services;

public class RevenueUsageService : IRevenueUsageService
{
    private readonly IRevenueUsageRepository _repository;

    public RevenueUsageService(IRevenueUsageRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyCollection<RevenueUsageDto>> GetRecentAsync(CancellationToken cancellationToken = default)
    {
        var items = await _repository.GetRecentAsync(cancellationToken).ConfigureAwait(false);
        return items.Select(MapToDto).ToArray();
    }

    public async Task<RevenueUsageDto> AddAsync(RevenueUsageDto usage, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(usage);
        var saved = await _repository.AddAsync(entity, cancellationToken).ConfigureAwait(false);
        return MapToDto(saved);
    }

    private static RevenueUsageDto MapToDto(RevenueUsage entity) =>
        new(entity.Id, entity.CustomerId, entity.Amount, entity.RecordedAt, entity.Notes);

    private static RevenueUsage MapToEntity(RevenueUsageDto dto) =>
        new(dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
            dto.CustomerId,
            dto.Amount,
            dto.RecordedAt == default ? DateTime.UtcNow : dto.RecordedAt,
            dto.Notes);
}
