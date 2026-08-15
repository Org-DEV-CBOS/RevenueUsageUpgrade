using FluentValidation;

namespace RevenuUsage.Application.Features.Obligations.Commands.AddObligationPayment;

public class AddObligationPaymentCommandValidator : AbstractValidator<AddObligationPaymentCommand>
{
    public AddObligationPaymentCommandValidator()
    {
        RuleFor(x => x.ObligationId)
            .NotEmpty().WithMessage("ObligationId is required.");
        RuleFor(x => x.CorrespondentAccountId).NotEmpty();

        RuleFor(x => x.PaymentDate)
            .NotEmpty().WithMessage("PaymentDate is required.");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than zero.");

        RuleFor(x => x.CreatedBy)
            .NotEmpty().WithMessage("CreatedBy is required.")
            .MaximumLength(100).WithMessage("CreatedBy cannot exceed 100 characters.");

        RuleFor(x => x.ReferenceNo)
            .MaximumLength(100).WithMessage("ReferenceNo cannot exceed 100 characters.");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes cannot exceed 500 characters.");
    }
}
