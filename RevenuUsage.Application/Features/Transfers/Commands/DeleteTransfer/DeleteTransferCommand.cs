using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Transfers.Commands.ConfirmTransfer;

public sealed record DeleteTransferCommand(
    Guid TransferId, string DeletedBy) : ICommand;

