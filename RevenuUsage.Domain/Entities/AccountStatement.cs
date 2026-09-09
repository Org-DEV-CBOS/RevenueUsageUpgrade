namespace RevenuUsage.Domain.Entities;

public class AccountStatement
{
    /// <summary>
    /// The brought-forward row that opens the statement. It carries a balance but no
    /// movement, so it has no event type, no amounts and no time, and its date is the
    /// start of the requested window rather than the date of anything that happened.
    /// </summary>
    public bool IsOpening { get; set; }

    /// <summary>The business date the movement is booked under.</summary>
    public DateTime? EventDate { get; set; }

    /// <summary>
    /// The moment the balance actually moved, stamped by the database in UTC. Null for
    /// the opening row and for movements predating the effective timestamps.
    /// </summary>
    public DateTime? EventTime { get; set; }
    public string? EventType { get; set; }
    public decimal AmountIn { get; set; }
    public decimal AmountOut { get; set; }
    public decimal RunningBalance { get; set; }
    public string? Notes { get; set; }
}
