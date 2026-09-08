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

public sealed class OperationType
{
    public Guid OperationTypeId { get; set; }
    public string OperationTypeCode { get; set; } = string.Empty;
    public string OperationTypeNameEn { get; set; } = string.Empty;
    public string? OperationTypeNameAr { get; set; }
    public bool IsActive { get; set; }
    public bool HasMovements { get; set; }
}

public sealed class UsageType
{
    public Guid UsageTypeId { get; set; }
    public string UsageTypeCode { get; set; } = string.Empty;
    public string UsageTypeNameEn { get; set; } = string.Empty;
    public string? UsageTypeNameAr { get; set; }
    public bool IsActive { get; set; }
    public bool HasMovements { get; set; }
}

/// <summary>
/// Bank or company, per <see cref="ObligationClientTypeCodes"/>. Renameable and
/// deactivatable, but not created or deleted: the obligation rules only cover those two.
/// </summary>
public sealed class ClientType
{
    public Guid ClientTypeId { get; set; }
    public string ClientTypeCode { get; set; } = string.Empty;
    public string ClientTypeNameEn { get; set; } = string.Empty;
    public string? ClientTypeNameAr { get; set; }
    public bool IsActive { get; set; }
    public bool HasMovements { get; set; }
}

public sealed class ObligationType
{
    public Guid ObligationTypeId { get; set; }
    public string ObligationTypeNameEn { get; set; } = string.Empty;
    public string? ObligationTypeNameAr { get; set; }
    public bool IsActive { get; set; }
    public bool HasMovements { get; set; }
}
