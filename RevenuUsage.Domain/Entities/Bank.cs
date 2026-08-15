namespace RevenuUsage.Domain.Entities;

public class Bank
{
    public Guid BankId { get; set; }
    public long BankCode { get; set; }
    public string? BankNameEn { get; set; }
    public string BankNameAr { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public bool IsActive { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedTime { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? ModifiedTime { get; set; }
    public string? ModifiedBy { get; set; }
    public DateTime? DeletedTime { get; set; }
    public string? DeletedBy { get; set; }
}
