namespace RevenuUsage.Domain.Entities;

public class AccountStatement
{
    public DateTime EventDate { get; set; }
    public string EventType { get; set; } = string.Empty;
    public decimal AmountIn { get; set; }
    public decimal AmountOut { get; set; }
    public decimal RunningBalance { get; set; }
    public string? Notes { get; set; }
}
