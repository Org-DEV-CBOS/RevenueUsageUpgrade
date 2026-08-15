namespace RevenuUsage.Application.DTOs;

public sealed record AddObligationPaymentDto(
    Guid ObligationId,
    Guid CorrespondentAccountId,
    DateTime PaymentDate,
    decimal Amount,
    string ReferenceNo,
    string Notes,
    string CreatedBy);
