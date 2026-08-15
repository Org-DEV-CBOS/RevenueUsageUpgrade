namespace RevenuUsage.Domain.Entities;

public class CorrespondentBalanceByCurrency
{
    public Guid CurrencyId { get; set; }
    public string CurrencyNameAr { get; set; } = string.Empty;
    public string CurrencyNameEn { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public decimal TotalBalance { get; set; }
}
