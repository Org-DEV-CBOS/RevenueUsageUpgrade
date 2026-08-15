using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;
namespace RevenuUsage.Infrastructure.Repositories;
public sealed class CoverageRepository : ICoverageRepository
{
    private readonly string _connectionString;
    public CoverageRepository(IConfiguration c) => _connectionString = c.GetConnectionString("DB_Connection")!;
    public async Task<IEnumerable<Coverage>> GetAsync(Guid? accountId, DateTime? startDate, DateTime? endDate, CancellationToken ct=default){await using var db=new SqlConnection(_connectionString);return await db.QueryAsync<Coverage>(new CommandDefinition("dbo.uspGetCoverages",new{CorrespondentAccountId=accountId,StartDate=startDate,EndDate=endDate},commandType:CommandType.StoredProcedure,cancellationToken:ct));}
    public async Task<Guid> CreateAsync(Coverage x,string actor,CancellationToken ct=default){await using var db=new SqlConnection(_connectionString);return await db.QuerySingleAsync<Guid>(new CommandDefinition("dbo.uspCreateCoverage",new{x.FromCorrespondentAccountId,x.ToCorrespondentAccountId,x.Amount,x.ReferenceNo,x.Narration,x.TransactionDate,CreatedBy=actor},commandType:CommandType.StoredProcedure,cancellationToken:ct));}
    public async Task DeleteAsync(Guid id,string actor,CancellationToken ct=default){await using var db=new SqlConnection(_connectionString);await db.ExecuteAsync(new CommandDefinition("dbo.uspDeleteCoverage",new{CoverageId=id,DeletedBy=actor},commandType:CommandType.StoredProcedure,cancellationToken:ct));}
}
