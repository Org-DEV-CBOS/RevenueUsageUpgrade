using FluentValidation;

namespace RevenuUsage.Application.Features.Currencies.Queries.GetExchangeRate;

public class GetExchangeRateQueryValidator : AbstractValidator<GetExchangeRateQuery>
{
    public GetExchangeRateQueryValidator()
    {
        // All parameters are optional, no validation required
    }
}
