using FluentValidation;

namespace RevenuUsage.Application.Features.Obligations.Commands.DeleteObligationPayment;

public class DeleteObligationPaymentCommandValidator : AbstractValidator<DeleteObligationPaymentCommand>
{
    public DeleteObligationPaymentCommandValidator()
    {
        RuleFor(x => x.ObligationPaymentId)
            .NotEmpty().WithMessage("ObligationPaymentId is required.");

        RuleFor(x => x.DeletedBy)
            .NotEmpty().WithMessage("DeletedBy is required.")
            .MaximumLength(100).WithMessage("DeletedBy cannot exceed 100 characters.");
    }
}
