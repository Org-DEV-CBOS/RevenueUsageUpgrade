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

        RuleFor(x => x.Purpose)
            .NotEmpty()
            .WithMessage("Purpose is required.")
            .MaximumLength(500)
            .WithMessage("Purpose must not exceed 500 characters.");

        RuleFor(x => x.ReferenceNo)
            .NotEmpty()
            .WithMessage("Reference Number is required.")
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

        RuleFor(x => x.TransferId)
            .NotEmpty()
            .WithMessage("Transfer ID is required.");

        RuleFor(x => x.OperationTypeId)
            .NotEmpty()
            .WithMessage("Operation Type ID is required.");

        RuleFor(x => x.ResourceTypeId)
            .NotEmpty()
            .WithMessage("Resource Type ID is required.");

        RuleFor(x => x.UsageTypeId)
            .NotEmpty()
            .WithMessage("Usage Type ID is required.");

        RuleFor(x => x.BankId)
            .NotEmpty()
            .WithMessage("Bank ID is required.");
    }
}
