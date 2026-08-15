namespace RevenuUsage.Domain.Entities;

public sealed class Correspondent
{
    public Guid CorrespondentId { get; set; }
    public string CorrespondentCode { get; set; } = string.Empty;
    public string CorrespondentNameEn { get; set; } = string.Empty;
    public string? CorrespondentNameAr { get; set; }
    public Guid? CountryId { get; set; }
    public string? CountryNameEn { get; set; }
    public string? CountryNameAr { get; set; }
    public bool IsActive { get; set; }
}
