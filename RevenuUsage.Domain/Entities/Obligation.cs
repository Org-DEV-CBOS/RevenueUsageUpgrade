namespace RevenuUsage.Domain.Entities;

public static class ObligationClientTypes
{
    public const string Bank = "Bank";
    public const string Company = "Company";
    public const string Other = "Other";

    public static readonly string[] All = { Bank, Company, Other };

    public static bool IsValid(string? value) => value is not null && All.Contains(value);
}

public class Obligation
{
    public Guid ObligationId { get; set; }
    public DateTime ObligationDate { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ClientType { get; set; } = ObligationClientTypes.Other;
    public Guid? BankId { get; set; }
    public Guid? CompanyId { get; set; }
    public string? BankName { get; set; }
    public string? CompanyName { get; set; }
    public Guid CurrencyId { get; set; }
    public string CurrencyNameAr { get; set; } = string.Empty;
    public string CurrencyNameEn { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public DateTime? DueDate { get; set; }
    public string? ReferenceNo { get; set; }
    public bool IsActive { get; set; }
    public string? Notes { get; set; }
}
