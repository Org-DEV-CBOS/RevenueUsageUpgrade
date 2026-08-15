namespace RevenuUsage.Domain.Entities;

public class BeneficiaryStatement
{
    public Guid TransferId { get; set; }
    public DateTime TransferDate { get; set; }
    public string AccountNumber { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string TransferStatus { get; set; } = string.Empty;
    public string ReferenceNo { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public DateTime? ConfirmedTime { get; set; }
    public DateTime? RejectedTime { get; set; }
    public string? RejectReason { get; set; }
}
