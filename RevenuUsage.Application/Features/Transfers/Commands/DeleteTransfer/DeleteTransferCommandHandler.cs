using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Transfers.Commands.ConfirmTransfer;

public sealed class DeleteTransferCommandHandler : ICommandHandler<DeleteTransferCommand>
{

    private readonly ITransferRepository _repository;

    public DeleteTransferCommandHandler(ITransferRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(DeleteTransferCommand request, CancellationToken cancellationToken)
    {
        var entity = new Transfer();
        entity.TransferId = request.TransferId;
        entity.DeletedBy = request.DeletedBy;

        await _repository.DeleteTransfer(entity, cancellationToken);
    }
}

