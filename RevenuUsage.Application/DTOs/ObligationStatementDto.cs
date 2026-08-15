namespace RevenuUsage.Application.DTOs;

public sealed record ObligationStatementDto(
    ObligationDetailsDto Obligation,
    List<ObligationPaymentDto> Payments);

public sealed record ObligationDetailsDto(
    Guid ObligationId,
    DateTime ObligationDate,
    string ClientName,
    Guid CurrencyId,
    string CurrencyNameAr,
    string CurrencyNameEn,
    decimal TotalAmount,
    decimal PaidAmount,
    decimal RemainingAmount,
    string? Notes);

public sealed record ObligationPaymentDto(
    Guid ObligationPaymentId,
    DateTime PaymentDate,
    decimal Amount,
    string ReferenceNo,
    string? Notes,
    string CreatedBy,
    DateTime CreatedTime);
