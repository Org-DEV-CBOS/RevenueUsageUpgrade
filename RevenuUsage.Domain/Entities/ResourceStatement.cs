namespace RevenuUsage.Domain.Entities;

public class ResourceStatement
{
    public Guid ResourceId { get; set; }
    public DateTime ResourceDate { get; set; }
    public string ResourceType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? ReferenceNo { get; set; }
    public string? Notes { get; set; }
}
