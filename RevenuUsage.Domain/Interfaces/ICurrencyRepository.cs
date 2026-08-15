using RevenuUsage.Domain.Entities;

namespace RevenuUsage.Domain.Interfaces;

public interface ICurrencyRepository
{
    Task<IEnumerable<Currency>> GetCurrenciesAsync(bool activeOnly, CancellationToken cancellationToken = default);
    Task<Currency?> GetCurrencyAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Guid> CreateCurrencyAsync(Currency item, string? actor, CancellationToken cancellationToken = default);
    Task UpdateCurrencyAsync(Currency item, string? actor, CancellationToken cancellationToken = default);
    Task DeleteCurrencyAsync(Guid id, string? actor, CancellationToken cancellationToken = default);
    Task<IEnumerable<CurrencyBalance>> GetCurrencyBalancesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<DailyValuation>> GetDailyValuationAsync(DateTime? valuationDate, CancellationToken cancellationToken = default);
    Task<IEnumerable<ExchangeRate>> GetExchangeRateAsync(DateTime? rateDate, Guid? fromCurrencyId, Guid? toCurrencyId, CancellationToken cancellationToken = default);
    Task AddExchangeRateAsync(DateTime rateDate, Guid fromCurrencyId, Guid toCurrencyId, decimal rateValue, string createdBy, CancellationToken cancellationToken = default);
    Task DeleteExchangeRateAsync(Guid exchangeRateId, string deletedBy, CancellationToken cancellationToken = default);
    Task<IEnumerable<CorrespondentBalanceByCurrency>> GetCorrespondentBalancesByCurrencyAsync(CancellationToken cancellationToken = default);
}
