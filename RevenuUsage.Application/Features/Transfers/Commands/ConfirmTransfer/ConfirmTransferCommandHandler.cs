using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Transfers.Commands.ConfirmTransfer;

public sealed class ConfirmTransferCommandHandler : ICommandHandler<ConfirmTransferCommand>
{

    private readonly ITransferRepository _repository;

    public ConfirmTransferCommandHandler(ITransferRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(ConfirmTransferCommand request, CancellationToken cancellationToken)
    {
        var entity = new Transfer();
        entity.TransferId = request.TransferId;
        entity.ConfirmedBy = request.ConfimredBy;

        await _repository.ConfirmTransfer(entity, cancellationToken);
    }
}

