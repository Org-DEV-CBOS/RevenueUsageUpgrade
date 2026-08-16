using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Infrastructure.Repositories;

public sealed class TransferMetadataRepository : ITransferMetadataRepository
{
    private readonly IDbConnection _connection;

    public TransferMetadataRepository(IConfiguration configuration)
    {
        _connection = new SqlConnection(configuration.GetConnectionString("DB_Connection"));
    }

    public async Task<IEnumerable<OperationType>> GetOperationTypesAsync(bool activeOnly, CancellationToken cancellationToken = default) =>
        await _connection.QueryAsync<OperationType>(
            "dbo.uspGetOperationTypes",
            new { ActiveOnly = activeOnly },
            commandType: CommandType.StoredProcedure);

    public async Task<OperationType?> GetOperationTypeAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _connection.QuerySingleOrDefaultAsync<OperationType>(
            "dbo.uspGetOperationTypeById",
            new { OperationTypeId = id },
            commandType: CommandType.StoredProcedure);

    public async Task<Guid> CreateOperationTypeAsync(OperationType item, string? actor, CancellationToken cancellationToken = default) =>
        await _connection.QuerySingleAsync<Guid>(
            "dbo.uspCreateOperationType",
            new { item.OperationTypeCode, item.OperationTypeNameEn, item.OperationTypeNameAr, CreatedBy = actor },
            commandType: CommandType.StoredProcedure);

    public async Task UpdateOperationTypeAsync(OperationType item, string? actor, CancellationToken cancellationToken = default) =>
        await _connection.ExecuteAsync(
            "dbo.uspUpdateOperationType",
            new
            {
                item.OperationTypeId,
                item.OperationTypeCode,
                item.OperationTypeNameEn,
                item.OperationTypeNameAr,
                item.IsActive,
                ModifiedBy = actor
            },
            commandType: CommandType.StoredProcedure);

    public async Task DeleteOperationTypeAsync(Guid id, string? actor, CancellationToken cancellationToken = default) =>
        await _connection.ExecuteAsync(
            "dbo.uspDeleteOperationType",
            new { OperationTypeId = id, DeletedBy = actor },
            commandType: CommandType.StoredProcedure);

    public async Task<IEnumerable<UsageType>> GetUsageTypesAsync(bool activeOnly, CancellationToken cancellationToken = default) =>
        await _connection.QueryAsync<UsageType>(
            "dbo.uspGetUsageTypes",
            new { ActiveOnly = activeOnly },
            commandType: CommandType.StoredProcedure);

    public async Task<UsageType?> GetUsageTypeAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _connection.QuerySingleOrDefaultAsync<UsageType>(
            "dbo.uspGetUsageTypeById",
            new { UsageTypeId = id },
            commandType: CommandType.StoredProcedure);

    public async Task<Guid> CreateUsageTypeAsync(UsageType item, string? actor, CancellationToken cancellationToken = default) =>
        await _connection.QuerySingleAsync<Guid>(
            "dbo.uspCreateUsageType",
            new { item.UsageTypeCode, item.UsageTypeNameEn, item.UsageTypeNameAr, CreatedBy = actor },
            commandType: CommandType.StoredProcedure);

    public async Task UpdateUsageTypeAsync(UsageType item, string? actor, CancellationToken cancellationToken = default) =>
        await _connection.ExecuteAsync(
            "dbo.uspUpdateUsageType",
            new
            {
                item.UsageTypeId,
                item.UsageTypeCode,
                item.UsageTypeNameEn,
                item.UsageTypeNameAr,
                item.IsActive,
                ModifiedBy = actor
            },
            commandType: CommandType.StoredProcedure);

    public async Task DeleteUsageTypeAsync(Guid id, string? actor, CancellationToken cancellationToken = default) =>
        await _connection.ExecuteAsync(
            "dbo.uspDeleteUsageType",
            new { UsageTypeId = id, DeletedBy = actor },
            commandType: CommandType.StoredProcedure);
}
