namespace RevenuUsage.Application.DTOs;

public sealed record DeleteResourceDto(
    Guid ResourceId,
    string DeletedBy);
