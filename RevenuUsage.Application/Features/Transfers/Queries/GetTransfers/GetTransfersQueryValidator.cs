using FluentValidation;

namespace RevenuUsage.Application.Features.Transfers.Queries.GetTransfers;

public sealed class GetTransfersQueryValidator : AbstractValidator<GetTransfersQuery>
{
    private static readonly string[] AllowedStatuses = ["Pending", "Confirmed", "Rejected"];

    public GetTransfersQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThan(0);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 200);
        RuleFor(x => x.StartDate)
            .LessThanOrEqualTo(x => x.EndDate)
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue);
        RuleFor(x => x.Status)
            .Must(status => status is null || AllowedStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            .WithMessage("Status must be Pending, Confirmed, or Rejected.");
    }
}
