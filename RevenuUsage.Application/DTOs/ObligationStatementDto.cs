namespace RevenuUsage.Application.DTOs;

public sealed record ObligationStatementDto(
    ObligationDetailsDto Obligation,
    List<ObligationPaymentDto> Payments);

public sealed record ObligationDetailsDto(
    Guid ObligationId,
    DateTime ObligationDate,
    /* The bank or the company, whichever the client type points at. */
    string? ClientNameEn,
    string? ClientNameAr,
    Guid ClientTypeId,
    string? ClientTypeCode,
    string? ClientTypeNameEn,
    string? ClientTypeNameAr,
    Guid? ObligationTypeId,
    string? ObligationTypeNameEn,
    string? ObligationTypeNameAr,
    Guid? BankId,
    Guid? CompanyId,
    string? BankName,
    string? CompanyName,
    Guid CurrencyId,
    string CurrencyNameAr,
    string CurrencyNameEn,
    string? CurrencySymbol,
    decimal TotalAmount,
    decimal PaidAmount,
    decimal RemainingAmount,
    DateTime? DueDate,
    string? ReferenceNo,
    string? Notes);

public sealed record ObligationPaymentDto(
    Guid ObligationPaymentId,
    DateTime PaymentDate,
    decimal Amount,
    string ReferenceNo,
    string? Notes,
    string CreatedBy,
    DateTime CreatedTime);
