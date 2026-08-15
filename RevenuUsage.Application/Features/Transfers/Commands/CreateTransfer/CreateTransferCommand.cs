using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Transfers.Commands.CreateTransfer;

public sealed record CreateTransferCommand(
    Guid CorrespondentAccountId,
    Guid BeneficiaryId,
    string Purpose,
    string ReferenceNo,
    string CreatedBy,
    DateTime TransferDate,
    decimal Amount,
    Guid TransferId,
    Guid OperationTypeId,
    Guid ResourceTypeId,
    Guid UsageTypeId,
    Guid BankId) : ICommand;

