using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Infrastructure.Repositories;

public sealed class CorrespondentRepository : ICorrespondentRepository
{
    private readonly string _connectionString;

    public CorrespondentRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DB_Connection")
            ?? throw new InvalidOperationException("Connection string 'DB_Connection' is not configured.");
    }

    public async Task<IReadOnlyList<Correspondent>> GetCorrespondentsAsync(bool activeOnly, CancellationToken ct)
    {
        await using var connection = new SqlConnection(_connectionString);
        var command = Command("dbo.uspGetCorrespondents", new { ActiveOnly = activeOnly }, ct);
        return (await connection.QueryAsync<Correspondent>(command)).AsList();
    }

    public async Task<Correspondent?> GetCorrespondentAsync(Guid id, CancellationToken ct)
    {
        await using var connection = new SqlConnection(_connectionString);
        return await connection.QuerySingleOrDefaultAsync<Correspondent>(
            Command("dbo.uspGetCorrespondentById", new { CorrespondentId = id }, ct));
    }

    public async Task<Guid> CreateCorrespondentAsync(Correspondent item, string? createdBy, CancellationToken ct)
    {
        await using var connection = new SqlConnection(_connectionString);
        var parameters = new DynamicParameters();
        parameters.Add("CorrespondentCode", item.CorrespondentCode);
        parameters.Add("CorrespondentNameEn", item.CorrespondentNameEn);
        parameters.Add("CorrespondentNameAr", item.CorrespondentNameAr);
        parameters.Add("CountryId", item.CountryId);
        parameters.Add("CreatedBy", createdBy);
        parameters.Add("CorrespondentId", dbType: DbType.Guid, direction: ParameterDirection.Output);
        await connection.ExecuteAsync(Command("dbo.uspCreateCorrespondent", parameters, ct));
        return parameters.Get<Guid>("CorrespondentId");
    }

    public async Task UpdateCorrespondentAsync(Correspondent item, string? modifiedBy, CancellationToken ct)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.ExecuteAsync(Command("dbo.uspUpdateCorrespondent", new
        {
            item.CorrespondentId,
            item.CorrespondentCode,
            item.CorrespondentNameEn,
            item.CorrespondentNameAr,
            item.CountryId,
            item.IsActive,
            ModifiedBy = modifiedBy
        }, ct));
    }

    public async Task DeleteCorrespondentAsync(Guid id, string? deletedBy, CancellationToken ct)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.ExecuteAsync(Command("dbo.uspDeleteCorrespondent", new
        {
            CorrespondentId = id,
            DeletedBy = deletedBy
        }, ct));
    }

    public async Task<IReadOnlyList<CorrespondentAccount>> GetAccountsAsync(
        Guid? correspondentId, Guid? currencyId, bool activeOnly, CancellationToken ct)
    {
        await using var connection = new SqlConnection(_connectionString);
        var command = Command("dbo.uspGetCorrespondentAccounts", new
        {
            CorrespondentId = correspondentId,
            CurrencyId = currencyId,
            ActiveOnly = activeOnly
        }, ct);
        return (await connection.QueryAsync<CorrespondentAccount>(command)).AsList();
    }

    public async Task<CorrespondentAccount?> GetAccountAsync(Guid id, CancellationToken ct)
    {
        await using var connection = new SqlConnection(_connectionString);
        return await connection.QuerySingleOrDefaultAsync<CorrespondentAccount>(
            Command("dbo.uspGetCorrespondentAccountById", new { CorrespondentAccountId = id }, ct));
    }

    public async Task<Guid> CreateAccountAsync(CorrespondentAccount item, string? createdBy, CancellationToken ct)
    {
        await using var connection = new SqlConnection(_connectionString);
        var parameters = new DynamicParameters();
        parameters.Add("CorrespondentId", item.CorrespondentId);
        parameters.Add("CurrencyId", item.CurrencyId);
        parameters.Add("AccountNumber", item.AccountNumber);
        parameters.Add("OpeningBalance", item.OpeningBalance);
        parameters.Add("CreatedBy", createdBy);
        parameters.Add("CorrespondentAccountId", dbType: DbType.Guid, direction: ParameterDirection.Output);
        await connection.ExecuteAsync(Command("dbo.uspCreateCorrespondentAccount", parameters, ct));
        return parameters.Get<Guid>("CorrespondentAccountId");
    }

    public async Task UpdateAccountAsync(CorrespondentAccount item, string? modifiedBy, CancellationToken ct)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.ExecuteAsync(Command("dbo.uspUpdateCorrespondentAccount", new
        {
            item.CorrespondentAccountId,
            item.CorrespondentId,
            item.CurrencyId,
            item.AccountNumber,
            item.OpeningBalance,
            item.IsActive,
            ModifiedBy = modifiedBy
        }, ct));
    }

    public async Task DeleteAccountAsync(Guid id, string? deletedBy, CancellationToken ct)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.ExecuteAsync(Command("dbo.uspDeleteCorrespondentAccount", new
        {
            CorrespondentAccountId = id,
            DeletedBy = deletedBy
        }, ct));
    }

    private static CommandDefinition Command(string procedure, object? parameters, CancellationToken ct) =>
        new(procedure, parameters, commandType: CommandType.StoredProcedure, cancellationToken: ct);
}
