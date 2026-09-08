namespace RevenuUsage.Domain.Entities;

public class ResourceListItem
{
    public Guid ResourceId { get; set; }
    public DateTime ResourceDate { get; set; }
    public Guid CorrespondentAccountId { get; set; }
    public string AccountNumber { get; set; } = string.Empty;
    public Guid CorrespondentId { get; set; }
    public string CorrespondentNameEn { get; set; } = string.Empty;
    public string? CorrespondentNameAr { get; set; }
    public Guid CurrencyId { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public string? CurrencySymbol { get; set; }
    public Guid ResourceTypeId { get; set; }
    public string ResourceTypeNameEn { get; set; } = string.Empty;
    public string? ResourceTypeNameAr { get; set; }
    public decimal Amount { get; set; }
    public string? Notes { get; set; }
    public Guid? RemittingBankId { get; set; }
    public string? RemittingBankNameEn { get; set; }
    public string? RemittingBankNameAr { get; set; }
    public string? ReferenceNo { get; set; }
    public DateTime? StatementDate { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedTime { get; set; }
}
