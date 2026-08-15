using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;
using System.Data;

namespace RevenuUsage.Infrastructure.Repositories;

public class CurrencyRepository : ICurrencyRepository
{
    private readonly IDbConnection _connection;

    public CurrencyRepository(IConfiguration configuration)
    {
        _connection = new SqlConnection(configuration.GetConnectionString("DB_Connection"));
    }

    public async Task<IEnumerable<Currency>> GetCurrenciesAsync(bool activeOnly, CancellationToken cancellationToken = default) =>
        await _connection.QueryAsync<Currency>("dbo.uspGetCurrencies", new { ActiveOnly = activeOnly }, commandType: CommandType.StoredProcedure);
    public async Task<Currency?> GetCurrencyAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _connection.QuerySingleOrDefaultAsync<Currency>("dbo.uspGetCurrencyById", new { CurrencyId = id }, commandType: CommandType.StoredProcedure);
    public async Task<Guid> CreateCurrencyAsync(Currency item, string? actor, CancellationToken cancellationToken = default) =>
        await _connection.QuerySingleAsync<Guid>("dbo.uspCreateCurrency", new { item.CurrencyCode, item.CurrencyNameEn, item.CurrencyNameAr, item.Symbol, item.DecimalPlaces, CreatedBy = actor }, commandType: CommandType.StoredProcedure);
    public async Task UpdateCurrencyAsync(Currency item, string? actor, CancellationToken cancellationToken = default) =>
        await _connection.ExecuteAsync("dbo.uspUpdateCurrency", new { item.CurrencyId, item.CurrencyCode, item.CurrencyNameEn, item.CurrencyNameAr, item.Symbol, item.DecimalPlaces, item.IsActive, ModifiedBy = actor }, commandType: CommandType.StoredProcedure);
    public async Task DeleteCurrencyAsync(Guid id, string? actor, CancellationToken cancellationToken = default) =>
        await _connection.ExecuteAsync("dbo.uspDeleteCurrency", new { CurrencyId = id, DeletedBy = actor }, commandType: CommandType.StoredProcedure);

    public async Task<IEnumerable<CurrencyBalance>> GetCurrencyBalancesAsync(CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        var result = await _connection.QueryAsync<CurrencyBalance>(
            "dbo.uspGetCurrencyBalances",
            commandType: CommandType.StoredProcedure
        );

        return result;
    }

    public async Task<IEnumerable<DailyValuation>> GetDailyValuationAsync(DateTime? valuationDate, CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        var parameters = new DynamicParameters();
        parameters.Add("@ValuationDate", valuationDate, DbType.Date);

        var result = await _connection.QueryAsync<DailyValuation>(
            "dbo.uspGetDailyValuation",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return result;
    }

    public async Task<IEnumerable<ExchangeRate>> GetExchangeRateAsync(DateTime? rateDate, Guid? fromCurrencyId, Guid? toCurrencyId, CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        var parameters = new DynamicParameters();
        parameters.Add("@RateDate", rateDate, DbType.Date);
        parameters.Add("@FromCurrencyId", fromCurrencyId, DbType.Guid);
        parameters.Add("@ToCurrencyId", toCurrencyId, DbType.Guid);

        var result = await _connection.QueryAsync<ExchangeRate>(
            "dbo.uspGetExchangeRate",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return result;
    }

    public async Task AddExchangeRateAsync(DateTime rateDate, Guid fromCurrencyId, Guid toCurrencyId, decimal rateValue, string createdBy, CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        using var transaction = _connection.BeginTransaction();

        try
        {
            var parameters = new DynamicParameters();
            parameters.Add("@RateDate", rateDate, DbType.Date);
            parameters.Add("@FromCurrencyId", fromCurrencyId, DbType.Guid);
            parameters.Add("@ToCurrencyId", toCurrencyId, DbType.Guid);
            parameters.Add("@RateValue", rateValue, DbType.Decimal);
            parameters.Add("@CreatedBy", createdBy, DbType.String, size: 100);

            await _connection.ExecuteAsync(
                "dbo.uspAddExchangeRate",
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

    public async Task DeleteExchangeRateAsync(Guid exchangeRateId, string deletedBy, CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        using var transaction = _connection.BeginTransaction();

        try
        {
            var parameters = new DynamicParameters();
            parameters.Add("@ExchangeRateId", exchangeRateId, DbType.Guid);
            parameters.Add("@DeletedBy", deletedBy, DbType.String, size: 100);

            await _connection.ExecuteAsync(
                "dbo.uspDeleteExchangeRate",
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

    public async Task<IEnumerable<CorrespondentBalanceByCurrency>> GetCorrespondentBalancesByCurrencyAsync(CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        var result = await _connection.QueryAsync<CorrespondentBalanceByCurrency>(
            "dbo.uspGetCorrespondentBalancesByCurrency",
            commandType: CommandType.StoredProcedure
        );

        return result;
    }
}
