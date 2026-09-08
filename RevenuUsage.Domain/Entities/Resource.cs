namespace RevenuUsage.Domain.Entities;

public class Resource
{
    public Guid ResourceId { get; set; }
    public DateTime ResourceDate { get; set; }
    public Guid CorrespondentAccountId { get; set; }
    public Guid ResourceTypeId { get; set; }
    public decimal Amount { get; set; }
    public string? Notes { get; set; }
    public Guid? RemittingBankId { get; set; }
    public string? ReferenceNo { get; set; }
    public DateTime? StatementDate { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedTime { get; set; }
    public bool IsDeleted { get; set; }
    public string? DeletedBy { get; set; }
    public DateTime? DeletedTime { get; set; }
}
