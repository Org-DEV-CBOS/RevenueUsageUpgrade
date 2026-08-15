namespace RevenuUsage.Domain.Entities;

public sealed class CorrespondentAccount
{
    public Guid CorrespondentAccountId { get; set; }
    public Guid CorrespondentId { get; set; }
    public string CorrespondentNameEn { get; set; } = string.Empty;
    public string? CorrespondentNameAr { get; set; }
    public Guid CurrencyId { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public decimal OpeningBalance { get; set; }
    public decimal CurrentBalance { get; set; }
    public bool IsActive { get; set; }
    public bool HasMovements { get; set; }
}
