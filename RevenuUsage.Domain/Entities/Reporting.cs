namespace RevenuUsage.Domain.Entities;

public sealed class DashboardSummary
{
    public DateTime AsOfDate { get; set; }
    public decimal TotalResourcesUsd { get; set; }
    public decimal ConfirmedTransfersUsd { get; set; }
    public decimal TotalAccountBalance { get; set; }
    public decimal NetPositionUsd { get; set; }
    public decimal OutstandingObligationsUsd { get; set; }
    public decimal CashInHandUsd { get; set; }
    public decimal GoldValueUsd { get; set; }
    public decimal DepositsUsd { get; set; }
    public decimal ReserveTotalUsd { get; set; }

    /// <summary>
    /// Currencies holding a non-zero balance that have no published USD rate, and so
    /// are missing from the totals above.
    /// </summary>
    public int UnconvertedCurrencyCount { get; set; }

    public int CorrespondentCount { get; set; }
    public int AccountCount { get; set; }
    public int PendingTransferCount { get; set; }
    public int ConfirmedTransferCount { get; set; }
    public int BankCount { get; set; }
    public int CompanyCount { get; set; }
    public int CountryCount { get; set; }
    public int CurrencyCount { get; set; }
    public int BeneficiaryCount { get; set; }
    public int ResourceTypeCount { get; set; }
    public int ObligationCount { get; set; }
    public IReadOnlyList<DashboardCurrencyBalance> CurrencyBalances { get; set; } = [];
}

public sealed class DashboardCurrencyBalance
{
    public Guid CurrencyId { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public string CurrencyNameEn { get; set; } = string.Empty;
    public string? CurrencyNameAr { get; set; }
    public string? CurrencySymbol { get; set; }
    public decimal Balance { get; set; }
    public decimal BalanceUsd { get; set; }
}

public sealed class ForeignReserveReportRow{public DateTime ReportDate{get;set;}public decimal CorrespondentBalancesUsd{get;set;}public decimal CashInHandUsd{get;set;}public decimal GoldValueUsd{get;set;}public decimal DepositsUsd{get;set;}public decimal ResourcesUsd{get;set;}public decimal UsagesUsd{get;set;}public decimal GrandTotalUsd{get;set;}}
public sealed class ObligationReportRow{public Guid ObligationId{get;set;}public string ClientName{get;set;}=string.Empty;public string? ClientNameAr{get;set;}public string ClientType{get;set;}=string.Empty;public string? ObligationType{get;set;}public string CurrencyCode{get;set;}=string.Empty;public string? CurrencySymbol{get;set;}public decimal TotalAmount{get;set;}public decimal PaidAmount{get;set;}public decimal RemainingAmount{get;set;}public decimal? RateToUsd{get;set;}public decimal? RemainingAmountUsd{get;set;}public DateTime? DueDate{get;set;}public string Status{get;set;}=string.Empty;}

/// <summary>
/// One correspondent's holding in one currency, with the rate that converts it to USD.
/// A null <see cref="RateToUsd"/> means the currency has no published rate, so the
/// holding cannot be counted towards a USD total.
/// </summary>
public sealed class CorrespondentCurrencyBalance
{
    public Guid CorrespondentId { get; set; }
    public string CorrespondentNameEn { get; set; } = string.Empty;
    public string? CorrespondentNameAr { get; set; }
    public Guid CurrencyId { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public string? CurrencySymbol { get; set; }
    public decimal Balance { get; set; }
    public decimal? RateToUsd { get; set; }
    public decimal? BalanceUsd { get; set; }
}

/// <summary>Transfers raised but not yet confirmed, which have not moved a balance yet.</summary>
public sealed class PendingTransferTotal
{
    public decimal PendingUsd { get; set; }
}
