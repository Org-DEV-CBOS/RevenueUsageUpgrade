using RevenuUsage.Domain.Entities;

namespace RevenuUsage.Domain.Interfaces;

public interface IReportingRepository
{
    Task<DashboardSummary> GetDashboardAsync(DateTime asOfDate, CancellationToken ct = default);
    Task<IEnumerable<ForeignReserveReportRow>> GetForeignReserveAsync(DateTime from, DateTime to, CancellationToken ct = default);
    Task<IEnumerable<ObligationReportRow>> GetObligationsAsync(DateTime? from, DateTime? to, string? status, Guid? clientTypeId = null, CancellationToken ct = default);

    /// <summary>
    /// Correspondent holdings in long form, one row per correspondent and currency,
    /// together with the pending transfers that are set against them.
    /// </summary>
    Task<(IReadOnlyList<CorrespondentCurrencyBalance> Balances, PendingTransferTotal Pending)> GetCorrespondentBalancesAsync(
        DateTime? asOfDate,
        string? searchValue,
        CancellationToken ct = default);
}
