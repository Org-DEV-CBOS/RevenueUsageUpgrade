namespace RevenuUsage.Application.DTOs;

/// <summary>
/// Confirming requires a reference number and statement date. They may already be on
/// the transfer from creation; otherwise the confirmer supplies them here.
/// </summary>
public sealed record ConfirmTransferDto(
    Guid TransferId,
    string? ReferenceNo,
    DateTime? StatementDate,
    string ConfirmedBy);
