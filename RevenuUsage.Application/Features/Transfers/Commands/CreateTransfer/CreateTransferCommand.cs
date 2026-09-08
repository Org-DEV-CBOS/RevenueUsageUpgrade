using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Transfers.Commands.CreateTransfer;

public sealed record CreateTransferCommand(
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
    Guid? BankId) : ICommand;
