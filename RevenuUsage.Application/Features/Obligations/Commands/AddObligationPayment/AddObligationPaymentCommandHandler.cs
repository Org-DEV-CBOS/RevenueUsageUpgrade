using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Obligations.Commands.AddObligationPayment;

public sealed class AddObligationPaymentCommandHandler : ICommandHandler<AddObligationPaymentCommand>
{
    private readonly IObligationRepository _repository;

    public AddObligationPaymentCommandHandler(IObligationRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(AddObligationPaymentCommand request, CancellationToken cancellationToken)
    {
        await _repository.AddObligationPayment(
            request.ObligationId,
            request.CorrespondentAccountId,
            request.PaymentDate,
            request.Amount,
            request.ReferenceNo,
            request.Notes,
            request.CreatedBy,
            cancellationToken).ConfigureAwait(false);
    }
}
