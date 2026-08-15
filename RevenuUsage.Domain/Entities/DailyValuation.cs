namespace RevenuUsage.Domain.Entities;

public class DailyValuation
{
    public Guid DailyValuationId { get; set; }
    public DateTime ValuationDate { get; set; }
    public decimal CashInHandUsd { get; set; }
    public decimal GoldOunces { get; set; }
    public decimal GoldPricePerOunceUsd { get; set; }
    public decimal GoldValueUsd { get; set; }
    public string? Notes { get; set; }
}
