using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Transfers.Commands.CreateTransfer;

public sealed class CreateTransferCommandHandler : ICommandHandler<CreateTransferCommand>
{

    private readonly ITransferRepository _repository;
    public CreateTransferCommandHandler(ITransferRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(CreateTransferCommand request, CancellationToken cancellationToken)
    {

        var entity = new Transfer(
            request.CorrespondentAccountId,
            request.BeneficiaryId,
            request.Purpose,
            request.ReferenceNo,
            request.CreatedBy,
            request.TransferDate,
            request.Amount,
            request.OperationTypeId,
            request.ResourceTypeId,
            request.UsageTypeId,
            request.BankId);

        await _repository.CreateTransfer(entity, cancellationToken).ConfigureAwait(false);
    }
}

