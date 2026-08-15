using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Transfers.Commands.ConfirmTransfer;

public sealed record RejectTransferCommand(
    Guid TransferId, string RejectReason, string RejectedBy) : ICommand;

