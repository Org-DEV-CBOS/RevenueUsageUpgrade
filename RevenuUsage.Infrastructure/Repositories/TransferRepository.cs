using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;
using System.Data;

namespace RevenuUsage.Infrastructure.Repositories
{
    public class TransferRepository : ITransferRepository
    {
        private readonly IDbConnection _connection;
        public TransferRepository(IConfiguration configuration)
        {
            _connection = new SqlConnection(configuration.GetConnectionString("DB_Connection"));
        }

        public async Task DeleteTransfer(Transfer deleteTransfer, CancellationToken cancellationToken = default)
        {
            if (_connection.State != ConnectionState.Open)
                _connection.Open();
            using var transaction = _connection.BeginTransaction();

            try
            {
                var parameters = new DynamicParameters();

                parameters.Add("@TransferId", deleteTransfer.TransferId, DbType.Guid, size: 450);
                parameters.Add("@DeletedBy", deleteTransfer.DeletedBy, DbType.String);

                await _connection.ExecuteAsync(
                    "dbo.uspDeleteTransfer",
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
        public async Task RejectTransfer(Transfer rejectTransfer, CancellationToken cancellationToken = default)
        {
            if (_connection.State != ConnectionState.Open)
                _connection.Open();
            using var transaction = _connection.BeginTransaction();

            try
            {
                var parameters = new DynamicParameters();

                parameters.Add("@TransferId", rejectTransfer.TransferId, DbType.Guid, size: 450);
                parameters.Add("@RejectedBy", rejectTransfer.RejectedBy, DbType.String);
                parameters.Add("@RejectReason", rejectTransfer.RejectReason, DbType.String);

                await _connection.ExecuteAsync(
                    "dbo.uspRejectTransfer",
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
        public async Task ConfirmTransfer(Transfer confirmTransfer, CancellationToken cancellationToken = default)
        {
            if (_connection.State != ConnectionState.Open)
                _connection.Open();
            using var transaction = _connection.BeginTransaction();

            try
            {
                var parameters = new DynamicParameters();

                parameters.Add("@TransferId", confirmTransfer.TransferId, DbType.Guid, size: 450);
                parameters.Add("@ConfirmedBy", confirmTransfer.ConfirmedBy, DbType.String);

                await _connection.ExecuteAsync(
                    "dbo.uspConfirmTransfer",
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

        async Task ITransferRepository.CreateTransfer(Transfer createTransfer, CancellationToken cancellationToken)
        {
            if (_connection.State != ConnectionState.Open)
                _connection.Open();
            using var transaction = _connection.BeginTransaction();

            try
            {
                var parameters = new DynamicParameters();


                parameters.Add("@TransferDate", createTransfer.TransferDate, DbType.DateTime2);
                parameters.Add("@BeneficiaryId", createTransfer.BeneficiaryId, DbType.Guid, size: 450);
                parameters.Add("@CorrespondentAccountId", createTransfer.CorrespondentAccountId, DbType.Guid);
                parameters.Add("@Amount", createTransfer.Amount, DbType.Decimal, size: 450);
                parameters.Add("@Purpose", createTransfer.Purpose, DbType.String);
                parameters.Add("@ReferenceNo", createTransfer.ReferenceNo, DbType.String);
                parameters.Add("@OperationTypeId", createTransfer.OperationTypeId, DbType.Guid);
                parameters.Add("@ResourceTypeId", createTransfer.ResourceTypeId, DbType.Guid);
                parameters.Add("@UsageTypeId", createTransfer.UsageTypeId, DbType.Guid);
                parameters.Add("@BankId", createTransfer.BankId, DbType.Guid);
                parameters.Add("@CreatedBy", createTransfer.CreatedBy, DbType.String);
                parameters.Add("@TransferId", dbType: DbType.Guid, direction: ParameterDirection.Output);

                await _connection.ExecuteAsync(
                    "dbo.uspCreateTransfer",
                    parameters,
                    transaction,
                    commandType: CommandType.StoredProcedure
                );

                transaction.Commit();

                await Task.FromResult(createTransfer);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }

        }

        public async Task<List<AccountStatement>> GetStatementAsync(Guid accountId, DateTime? start, DateTime? end)
        {

            if (_connection.State != ConnectionState.Open)
                _connection.Open();
            using var transaction = _connection.BeginTransaction();

            try
            {

                var parameters = new
                {
                    CorrespondentAccountId = accountId,
                    StartDate = start,
                    EndDate = end
                };

                var result = await _connection.QueryAsync<AccountStatement>(
                    "dbo.uspGetCorrespondentAccountStatement",
                    parameters,
                    transaction,
                    commandType: CommandType.StoredProcedure
                );
                transaction.Commit();
                return result.ToList();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }

        }

        public async Task<FinalBankPosition?> GetFinalPositionAsync(DateTime positionDate)
        {
            var parameters = new { PositionDate = positionDate };

            return await _connection.QueryFirstOrDefaultAsync<FinalBankPosition>(
                "dbo.uspGetFinalBankPosition",
                parameters,
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<List<CurrencyStatement>> GetCurrencyStatementAsync(Guid currencyId, DateTime asOfDate)
        {
            var parameters = new { CurrencyId = currencyId, AsOfDate = asOfDate };

            var result = await _connection.QueryAsync<CurrencyStatement>(
                "dbo.uspGetCurrencyStatement",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return result.ToList();
        }

        public async Task<(IReadOnlyList<TransferListItem> Items, int TotalCount)> GetTransfersAsync(
            Guid? correspondentAccountId,
            Guid? beneficiaryId,
            Guid? currencyId,
            string? status,
            DateTime? startDate,
            DateTime? endDate,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default)
        {
            var parameters = new
            {
                CorrespondentAccountId = correspondentAccountId,
                BeneficiaryId = beneficiaryId,
                CurrencyId = currencyId,
                Status = status,
                StartDate = startDate,
                EndDate = endDate,
                PageNumber = page,
                PageSize = pageSize
            };

            var command = new CommandDefinition(
                "dbo.uspGetTransfers",
                parameters,
                commandType: CommandType.StoredProcedure,
                cancellationToken: cancellationToken);

            using var result = await _connection.QueryMultipleAsync(command);
            var items = (await result.ReadAsync<TransferListItem>()).AsList();
            var totalCount = await result.ReadSingleAsync<int>();

            return (items, totalCount);
        }
    }
}
