using FluentValidation;

namespace RevenuUsage.Application.Features.Currencies.Commands.DeleteExchangeRate;

public class DeleteExchangeRateCommandValidator : AbstractValidator<DeleteExchangeRateCommand>
{
    public DeleteExchangeRateCommandValidator()
    {
        RuleFor(x => x.ExchangeRateId)
            .NotEmpty().WithMessage("ExchangeRateId is required.");

        RuleFor(x => x.DeletedBy)
            .NotEmpty().WithMessage("DeletedBy is required.")
            .MaximumLength(100).WithMessage("DeletedBy cannot exceed 100 characters.");
    }
}
