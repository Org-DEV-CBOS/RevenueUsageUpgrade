using RevenuUsage.Domain.Entities;

namespace RevenuUsage.Domain.Interfaces;

public interface IReportingRepository
{
    Task<DashboardSummary> GetDashboardAsync(DateTime asOfDate, CancellationToken ct = default);
    Task<IEnumerable<ForeignReserveReportRow>> GetForeignReserveAsync(DateTime from, DateTime to, CancellationToken ct = default);
    Task<IEnumerable<ObligationReportRow>> GetObligationsAsync(DateTime? from, DateTime? to, string? status, string? clientType = null, CancellationToken ct = default);
    Task<IEnumerable<MovementReportRow>> GetCreditMovementsAsync(DateTime from, DateTime to, string? searchValue, CancellationToken ct = default);
    Task<IEnumerable<MovementReportRow>> GetDebitMovementsAsync(DateTime from, DateTime to, string? searchValue, CancellationToken ct = default);
    Task<IEnumerable<ResourceSummaryReportRow>> GetResourcesReportAsync(DateTime? from, DateTime? to, CancellationToken ct = default);
    Task<IEnumerable<CorrespondentBalanceReportRow>> GetCorrespondentBalanceReportAsync(string? searchValue, CancellationToken ct = default);
}
