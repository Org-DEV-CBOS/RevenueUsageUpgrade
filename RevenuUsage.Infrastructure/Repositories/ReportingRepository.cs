using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Infrastructure.Repositories;

public sealed class ReportingRepository : IReportingRepository
{
    private readonly string _cs;

    public ReportingRepository(IConfiguration c) => _cs = c.GetConnectionString("DB_Connection")!;

    public async Task<DashboardSummary> GetDashboardAsync(DateTime d, CancellationToken ct = default)
    {
        await using var db = new SqlConnection(_cs);
        return await db.QuerySingleAsync<DashboardSummary>(
            new CommandDefinition("dbo.uspGetDashboardSummary", new { AsOfDate = d }, commandType: CommandType.StoredProcedure, cancellationToken: ct));
    }

    public async Task<IEnumerable<ForeignReserveReportRow>> GetForeignReserveAsync(DateTime f, DateTime t, CancellationToken ct = default)
    {
        await using var db = new SqlConnection(_cs);
        return await db.QueryAsync<ForeignReserveReportRow>(
            new CommandDefinition("dbo.uspGetForeignReserveReport", new { StartDate = f, EndDate = t }, commandType: CommandType.StoredProcedure, cancellationToken: ct));
    }

    public async Task<IEnumerable<ObligationReportRow>> GetObligationsAsync(DateTime? f, DateTime? t, string? s, string? clientType = null, CancellationToken ct = default)
    {
        await using var db = new SqlConnection(_cs);
        return await db.QueryAsync<ObligationReportRow>(
            new CommandDefinition("dbo.uspGetObligationReport", new { StartDate = f, EndDate = t, Status = s, ClientType = clientType }, commandType: CommandType.StoredProcedure, cancellationToken: ct));
    }

    public async Task<IEnumerable<MovementReportRow>> GetCreditMovementsAsync(DateTime from, DateTime to, string? searchValue, CancellationToken ct = default)
    {
        await using var db = new SqlConnection(_cs);
        return await db.QueryAsync<MovementReportRow>(
            new CommandDefinition("dbo.uspGetCreditMovements", new { StartDate = from, EndDate = to, SearchValue = searchValue }, commandType: CommandType.StoredProcedure, cancellationToken: ct));
    }

    public async Task<IEnumerable<MovementReportRow>> GetDebitMovementsAsync(DateTime from, DateTime to, string? searchValue, CancellationToken ct = default)
    {
        await using var db = new SqlConnection(_cs);
        return await db.QueryAsync<MovementReportRow>(
            new CommandDefinition("dbo.uspGetDebitMovements", new { StartDate = from, EndDate = to, SearchValue = searchValue }, commandType: CommandType.StoredProcedure, cancellationToken: ct));
    }

    public async Task<IEnumerable<ResourceSummaryReportRow>> GetResourcesReportAsync(DateTime? from, DateTime? to, CancellationToken ct = default)
    {
        await using var db = new SqlConnection(_cs);
        return await db.QueryAsync<ResourceSummaryReportRow>(
            new CommandDefinition("dbo.uspGetResourcesReport", new { StartDate = from, EndDate = to }, commandType: CommandType.StoredProcedure, cancellationToken: ct));
    }

    public async Task<IEnumerable<CorrespondentBalanceReportRow>> GetCorrespondentBalanceReportAsync(string? searchValue, CancellationToken ct = default)
    {
        await using var db = new SqlConnection(_cs);
        return await db.QueryAsync<CorrespondentBalanceReportRow>(
            new CommandDefinition("dbo.uspGetCorrespondentBalanceReport", new { SearchValue = searchValue }, commandType: CommandType.StoredProcedure, cancellationToken: ct));
    }
}
