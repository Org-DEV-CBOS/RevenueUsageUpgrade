namespace RevenuUsage.Domain.Entities
{
    public sealed record CurrencyStatement(
    Guid CorrespondentAccountId,
    string AccountNumber,
    string AccountName,
    decimal CurrentBalance,
    decimal TotalResources,
    decimal TotalCoverageIn,
    decimal TotalCoverageOut,
    decimal TotalConfirmedTransfers,
    decimal NetBalance
);

}
