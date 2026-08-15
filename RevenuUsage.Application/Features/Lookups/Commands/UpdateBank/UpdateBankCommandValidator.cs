using FluentValidation;

namespace RevenuUsage.Application.Features.Lookups.Commands.UpdateBank;

public class UpdateBankCommandValidator : AbstractValidator<UpdateBankCommand>
{
    public UpdateBankCommandValidator()
    {
        RuleFor(x => x.BankId)
            .NotEmpty().WithMessage("Bank ID is required");

        RuleFor(x => x.BankCode)
            .GreaterThan(0).WithMessage("Bank code must be greater than 0");

        RuleFor(x => x.BankNameAr)
            .NotEmpty().WithMessage("Bank name in Arabic is required")
            .MaximumLength(200).WithMessage("Bank name in Arabic cannot exceed 200 characters");

        RuleFor(x => x.BankNameEn)
            .MaximumLength(200).WithMessage("Bank name in English cannot exceed 200 characters");

        RuleFor(x => x.ShortName)
            .MaximumLength(50).WithMessage("Short name cannot exceed 50 characters");
    }
}
