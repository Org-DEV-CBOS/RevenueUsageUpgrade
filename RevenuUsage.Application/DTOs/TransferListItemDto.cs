namespace RevenuUsage.Application.DTOs;

public sealed record TransferListItemDto(
    Guid TransferId,
    DateTime TransferDate,
    Guid CorrespondentAccountId,
    string AccountNumber,
    string AccountName,
    Guid BeneficiaryId,
    string BeneficiaryName,
    Guid? CurrencyId,
    string CurrencyCode,
    decimal Amount,
    string Purpose,
    string ReferenceNo,
    string TransferStatus,
    DateTime? ConfirmedTime,
    DateTime? RejectedTime,
    string? RejectReason);
