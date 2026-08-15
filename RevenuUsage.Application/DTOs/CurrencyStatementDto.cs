namespace RevenuUsage.Application.DTOs
{
    public sealed record CurrencyStatementDto(
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
