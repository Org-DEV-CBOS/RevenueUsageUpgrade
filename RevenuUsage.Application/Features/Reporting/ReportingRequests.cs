using FluentValidation;
using MediatR;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Reporting;

public record GetDashboardQuery(DateTime AsOfDate) : IRequest<DashboardSummary>;
public record GetForeignReserveReportQuery(DateTime StartDate, DateTime EndDate) : IRequest<IReadOnlyList<ForeignReserveReportRow>>;
public record GetObligationReportQuery(DateTime? StartDate, DateTime? EndDate, string? Status, Guid? ClientTypeId = null) : IRequest<IReadOnlyList<ObligationReportRow>>;

/// <summary>
/// Both correspondent balance reports. <paramref name="InUsd"/> collapses every currency
/// a correspondent holds into a single USD column; otherwise each currency gets its own.
/// </summary>
public record GetCorrespondentBalanceReportQuery(DateTime? AsOfDate, string? SearchValue, bool InUsd = false)
    : IRequest<CorrespondentBalanceReportDto>;

public sealed class ReportingHandler :
    IRequestHandler<GetDashboardQuery, DashboardSummary>,
    IRequestHandler<GetForeignReserveReportQuery, IReadOnlyList<ForeignReserveReportRow>>,
    IRequestHandler<GetObligationReportQuery, IReadOnlyList<ObligationReportRow>>,
    IRequestHandler<GetCorrespondentBalanceReportQuery, CorrespondentBalanceReportDto>
{
    private const string UsdSymbol = "USD";

    private readonly IReportingRepository _repository;

    public ReportingHandler(IReportingRepository repository) => _repository = repository;

    public Task<DashboardSummary> Handle(GetDashboardQuery query, CancellationToken ct) =>
        _repository.GetDashboardAsync(query.AsOfDate, ct);

    public async Task<IReadOnlyList<ForeignReserveReportRow>> Handle(GetForeignReserveReportQuery query, CancellationToken ct) =>
        (await _repository.GetForeignReserveAsync(query.StartDate, query.EndDate, ct)).ToList();

    public async Task<IReadOnlyList<ObligationReportRow>> Handle(GetObligationReportQuery query, CancellationToken ct) =>
        (await _repository.GetObligationsAsync(query.StartDate, query.EndDate, query.Status, query.ClientTypeId, ct)).ToList();

    public async Task<CorrespondentBalanceReportDto> Handle(GetCorrespondentBalanceReportQuery query, CancellationToken ct)
    {
        var asOf = (query.AsOfDate ?? DateTime.UtcNow).Date;
        var (balances, pending) = await _repository.GetCorrespondentBalancesAsync(asOf, query.SearchValue, ct);

        return query.InUsd
            ? BuildUsdReport(balances, pending, asOf)
            : BuildCurrencyMatrix(balances, pending, asOf);
    }

    /// <summary>
    /// A column per currency held, with per-currency totals in the currency itself and
    /// again in USD underneath.
    /// </summary>
    private static CorrespondentBalanceReportDto BuildCurrencyMatrix(
        IReadOnlyList<CorrespondentCurrencyBalance> balances,
        PendingTransferTotal pending,
        DateTime asOf)
    {
        var currencies = balances
            .Select(Symbol)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(symbol => symbol, StringComparer.OrdinalIgnoreCase)
            .ToList();

        var columnOf = currencies
            .Select((symbol, index) => (symbol, index))
            .ToDictionary(x => x.symbol, x => x.index, StringComparer.OrdinalIgnoreCase);

        var rows = balances
            .GroupBy(x => x.CorrespondentId)
            .Select(group =>
            {
                var cells = new decimal?[currencies.Count];
                foreach (var held in group)
                {
                    cells[columnOf[Symbol(held)]] = held.Balance;
                }

                var first = group.First();
                return new CorrespondentBalanceRowDto(first.CorrespondentNameEn, first.CorrespondentNameAr, cells);
            })
            .OrderBy(row => row.CorrespondentName, StringComparer.OrdinalIgnoreCase)
            .ToList();

        var totals = new decimal?[currencies.Count];
        var totalsUsd = new decimal?[currencies.Count];
        var unconverted = 0;

        foreach (var currency in balances.GroupBy(Symbol, StringComparer.OrdinalIgnoreCase))
        {
            var column = columnOf[currency.Key];
            var total = currency.Sum(x => x.Balance);
            totals[column] = total;

            // One rate per currency, so any row of the group carries it.
            var rate = currency.Select(x => x.RateToUsd).FirstOrDefault(rate => rate.HasValue);
            if (rate.HasValue)
            {
                totalsUsd[column] = total * rate.Value;
            }
            else if (total != 0)
            {
                unconverted++;
            }
        }

        return Compose(currencies, rows, totals, totalsUsd, pending, asOf, unconverted);
    }

    /// <summary>
    /// One USD column, each correspondent's holdings across every currency converted and
    /// added together. Holdings in a currency with no published rate cannot be added, so
    /// they are left out and counted instead.
    /// </summary>
    private static CorrespondentBalanceReportDto BuildUsdReport(
        IReadOnlyList<CorrespondentCurrencyBalance> balances,
        PendingTransferTotal pending,
        DateTime asOf)
    {
        var rows = balances
            .GroupBy(x => x.CorrespondentId)
            .Select(group =>
            {
                var first = group.First();
                var converted = group.Where(x => x.BalanceUsd.HasValue).ToList();
                decimal? total = converted.Count == 0 ? null : converted.Sum(x => x.BalanceUsd!.Value);
                return new CorrespondentBalanceRowDto(first.CorrespondentNameEn, first.CorrespondentNameAr, new[] { total });
            })
            .OrderBy(row => row.CorrespondentName, StringComparer.OrdinalIgnoreCase)
            .ToList();

        var unconverted = balances
            .Where(x => !x.RateToUsd.HasValue && x.Balance != 0)
            .Select(x => x.CurrencyId)
            .Distinct()
            .Count();

        var grandTotal = balances.Where(x => x.BalanceUsd.HasValue).Sum(x => x.BalanceUsd!.Value);
        var totals = new decimal?[] { grandTotal };

        return Compose(new[] { UsdSymbol }, rows, totals, totals, pending, asOf, unconverted);
    }

    private static CorrespondentBalanceReportDto Compose(
        IReadOnlyList<string> currencies,
        IReadOnlyList<CorrespondentBalanceRowDto> rows,
        IReadOnlyList<decimal?> totals,
        IReadOnlyList<decimal?> totalsUsd,
        PendingTransferTotal pending,
        DateTime asOf,
        int unconvertedCurrencies)
    {
        var equivalentUsd = totalsUsd.Where(x => x.HasValue).Sum(x => x!.Value);

        return new CorrespondentBalanceReportDto(
            DateTime.UtcNow,
            asOf,
            currencies,
            rows,
            totals,
            totalsUsd,
            equivalentUsd,
            pending.PendingUsd,
            equivalentUsd - pending.PendingUsd,
            unconvertedCurrencies);
    }

    private static string Symbol(CorrespondentCurrencyBalance balance) =>
        string.IsNullOrWhiteSpace(balance.CurrencySymbol) ? balance.CurrencyCode : balance.CurrencySymbol.Trim();
}

public sealed class ForeignReserveReportValidator : AbstractValidator<GetForeignReserveReportQuery>
{
    public ForeignReserveReportValidator() => RuleFor(x => x.EndDate).GreaterThanOrEqualTo(x => x.StartDate);
}

public sealed class ObligationReportValidator : AbstractValidator<GetObligationReportQuery>
{
    public ObligationReportValidator()
    {
        RuleFor(x => x.EndDate).GreaterThanOrEqualTo(x => x.StartDate!.Value).When(x => x.StartDate.HasValue && x.EndDate.HasValue);
        RuleFor(x => x.Status).Must(s => s is null or "Open" or "Paid" or "Overdue");
    }
}
