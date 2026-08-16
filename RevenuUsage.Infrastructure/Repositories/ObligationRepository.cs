using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;
using System.Data;

namespace RevenuUsage.Infrastructure.Repositories;

public class ObligationRepository : IObligationRepository
{
    private readonly IDbConnection _connection;

    public ObligationRepository(IConfiguration configuration)
    {
        _connection = new SqlConnection(configuration.GetConnectionString("DB_Connection"));
    }
    public async Task<IEnumerable<Obligation>> GetObligationsAsync(bool activeOnly,string? clientType=null,CancellationToken cancellationToken=default)=>await _connection.QueryAsync<Obligation>("dbo.uspGetObligations",new{ActiveOnly=activeOnly,ClientType=clientType},commandType:CommandType.StoredProcedure);
    public async Task<Guid> CreateObligationAsync(Obligation x,string createdBy,CancellationToken cancellationToken=default)=>await _connection.QuerySingleAsync<Guid>("dbo.uspCreateObligation",new{x.ObligationDate,x.ClientName,x.ClientType,x.BankId,x.CompanyId,x.CurrencyId,x.TotalAmount,x.DueDate,x.ReferenceNo,x.Notes,CreatedBy=createdBy},commandType:CommandType.StoredProcedure);
    public async Task DeleteObligationAsync(Guid id,string deletedBy,CancellationToken cancellationToken=default)=>await _connection.ExecuteAsync("dbo.uspDeleteObligation",new{ObligationId=id,DeletedBy=deletedBy},commandType:CommandType.StoredProcedure);

    public async Task AddObligationPayment(Guid obligationId, Guid correspondentAccountId, DateTime paymentDate, decimal amount, string referenceNo, string notes, string createdBy, CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();
        using var transaction = _connection.BeginTransaction();

        try
        {
            var parameters = new DynamicParameters();

            parameters.Add("@ObligationId", obligationId, DbType.Guid);
            parameters.Add("@CorrespondentAccountId", correspondentAccountId, DbType.Guid);
            parameters.Add("@PaymentDate", paymentDate, DbType.Date);
            parameters.Add("@Amount", amount, DbType.Decimal);
            parameters.Add("@ReferenceNo", referenceNo, DbType.String);
            parameters.Add("@Notes", notes, DbType.String);
            parameters.Add("@CreatedBy", createdBy, DbType.String);

            await _connection.ExecuteAsync(
                "dbo.uspAddObligationPayment",
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

    public async Task DeleteObligationPayment(Guid obligationPaymentId, string deletedBy, CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();
        using var transaction = _connection.BeginTransaction();

        try
        {
            var parameters = new DynamicParameters();

            parameters.Add("@ObligationPaymentId", obligationPaymentId, DbType.Guid);
            parameters.Add("@DeletedBy", deletedBy, DbType.String);

            await _connection.ExecuteAsync(
                "dbo.uspDeleteObligationPayment",
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

    public async Task<ObligationStatement> GetObligationStatementAsync(Guid obligationId, CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        try
        {
            var parameters = new { ObligationId = obligationId };

            using var multi = await _connection.QueryMultipleAsync(
                "dbo.uspGetObligationStatement",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            var obligation = await multi.ReadFirstOrDefaultAsync<Obligation>();
            var payments = (await multi.ReadAsync<ObligationPayment>()).ToList();

            if (obligation == null)
            {
                throw new InvalidOperationException("Obligation not found or inactive.");
            }

            return new ObligationStatement
            {
                Obligation = obligation,
                Payments = payments
            };
        }
        catch
        {
            throw;
        }
    }
}
