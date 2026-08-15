using FluentValidation;

namespace RevenuUsage.Application.Features.Resources.Queries.GetResourceStatement;

public sealed class GetResourceStatementQueryValidator : AbstractValidator<GetResourceStatementQuery>
{
    public GetResourceStatementQueryValidator()
    {
        RuleFor(x => x.CorrespondentAccountId)
            .NotEmpty()
            .WithMessage("Correspondent Account ID is required.");

        RuleFor(x => x.StartDate)
            .LessThanOrEqualTo(x => x.EndDate)
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue)
            .WithMessage("Start Date must be less than or equal to End Date.");

        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(x => x.StartDate)
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue)
            .WithMessage("End Date must be greater than or equal to Start Date.");
    }
}
