using FluentValidation;

namespace RevenuUsage.Application.Features.Transfers.Commands.CreateTransfer;

public sealed class CreateTransferCommandValidator : AbstractValidator<CreateTransferCommand>
{
    public CreateTransferCommandValidator()
    {
        RuleFor(x => x.CorrespondentAccountId)
            .NotEmpty()
            .WithMessage("Correspondent Account ID is required.");

        RuleFor(x => x.BeneficiaryId)
            .NotEmpty()
            .WithMessage("Beneficiary ID is required.");

        // Purpose, ReferenceNo and StatementDate are optional on a Pending transfer.
        // uspConfirmTransfer rejects a confirmation that still has no reference or
        // statement date.
        RuleFor(x => x.Purpose)
            .MaximumLength(500)
            .WithMessage("Purpose must not exceed 500 characters.");

        RuleFor(x => x.ReferenceNo)
            .MaximumLength(100)
            .WithMessage("Reference Number must not exceed 100 characters.");

        RuleFor(x => x.CreatedBy)
            .NotEmpty()
            .WithMessage("Created By is required.");

        RuleFor(x => x.TransferDate)
            .NotEmpty()
            .WithMessage("Transfer Date is required.")
            .LessThanOrEqualTo(DateTime.UtcNow)
            .WithMessage("Transfer Date cannot be in the future.");

        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("Amount must be greater than zero.");
    }
}
