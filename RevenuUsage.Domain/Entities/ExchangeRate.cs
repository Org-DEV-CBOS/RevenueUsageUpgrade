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

/// <summary>
/// A rate between two currencies, derived through USD because ExchangeRates only
/// stores rates against the dollar. RateValue is null when either side is unpublished.
/// </summary>
public class CrossRate
{
    public DateTime RateDate { get; set; }
    public Guid FromCurrencyId { get; set; }
    public Guid ToCurrencyId { get; set; }
    public decimal? FromRateToUsd { get; set; }
    public decimal? ToRateToUsd { get; set; }
    public decimal? RateValue { get; set; }
}
