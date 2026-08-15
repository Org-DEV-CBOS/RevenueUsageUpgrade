using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;
using System.Data;

namespace RevenuUsage.Infrastructure.Repositories;

public class BeneficiaryRepository : IBeneficiaryRepository
{
    private readonly IDbConnection _connection;

    public BeneficiaryRepository(IConfiguration configuration)
    {
        _connection = new SqlConnection(configuration.GetConnectionString("DB_Connection"));
    }

    public async Task<IEnumerable<Beneficiary>> GetBeneficiariesAsync(bool activeOnly, CancellationToken cancellationToken = default) =>
        await _connection.QueryAsync<Beneficiary>("dbo.uspGetBeneficiaries", new { ActiveOnly = activeOnly }, commandType: CommandType.StoredProcedure);

    public async Task<Beneficiary?> GetBeneficiaryAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _connection.QuerySingleOrDefaultAsync<Beneficiary>("dbo.uspGetBeneficiaryById", new { BeneficiaryId = id }, commandType: CommandType.StoredProcedure);

    public async Task<Guid> CreateBeneficiaryAsync(Beneficiary item, string? actor, CancellationToken cancellationToken = default) =>
        await _connection.QuerySingleAsync<Guid>("dbo.uspCreateBeneficiary", new { item.BeneficiaryCode, item.BeneficiaryNameEn, item.BeneficiaryNameAr, CreatedBy = actor }, commandType: CommandType.StoredProcedure);

    public async Task UpdateBeneficiaryAsync(Beneficiary item, string? actor, CancellationToken cancellationToken = default) =>
        await _connection.ExecuteAsync("dbo.uspUpdateBeneficiary", new { item.BeneficiaryId, item.BeneficiaryCode, item.BeneficiaryNameEn, item.BeneficiaryNameAr, item.IsActive, ModifiedBy = actor }, commandType: CommandType.StoredProcedure);

    public async Task DeleteBeneficiaryAsync(Guid id, string? actor, CancellationToken cancellationToken = default) =>
        await _connection.ExecuteAsync("dbo.uspDeleteBeneficiary", new { BeneficiaryId = id, DeletedBy = actor }, commandType: CommandType.StoredProcedure);

    public async Task<IEnumerable<BeneficiaryStatement>> GetBeneficiaryStatementAsync(
        Guid beneficiaryId,
        DateTime? startDate,
        DateTime? endDate,
        CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        var parameters = new DynamicParameters();
        parameters.Add("@BeneficiaryId", beneficiaryId, DbType.Guid);
        parameters.Add("@StartDate", startDate, DbType.Date);
        parameters.Add("@EndDate", endDate, DbType.Date);

        var result = await _connection.QueryAsync<BeneficiaryStatement>(
            "dbo.uspGetBeneficiaryStatement",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return result;
    }
}
