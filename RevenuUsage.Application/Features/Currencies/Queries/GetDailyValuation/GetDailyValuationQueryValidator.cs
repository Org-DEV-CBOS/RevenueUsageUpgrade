using FluentValidation;

namespace RevenuUsage.Application.Features.Currencies.Queries.GetDailyValuation;

public class GetDailyValuationQueryValidator : AbstractValidator<GetDailyValuationQuery>
{
    public GetDailyValuationQueryValidator()
    {
        // ValuationDate is optional, so no validation required
    }
}
