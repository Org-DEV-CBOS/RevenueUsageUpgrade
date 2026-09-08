using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Transfers.Commands.ConfirmTransfer;

public sealed record ConfirmTransferCommand(
    Guid TransferId,
    string? ReferenceNo,
    DateTime? StatementDate,
    string ConfimredBy) : ICommand;
