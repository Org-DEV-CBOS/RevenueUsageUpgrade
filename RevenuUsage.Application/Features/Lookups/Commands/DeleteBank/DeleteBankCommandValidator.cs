using FluentValidation;

namespace RevenuUsage.Application.Features.Lookups.Commands.DeleteBank;

public class DeleteBankCommandValidator : AbstractValidator<DeleteBankCommand>
{
    public DeleteBankCommandValidator()
    {
        RuleFor(x => x.BankId)
            .NotEmpty().WithMessage("Bank ID is required");
    }
}
