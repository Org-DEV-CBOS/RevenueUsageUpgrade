namespace RevenuUsage.Domain.Entities;

public class Obligation
{
    public Guid ObligationId { get; set; }
    public DateTime ObligationDate { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public Guid CurrencyId { get; set; }
    public string CurrencyNameAr { get; set; } = string.Empty;
    public string CurrencyNameEn { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public DateTime? DueDate { get; set; }
    public string? ReferenceNo { get; set; }
    public bool IsActive { get; set; }
    public string? Notes { get; set; }
}
