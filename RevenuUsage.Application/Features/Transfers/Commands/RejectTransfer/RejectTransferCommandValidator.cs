using FluentValidation;

namespace RevenuUsage.Application.Features.Transfers.Commands.ConfirmTransfer;

public sealed class RejectTransferCommandValidator : AbstractValidator<RejectTransferCommand>
{
    public RejectTransferCommandValidator()
    {

        RuleFor(x => x.TransferId)
            .NotEmpty()
            .WithMessage("Transfer ID is required.");
    }
}
