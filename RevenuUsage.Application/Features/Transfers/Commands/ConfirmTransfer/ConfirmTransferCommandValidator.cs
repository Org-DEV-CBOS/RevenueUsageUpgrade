using FluentValidation;

namespace RevenuUsage.Application.Features.Transfers.Commands.ConfirmTransfer;

public sealed class ConfirmTransferCommandValidator : AbstractValidator<ConfirmTransferCommand>
{
    public ConfirmTransferCommandValidator()
    {

        RuleFor(x => x.TransferId)
            .NotEmpty()
            .WithMessage("Transfer ID is required.");

        // Not required here: the transfer may already carry them from creation, so
        // uspConfirmTransfer decides whether the combined values are complete.
        RuleFor(x => x.ReferenceNo)
            .MaximumLength(100)
            .WithMessage("Reference Number must not exceed 100 characters.");
    }
}
