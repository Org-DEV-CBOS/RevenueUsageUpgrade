using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Obligations.Commands.AddObligationPayment;

public sealed record AddObligationPaymentCommand(
    Guid ObligationId,
    Guid CorrespondentAccountId,
    DateTime PaymentDate,
    decimal Amount,
    string ReferenceNo,
    string Notes,
    string CreatedBy) : ICommand;
