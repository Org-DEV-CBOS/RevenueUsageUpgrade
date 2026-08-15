namespace RevenuUsage.Domain.Entities;

public class CurrencyBalance
{
    public Guid CurrencyId { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public string CurrencyNameAr { get; set; } = string.Empty;
    public string CurrencyNameEn { get; set; } = string.Empty;
    public decimal TotalOpeningBalance { get; set; }
    public decimal TotalResources { get; set; }
    public decimal TotalCoverageOut { get; set; }
    public decimal TotalCoverageIn { get; set; }
    public decimal TotalConfirmedTransfers { get; set; }
    public decimal CurrentBalance { get; set; }
}
