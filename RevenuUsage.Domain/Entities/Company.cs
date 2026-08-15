namespace RevenuUsage.Domain.Entities;

public class Company
{
    public Guid CompanyId { get; set; }
    public long CompanyCode { get; set; }
    public string? CompanyNameEn { get; set; }
    public string CompanyNameAr { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedTime { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? ModifiedTime { get; set; }
    public string? ModifiedBy { get; set; }
    public DateTime? DeletedTime { get; set; }
    public string? DeletedBy { get; set; }
}
