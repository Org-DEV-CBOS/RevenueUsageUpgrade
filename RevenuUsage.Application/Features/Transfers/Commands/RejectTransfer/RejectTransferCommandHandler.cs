using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Transfers.Commands.ConfirmTransfer;

public sealed class RejectTransferCommandHandler : ICommandHandler<RejectTransferCommand>
{

    private readonly ITransferRepository _repository;

    public RejectTransferCommandHandler(ITransferRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(RejectTransferCommand request, CancellationToken cancellationToken)
    {
        var entity = new Transfer();
        entity.TransferId = request.TransferId;
        entity.RejectedBy = request.RejectedBy;
        entity.RejectReason = request.RejectReason;

        await _repository.RejectTransfer(entity, cancellationToken);
    }
}

