using FluentValidation;

namespace RevenuUsage.Application.Features.Transfers.Commands.ConfirmTransfer;

public sealed class DeleteTransferCommandValidator : AbstractValidator<DeleteTransferCommand>
{
    public DeleteTransferCommandValidator()
    {

        RuleFor(x => x.TransferId)
            .NotEmpty()
            .WithMessage("Transfer ID is required.");
    }
}
