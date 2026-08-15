namespace RevenuUsage.Domain.Entities;

public sealed class Coverage
{
    public Guid CoverageId { get; set; }
    public Guid FromCorrespondentAccountId { get; set; }
    public string FromCorrespondentName { get; set; } = string.Empty;
    public Guid ToCorrespondentAccountId { get; set; }
    public string ToCorrespondentName { get; set; } = string.Empty;
    public Guid CurrencyId { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? ReferenceNo { get; set; }
    public string? Narration { get; set; }
    public DateTime TransactionDate { get; set; }
}

public sealed class Deal
{
    public Guid DealId { get; set; }
    public Guid FromCorrespondentAccountId { get; set; }
    public string FromCorrespondentName { get; set; } = string.Empty;
    public string FromCurrencyCode { get; set; } = string.Empty;
    public Guid ToCorrespondentAccountId { get; set; }
    public string ToCorrespondentName { get; set; } = string.Empty;
    public string ToCurrencyCode { get; set; } = string.Empty;
    public decimal FromAmount { get; set; }
    public decimal ExchangeRate { get; set; }
    public decimal ToAmount { get; set; }
    public string? ReferenceNo { get; set; }
    public string? Narration { get; set; }
    public DateTime TransactionDate { get; set; }
}
