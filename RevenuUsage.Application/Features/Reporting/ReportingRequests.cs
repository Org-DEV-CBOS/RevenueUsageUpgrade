using FluentValidation;
using MediatR;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Reporting;

public record GetDashboardQuery(DateTime AsOfDate) : IRequest<DashboardSummary>;
public record GetForeignReserveReportQuery(DateTime StartDate, DateTime EndDate) : IRequest<IReadOnlyList<ForeignReserveReportRow>>;
public record GetObligationReportQuery(DateTime? StartDate, DateTime? EndDate, string? Status, string? ClientType = null) : IRequest<IReadOnlyList<ObligationReportRow>>;
public record GetCreditMovementsReportQuery(DateTime StartDate, DateTime EndDate, string? SearchValue) : IRequest<IReadOnlyList<MovementReportRow>>;
public record GetDebitMovementsReportQuery(DateTime StartDate, DateTime EndDate, string? SearchValue) : IRequest<IReadOnlyList<MovementReportRow>>;
public record GetResourcesReportQuery(DateTime? StartDate, DateTime? EndDate) : IRequest<IReadOnlyList<ResourceSummaryReportRow>>;
public record GetCorrespondentBalanceReportQuery(string? SearchValue) : IRequest<IReadOnlyList<CorrespondentBalanceReportRow>>;

public sealed class ReportingHandler :
    IRequestHandler<GetDashboardQuery, DashboardSummary>,
    IRequestHandler<GetForeignReserveReportQuery, IReadOnlyList<ForeignReserveReportRow>>,
    IRequestHandler<GetObligationReportQuery, IReadOnlyList<ObligationReportRow>>,
    IRequestHandler<GetCreditMovementsReportQuery, IReadOnlyList<MovementReportRow>>,
    IRequestHandler<GetDebitMovementsReportQuery, IReadOnlyList<MovementReportRow>>,
    IRequestHandler<GetResourcesReportQuery, IReadOnlyList<ResourceSummaryReportRow>>,
    IRequestHandler<GetCorrespondentBalanceReportQuery, IReadOnlyList<CorrespondentBalanceReportRow>>
{
    private readonly IReportingRepository _repository;

    public ReportingHandler(IReportingRepository repository) => _repository = repository;

    public Task<DashboardSummary> Handle(GetDashboardQuery query, CancellationToken ct) =>
        _repository.GetDashboardAsync(query.AsOfDate, ct);

    public async Task<IReadOnlyList<ForeignReserveReportRow>> Handle(GetForeignReserveReportQuery query, CancellationToken ct) =>
        (await _repository.GetForeignReserveAsync(query.StartDate, query.EndDate, ct)).ToList();

    public async Task<IReadOnlyList<ObligationReportRow>> Handle(GetObligationReportQuery query, CancellationToken ct) =>
        (await _repository.GetObligationsAsync(query.StartDate, query.EndDate, query.Status, query.ClientType, ct)).ToList();

    public async Task<IReadOnlyList<MovementReportRow>> Handle(GetCreditMovementsReportQuery query, CancellationToken ct) =>
        (await _repository.GetCreditMovementsAsync(query.StartDate, query.EndDate, query.SearchValue, ct)).ToList();

    public async Task<IReadOnlyList<MovementReportRow>> Handle(GetDebitMovementsReportQuery query, CancellationToken ct) =>
        (await _repository.GetDebitMovementsAsync(query.StartDate, query.EndDate, query.SearchValue, ct)).ToList();

    public async Task<IReadOnlyList<ResourceSummaryReportRow>> Handle(GetResourcesReportQuery query, CancellationToken ct) =>
        (await _repository.GetResourcesReportAsync(query.StartDate, query.EndDate, ct)).ToList();

    public async Task<IReadOnlyList<CorrespondentBalanceReportRow>> Handle(GetCorrespondentBalanceReportQuery query, CancellationToken ct) =>
        (await _repository.GetCorrespondentBalanceReportAsync(query.SearchValue, ct)).ToList();
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
        RuleFor(x => x.ClientType).Must(t => t is null || ObligationClientTypes.IsValid(t)).WithMessage("ClientType must be Bank, Company or Other.");
    }
}

public sealed class MovementReportValidator : AbstractValidator<GetCreditMovementsReportQuery>
{
    public MovementReportValidator() => RuleFor(x => x.EndDate).GreaterThanOrEqualTo(x => x.StartDate);
}

public sealed class DebitMovementReportValidator : AbstractValidator<GetDebitMovementsReportQuery>
{
    public DebitMovementReportValidator() => RuleFor(x => x.EndDate).GreaterThanOrEqualTo(x => x.StartDate);
}
