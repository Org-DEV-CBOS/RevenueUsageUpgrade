using FluentValidation;

namespace RevenuUsage.Application.Features.Currencies.Queries.GetCorrespondentBalancesByCurrency;

public class GetCorrespondentBalancesByCurrencyQueryValidator : AbstractValidator<GetCorrespondentBalancesByCurrencyQuery>
{
    public GetCorrespondentBalancesByCurrencyQueryValidator()
    {
        // No parameters, no validation required
    }
}
