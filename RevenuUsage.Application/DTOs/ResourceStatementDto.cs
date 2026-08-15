namespace RevenuUsage.Application.DTOs;

public sealed record ResourceStatementDto(
    Guid ResourceId,
    DateTime ResourceDate,
    string ResourceType,
    decimal Amount,
    string? ReferenceNo,
    string? Notes);
