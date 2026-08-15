using FluentValidation;

namespace RevenuUsage.Application.Features.RevenueUsages.Queries.GetRevenueUsageById;

public sealed class GetRevenueUsageByIdQueryValidator : AbstractValidator<GetRevenueUsageByIdQuery>
{
    public GetRevenueUsageByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("ID is required.");
    }
}
