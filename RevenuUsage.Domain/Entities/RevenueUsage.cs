namespace RevenuUsage.Domain.Entities;

public class RevenueUsage
{
    public RevenueUsage(Guid id, string customerId, decimal amount, DateTime recordedAt, string? notes = null)
    {
        Id = id;
        CustomerId = customerId;
        Amount = amount;
        RecordedAt = recordedAt;
        Notes = notes;
    }

    public Guid Id { get; }

    public string CustomerId { get; }

    public decimal Amount { get; private set; }

    public DateTime RecordedAt { get; private set; }

    public string? Notes { get; private set; }

    public void UpdateAmount(decimal amount) => Amount = amount;

    public void UpdateRecordedAt(DateTime recordedAt) => RecordedAt = recordedAt;

    public void UpdateNotes(string? notes) => Notes = notes;
}
