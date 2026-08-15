using FluentValidation;

namespace RevenuUsage.Application.Features.Currencies.Queries.GetCurrencyBalances;

public class GetCurrencyBalancesQueryValidator : AbstractValidator<GetCurrencyBalancesQuery>
{
    public GetCurrencyBalancesQueryValidator()
    {
        // No validation needed for this query as it has no parameters
    }
}
