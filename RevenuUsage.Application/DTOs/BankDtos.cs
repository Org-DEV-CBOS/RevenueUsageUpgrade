namespace RevenuUsage.Application.DTOs;

public class BankDto
{
    public Guid BankId { get; set; }
    public long BankCode { get; set; }
    public string? BankNameEn { get; set; }
    public string BankNameAr { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public bool IsActive { get; set; }
}

public class CreateBankDto
{
    public long BankCode { get; set; }
    public string? BankNameEn { get; set; }
    public string BankNameAr { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public string? CreatedBy { get; set; }
}

public class UpdateBankDto
{
    public Guid BankId { get; set; }
    public long BankCode { get; set; }
    public string? BankNameEn { get; set; }
    public string BankNameAr { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public bool IsActive { get; set; }
    public string? ModifiedBy { get; set; }
}

public class DeleteBankDto
{
    public Guid BankId { get; set; }
    public string? DeletedBy { get; set; }
}
