namespace RevenuUsage.Application.DTOs;

public sealed record AddResourceToCorrespondentAccountDto(
    DateTime ResourceDate,
    Guid CorrespondentAccountId,
    decimal Amount,
    Guid ResourceTypeId,
    string? Notes,
    string CreatedBy);
