using FluentValidation;

namespace RevenuUsage.Application.Features.Transfers.Commands.ConfirmTransfer;

public sealed class ConfirmTransferCommandValidator : AbstractValidator<ConfirmTransferCommand>
{
    public ConfirmTransferCommandValidator()
    {

        RuleFor(x => x.TransferId)
            .NotEmpty()
            .WithMessage("Transfer ID is required.");
    }
}
