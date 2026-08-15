using FluentValidation;

namespace RevenuUsage.Application.Features.Beneficiaries.Queries.GetBeneficiaryStatement;

public class GetBeneficiaryStatementQueryValidator : AbstractValidator<GetBeneficiaryStatementQuery>
{
    public GetBeneficiaryStatementQueryValidator()
    {
        RuleFor(x => x.BeneficiaryId)
            .NotEmpty().WithMessage("BeneficiaryId is required.");

        RuleFor(x => x.StartDate)
            .LessThanOrEqualTo(x => x.EndDate)
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue)
            .WithMessage("StartDate must be less than or equal to EndDate.");
    }
}
