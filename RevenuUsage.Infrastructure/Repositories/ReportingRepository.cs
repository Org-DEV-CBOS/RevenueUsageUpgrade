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
        const string sql = """
            DECLARE @reserve decimal(19, 4) = COALESCE((
                SELECT TOP (1) GoldValue + CashInHand + Deposits
                FROM dbo.ReserveSnapshots
                WHERE ReserveDate <= @AsOfDate AND DeletedTime IS NULL
                ORDER BY ReserveDate DESC, CreatedTime DESC
            ), 0);

            DECLARE @accountBalance decimal(19, 4) = COALESCE((
                SELECT SUM(CurrentBalance)
                FROM dbo.CorrespondentAccounts
                WHERE IsDeleted = 0
            ), 0);

            SELECT
                @AsOfDate AS AsOfDate,
                COALESCE((
                    SELECT SUM(Amount)
                    FROM dbo.Resources
                    WHERE ResourceDate <= @AsOfDate AND DeletedTime IS NULL
                ), 0) AS TotalResourcesUsd,
                COALESCE((
                    SELECT SUM(Amount)
                    FROM dbo.Transfers
                    WHERE TransferDate < DATEADD(day, 1, @AsOfDate)
                      AND TransferStatus = 'Confirmed'
                      AND DeletedTime IS NULL
                ), 0) AS ConfirmedTransfersUsd,
                @accountBalance AS TotalAccountBalance,
                @accountBalance + @reserve AS NetPositionUsd,
                COALESCE((
                    SELECT SUM(TotalAmount - PaidAmount)
                    FROM dbo.Obligations
                    WHERE DeletedTime IS NULL
                ), 0) AS OutstandingObligationsUsd,
                @reserve AS ReserveTotalUsd,
                (SELECT COUNT(*) FROM dbo.Correspondents WHERE IsDeleted = 0 AND IsActive = 1) AS CorrespondentCount,
                (SELECT COUNT(*) FROM dbo.CorrespondentAccounts WHERE IsDeleted = 0) AS AccountCount,
                (SELECT COUNT(*) FROM dbo.Transfers WHERE TransferStatus = 'Pending' AND DeletedTime IS NULL) AS PendingTransferCount,
                (SELECT COUNT(*) FROM dbo.Transfers WHERE TransferStatus = 'Confirmed' AND DeletedTime IS NULL) AS ConfirmedTransferCount,
                (SELECT COUNT(*) FROM dbo.banks WHERE isDeleted = 0) AS BankCount,
                (SELECT COUNT(*) FROM dbo.companies WHERE isDeleted = 0) AS CompanyCount,
                (SELECT COUNT(*) FROM dbo.countries WHERE isDeleted = 0) AS CountryCount,
                (SELECT COUNT(*) FROM dbo.Currencies WHERE IsDeleted = 0) AS CurrencyCount,
                (SELECT COUNT(*) FROM dbo.Beneficiaries WHERE IsDeleted = 0) AS BeneficiaryCount,
                (SELECT COUNT(*) FROM dbo.ResourceTypes WHERE IsDeleted = 0) AS ResourceTypeCount,
                (SELECT COUNT(*) FROM dbo.Obligations WHERE DeletedTime IS NULL AND IsActive = 1) AS ObligationCount;
            """;

        var summary = await db.QuerySingleAsync<DashboardSummary>(
            new CommandDefinition(sql, new { AsOfDate = d.Date }, cancellationToken: ct));
        return summary;
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
