namespace RevenuUsage.Domain.Entities;

public class AccountStatement
{
    /// <summary>
    /// The brought-forward row that opens the statement. It carries a balance but no
    /// movement, so it has no event type and no amounts, and its date is the start of
    /// the requested window rather than the date of anything that happened.
    /// </summary>
    public bool IsOpening { get; set; }

    public DateTime? EventDate { get; set; }
    public string? EventType { get; set; }
    public decimal AmountIn { get; set; }
    public decimal AmountOut { get; set; }
    public decimal RunningBalance { get; set; }
    public string? Notes { get; set; }
}
