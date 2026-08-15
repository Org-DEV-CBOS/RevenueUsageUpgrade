using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Obligations.Commands.DeleteObligationPayment;

public sealed class DeleteObligationPaymentCommandHandler : ICommandHandler<DeleteObligationPaymentCommand>
{
    private readonly IObligationRepository _repository;

    public DeleteObligationPaymentCommandHandler(IObligationRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(DeleteObligationPaymentCommand request, CancellationToken cancellationToken)
    {
        await _repository.DeleteObligationPayment(
            request.ObligationPaymentId,
            request.DeletedBy,
            cancellationToken).ConfigureAwait(false);
    }
}
