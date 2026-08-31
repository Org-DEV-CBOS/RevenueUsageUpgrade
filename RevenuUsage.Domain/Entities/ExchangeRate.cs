namespace RevenuUsage.Domain.Entities;

public class ExchangeRate
{
    public Guid ExchangeRateId { get; set; }
    public DateTime RateDate { get; set; }
    public Guid FromCurrencyId { get; set; }
    public string FromCurrencyCode { get; set; } = string.Empty;
    public string FromCurrencySymbol { get; set; } = string.Empty;
    public string FromCurrencyNameAr { get; set; } = string.Empty;
    public string FromCurrencyNameEn { get; set; } = string.Empty;
    public Guid ToCurrencyId { get; set; }
    public string ToCurrencyCode { get; set; } = string.Empty;
    public string ToCurrencyNameAr { get; set; } = string.Empty;
    public string ToCurrencyNameEn { get; set; } = string.Empty;
    public decimal RateValue { get; set; }
}
