namespace RevenuUsage.Domain.Entities;

public class ObligationPayment
{
    public Guid ObligationPaymentId { get; set; }
    public Guid ObligationId { get; set; }
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string ReferenceNo { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedTime { get; set; }
}
