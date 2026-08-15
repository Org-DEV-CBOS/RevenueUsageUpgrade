namespace RevenuUsage.Application.DTOs;
public sealed record RejectTransferDto(
    Guid TransferId, string RejectReason, string RejectedBy
    );
