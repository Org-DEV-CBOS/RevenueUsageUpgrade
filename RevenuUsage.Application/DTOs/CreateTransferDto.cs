namespace RevenuUsage.Application.DTOs;

public sealed record CreateTransferDto(
    Guid CorrespondentAccountId,
    Guid BeneficiaryId,
    string? Purpose,
    string? ReferenceNo,
    DateTime? StatementDate,
    string CreatedBy,
    DateTime TransferDate,
    decimal Amount,
    Guid? OperationTypeId,
    Guid? ResourceTypeId,
    Guid? UsageTypeId,
    Guid? BankId);
