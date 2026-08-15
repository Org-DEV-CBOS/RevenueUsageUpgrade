using FluentValidation;

namespace RevenuUsage.Application.Features.Currencies.Commands.AddExchangeRate;

public class AddExchangeRateCommandValidator : AbstractValidator<AddExchangeRateCommand>
{
    public AddExchangeRateCommandValidator()
    {
        RuleFor(x => x.RateDate)
            .NotEmpty().WithMessage("RateDate is required.");

        RuleFor(x => x.FromCurrencyId)
            .NotEmpty().WithMessage("FromCurrencyId is required.");

        RuleFor(x => x.ToCurrencyId)
            .NotEmpty().WithMessage("ToCurrencyId is required.");

        RuleFor(x => x.RateValue)
            .GreaterThan(0).WithMessage("RateValue must be greater than zero.");

        RuleFor(x => x.CreatedBy)
            .NotEmpty().WithMessage("CreatedBy is required.")
            .MaximumLength(100).WithMessage("CreatedBy cannot exceed 100 characters.");
    }
}
