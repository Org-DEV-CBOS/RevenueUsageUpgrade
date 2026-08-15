namespace RevenuUsage.Application.DTOs;

public class CountryDto
{
    public Guid CountryId { get; set; }
    public long CountryCode { get; set; }
    public string CountryNameEn { get; set; } = string.Empty;
    public string CountryNameAr { get; set; } = string.Empty;
    public string? IsoCode { get; set; }
    public bool IsActive { get; set; }
}

public class CreateCountryDto
{
    public long CountryCode { get; set; }
    public string CountryNameEn { get; set; } = string.Empty;
    public string CountryNameAr { get; set; } = string.Empty;
    public string? IsoCode { get; set; }
    public string? CreatedBy { get; set; }
}

public class UpdateCountryDto
{
    public Guid CountryId { get; set; }
    public long CountryCode { get; set; }
    public string CountryNameEn { get; set; } = string.Empty;
    public string CountryNameAr { get; set; } = string.Empty;
    public string? IsoCode { get; set; }
    public bool IsActive { get; set; }
    public string? ModifiedBy { get; set; }
}

public class DeleteCountryDto
{
    public Guid CountryId { get; set; }
    public string? DeletedBy { get; set; }
}
