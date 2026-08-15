namespace RevenuUsage.Application.DTOs;

public sealed record DeleteTransferDto(
    Guid TransferId,
    string DeletedBy);
