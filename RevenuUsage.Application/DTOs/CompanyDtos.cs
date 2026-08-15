namespace RevenuUsage.Application.DTOs;

public class CompanyDto
{
    public Guid CompanyId { get; set; }
    public long CompanyCode { get; set; }
    public string? CompanyNameEn { get; set; }
    public string CompanyNameAr { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
}

public class CreateCompanyDto
{
    public long CompanyCode { get; set; }
    public string? CompanyNameEn { get; set; }
    public string CompanyNameAr { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public string? Notes { get; set; }
    public string? CreatedBy { get; set; }
}

public class UpdateCompanyDto
{
    public Guid CompanyId { get; set; }
    public long CompanyCode { get; set; }
    public string? CompanyNameEn { get; set; }
    public string CompanyNameAr { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
    public string? ModifiedBy { get; set; }
}

public class DeleteCompanyDto
{
    public Guid CompanyId { get; set; }
    public string? DeletedBy { get; set; }
}
