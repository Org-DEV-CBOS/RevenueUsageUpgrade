namespace RevenuUsage.Domain.Entities;

public sealed class TransferListItem
{
    public Guid TransferId { get; set; }
    public DateTime TransferDate { get; set; }
    public Guid CorrespondentAccountId { get; set; }
    public string AccountNumber { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public Guid BeneficiaryId { get; set; }
    public string BeneficiaryName { get; set; } = string.Empty;
    public Guid? CurrencyId { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public string? CurrencySymbol { get; set; }
    public decimal Amount { get; set; }
    public string? Purpose { get; set; }
    public string? ReferenceNo { get; set; }
    public DateTime? StatementDate { get; set; }
    public string TransferStatus { get; set; } = string.Empty;
    public DateTime? ConfirmedTime { get; set; }
    public DateTime? RejectedTime { get; set; }
    public string? RejectReason { get; set; }
}
