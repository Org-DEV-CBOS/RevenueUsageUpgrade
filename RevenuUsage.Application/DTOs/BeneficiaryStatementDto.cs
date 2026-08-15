namespace RevenuUsage.Application.DTOs;

public sealed record BeneficiaryStatementDto(
    Guid TransferId,
    DateTime TransferDate,
    string AccountNumber,
    string AccountName,
    decimal Amount,
    string TransferStatus,
    string ReferenceNo,
    string Purpose,
    DateTime? ConfirmedTime,
    DateTime? RejectedTime,
    string? RejectReason);
