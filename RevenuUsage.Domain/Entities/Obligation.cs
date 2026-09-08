namespace RevenuUsage.Domain.Entities;

/// <summary>
/// The client type rows can be renamed by an admin, so anything that depends on which
/// branch applies keys off these codes, matching dbo.ClientTypes.ClientTypeCode.
/// </summary>
public static class ObligationClientTypeCodes
{
    public const string Bank = "BANK";
    public const string Company = "COMPANY";
}

public class Obligation
{
    public Guid ObligationId { get; set; }
    public DateTime ObligationDate { get; set; }
    public Guid ClientTypeId { get; set; }
    public string? ClientTypeCode { get; set; }
    public string? ClientTypeNameEn { get; set; }
    public string? ClientTypeNameAr { get; set; }

    /// <summary>Company clients only; a bank client never carries one.</summary>
    public Guid? ObligationTypeId { get; set; }
    public string? ObligationTypeNameEn { get; set; }
    public string? ObligationTypeNameAr { get; set; }

    public Guid? BankId { get; set; }
    public Guid? CompanyId { get; set; }
    public string? BankName { get; set; }
    public string? CompanyName { get; set; }

    /// <summary>Whichever of the bank or the company the client type points at.</summary>
    public string? ClientNameEn { get; set; }
    public string? ClientNameAr { get; set; }

    public Guid CurrencyId { get; set; }
    public string CurrencyNameAr { get; set; } = string.Empty;
    public string CurrencyNameEn { get; set; } = string.Empty;
    public string? CurrencySymbol { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public DateTime? DueDate { get; set; }
    public string? ReferenceNo { get; set; }
    public bool IsActive { get; set; }
    public string? Notes { get; set; }
}
