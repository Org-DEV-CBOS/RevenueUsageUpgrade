namespace RevenuUsage.Application.DTOs;
public sealed record ConfirmTransferDto(
    Guid TransferId, string ConfirmedBy
    );
