namespace RevenuUsage.Application.DTOs;

/// <summary>
/// A complete correspondent balance report: a correspondent-by-currency matrix, the
/// total rows beneath it, and the summary block that nets pending transfers off the
/// USD equivalent. Reports are whole documents rather than pages, because the totals
/// only mean anything over the entire set.
/// </summary>
public sealed record CorrespondentBalanceReportDto(
    DateTime GeneratedAt,
    DateTime AsOfDate,

    /// <summary>Column headings, one per currency the matrix covers.</summary>
    IReadOnlyList<string> Currencies,
    IReadOnlyList<CorrespondentBalanceRowDto> Rows,

    /// <summary>Per-currency totals in the currency itself. Null where nothing is held.</summary>
    IReadOnlyList<decimal?> CurrencyTotals,

    /// <summary>Per-currency totals converted to USD. Null where no rate is published.</summary>
    IReadOnlyList<decimal?> CurrencyTotalsUsd,

    decimal EquivalentUsd,
    decimal PendingUsd,
    decimal NetBalanceUsd,

    /// <summary>
    /// Currencies holding a balance with no published USD rate. They are absent from
    /// the USD figures, so a non-zero count means the totals understate the position.
    /// </summary>
    int UnconvertedCurrencyCount);

/// <summary>One correspondent's row, with balances aligned to the report's currencies.</summary>
public sealed record CorrespondentBalanceRowDto(
    string CorrespondentName,
    string? CorrespondentNameAr,
    IReadOnlyList<decimal?> Balances);
