using FluentValidation;

namespace RevenuUsage.Application.Features.Transfers.Queries.GetFinalBankPosition
{
    public class GetFinalBankPositionValidator : AbstractValidator<GetFinalBankPositionQuery>
    {
        public GetFinalBankPositionValidator()
        {
            RuleFor(x => x.PositionDate)
                .NotEmpty()
                .LessThanOrEqualTo(DateTime.Today)
                .WithMessage("Position date cannot be in the future.");
        }
    }

}
