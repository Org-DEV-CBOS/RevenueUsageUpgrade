using FluentValidation;

namespace RevenuUsage.Application.Features.Transfers.Queries.GetCurrencyStatement
{
    public class GetCurrencyStatementValidator : AbstractValidator<GetCurrencyStatementQuery>
    {
        public GetCurrencyStatementValidator()
        {
            RuleFor(x => x.CurrencyId).NotEmpty();
            RuleFor(x => x.AsOfDate).NotEmpty().LessThanOrEqualTo(DateTime.Today);
        }
    }

}
