using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Obligations.Queries.GetObligationStatement;

public sealed class GetObligationStatementQueryHandler : IQueryHandler<GetObligationStatementQuery, ObligationStatementDto>
{
    private readonly IObligationRepository _repository;

    public GetObligationStatementQueryHandler(IObligationRepository repository)
    {
        _repository = repository;
    }

    public async Task<ObligationStatementDto> Handle(GetObligationStatementQuery request, CancellationToken cancellationToken)
    {
        var statement = await _repository.GetObligationStatementAsync(request.ObligationId, cancellationToken);

        var obligationDto = new ObligationDetailsDto(
            statement.Obligation.ObligationId,
            statement.Obligation.ObligationDate,
            statement.Obligation.ClientName,
            statement.Obligation.CurrencyId,
            statement.Obligation.CurrencyNameAr,
            statement.Obligation.CurrencyNameEn,
            statement.Obligation.TotalAmount,
            statement.Obligation.PaidAmount,
            statement.Obligation.RemainingAmount,
            statement.Obligation.Notes);

        var paymentsDto = statement.Payments.Select(p => new ObligationPaymentDto(
            p.ObligationPaymentId,
            p.PaymentDate,
            p.Amount,
            p.ReferenceNo,
            p.Notes,
            p.CreatedBy,
            p.CreatedTime)).ToList();

        return new ObligationStatementDto(obligationDto, paymentsDto);
    }
}
