namespace RevenuUsage.Domain.Entities;

public class Transfer
{
    public Transfer() { }

    public Transfer(
    Guid correspondentAccountId,
    Guid beneficiaryId,
    string purpose,
    string referenceNo,
    string createdBy,
    DateTime transferDate,
    decimal amount,
    Guid operationTypeId,
    Guid resourceTypeId,
    Guid usageTypeId,
    Guid bankId)
    {
        CorrespondentAccountId = correspondentAccountId;
        BeneficiaryId = beneficiaryId;
        Purpose = purpose;
        CreatedBy = createdBy;
        ReferenceNo = referenceNo;
        TransferDate = transferDate;
        Amount = amount;
        OperationTypeId = operationTypeId;
        ResourceTypeId = resourceTypeId;
        UsageTypeId = usageTypeId;
        BankId = bankId;
    }

    public Guid TransferId { get; set; }
    public Guid CorrespondentAccountId { get; set; }
    public Guid BeneficiaryId { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public string? CustomerId { get; set; }
    public string ReferenceNo { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public string? ConfirmedBy { get; set; }
    public string? RejectedBy { get; set; }
    public string? RejectReason { get; set; }
    public string? DeletedBy { get; set; }
    public decimal Amount { get; set; }
    public DateTime TransferDate { get; set; }
    public Guid OperationTypeId { get; set; }
    public Guid ResourceTypeId { get; set; }
    public Guid UsageTypeId { get; set; }
    public Guid BankId { get; set; }

}
