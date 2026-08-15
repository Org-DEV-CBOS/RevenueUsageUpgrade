using FluentValidation;

namespace RevenuUsage.Application.Features.Obligations.Queries.GetObligationStatement;

public class GetObligationStatementQueryValidator : AbstractValidator<GetObligationStatementQuery>
{
    public GetObligationStatementQueryValidator()
    {
        RuleFor(x => x.ObligationId)
            .NotEmpty().WithMessage("ObligationId is required.");
    }
}
