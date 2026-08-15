namespace RevenuUsage.Domain.Entities;

public sealed class Beneficiary
{
    public Guid BeneficiaryId { get; set; }
    public string BeneficiaryCode { get; set; } = string.Empty;
    public string BeneficiaryNameEn { get; set; } = string.Empty;
    public string? BeneficiaryNameAr { get; set; }
    public bool IsActive { get; set; }
    public bool HasMovements { get; set; }
}

public sealed class Currency
{
    public Guid CurrencyId { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public string CurrencyNameEn { get; set; } = string.Empty;
    public string? CurrencyNameAr { get; set; }
    public string? Symbol { get; set; }
    public int DecimalPlaces { get; set; } = 2;
    public bool IsActive { get; set; }
    public bool HasMovements { get; set; }
}

public sealed class ResourceType
{
    public Guid ResourceTypeId { get; set; }
    public string ResourceTypeCode { get; set; } = string.Empty;
    public string ResourceTypeNameEn { get; set; } = string.Empty;
    public string? ResourceTypeNameAr { get; set; }
    public bool IsActive { get; set; }
    public bool HasMovements { get; set; }
}
