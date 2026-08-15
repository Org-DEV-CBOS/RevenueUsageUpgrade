using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Obligations.Commands.DeleteObligationPayment;

public sealed record DeleteObligationPaymentCommand(
    Guid ObligationPaymentId,
    string DeletedBy) : ICommand;
