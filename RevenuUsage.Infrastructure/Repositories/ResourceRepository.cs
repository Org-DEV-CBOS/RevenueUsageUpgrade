using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;
using System.Data;

namespace RevenuUsage.Infrastructure.Repositories;

public class ResourceRepository : IResourceRepository
{
    private readonly IDbConnection _connection;

    public ResourceRepository(IConfiguration configuration)
    {
        _connection = new SqlConnection(configuration.GetConnectionString("DB_Connection"));
    }

    public async Task<IEnumerable<ResourceType>> GetResourceTypesAsync(bool activeOnly, CancellationToken cancellationToken = default) =>
        await _connection.QueryAsync<ResourceType>("dbo.uspGetResourceTypes", new { ActiveOnly = activeOnly }, commandType: CommandType.StoredProcedure);
    public async Task<ResourceType?> GetResourceTypeAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _connection.QuerySingleOrDefaultAsync<ResourceType>("dbo.uspGetResourceTypeById", new { ResourceTypeId = id }, commandType: CommandType.StoredProcedure);
    public async Task<Guid> CreateResourceTypeAsync(ResourceType item, string? actor, CancellationToken cancellationToken = default) =>
        await _connection.QuerySingleAsync<Guid>("dbo.uspCreateResourceType", new { item.ResourceTypeCode, item.ResourceTypeNameEn, item.ResourceTypeNameAr, CreatedBy = actor }, commandType: CommandType.StoredProcedure);
    public async Task UpdateResourceTypeAsync(ResourceType item, string? actor, CancellationToken cancellationToken = default) =>
        await _connection.ExecuteAsync("dbo.uspUpdateResourceType", new { item.ResourceTypeId, item.ResourceTypeCode, item.ResourceTypeNameEn, item.ResourceTypeNameAr, item.IsActive, ModifiedBy = actor }, commandType: CommandType.StoredProcedure);
    public async Task DeleteResourceTypeAsync(Guid id, string? actor, CancellationToken cancellationToken = default) =>
        await _connection.ExecuteAsync("dbo.uspDeleteResourceType", new { ResourceTypeId = id, DeletedBy = actor }, commandType: CommandType.StoredProcedure);

    public async Task AddResourceToCorrespondentAccountAsync(
        DateTime resourceDate,
        Guid correspondentAccountId,
        decimal amount,
        Guid resourceTypeId,
        string? notes,
        string createdBy,
        CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        using var transaction = _connection.BeginTransaction();

        try
        {
            var parameters = new DynamicParameters();
            parameters.Add("@ResourceDate", resourceDate, DbType.Date);
            parameters.Add("@CorrespondentAccountId", correspondentAccountId, DbType.Guid);
            parameters.Add("@Amount", amount, DbType.Decimal);
            parameters.Add("@ResourceTypeId", resourceTypeId, DbType.Guid);
            parameters.Add("@Notes", notes, DbType.String, size: 300);
            parameters.Add("@CreatedBy", createdBy, DbType.String, size: 100);

            await _connection.ExecuteAsync(
                "dbo.uspAddResourceToCorrespondentAccount",
                parameters,
                transaction,
                commandType: CommandType.StoredProcedure
            );

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task DeleteResourceAsync(
        Guid resourceId,
        string deletedBy,
        CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        using var transaction = _connection.BeginTransaction();

        try
        {
            var parameters = new DynamicParameters();
            parameters.Add("@ResourceId", resourceId, DbType.Guid);
            parameters.Add("@DeletedBy", deletedBy, DbType.String, size: 100);

            await _connection.ExecuteAsync(
                "dbo.uspDeleteResource",
                parameters,
                transaction,
                commandType: CommandType.StoredProcedure
            );

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<IEnumerable<ResourceStatement>> GetResourceStatementAsync(
        Guid correspondentAccountId,
        DateTime? startDate,
        DateTime? endDate,
        CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        var parameters = new DynamicParameters();
        parameters.Add("@CorrespondentAccountId", correspondentAccountId, DbType.Guid);
        parameters.Add("@StartDate", startDate, DbType.Date);
        parameters.Add("@EndDate", endDate, DbType.Date);

        var results = await _connection.QueryAsync<ResourceStatement>(
            "dbo.uspGetResourceStatement",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return results;
    }
}


