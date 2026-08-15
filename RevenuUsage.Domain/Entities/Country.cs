namespace RevenuUsage.Domain.Entities;

public class Country
{
    public Guid CountryId { get; set; }
    public long CountryCode { get; set; }
    public string CountryNameEn { get; set; } = string.Empty;
    public string CountryNameAr { get; set; } = string.Empty;
    public string? IsoCode { get; set; }
    public bool IsActive { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedTime { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? ModifiedTime { get; set; }
    public string? ModifiedBy { get; set; }
    public DateTime? DeletedTime { get; set; }
    public string? DeletedBy { get; set; }
}
