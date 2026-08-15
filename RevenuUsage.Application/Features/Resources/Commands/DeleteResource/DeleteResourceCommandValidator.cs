using FluentValidation;

namespace RevenuUsage.Application.Features.Resources.Commands.DeleteResource;

public sealed class DeleteResourceCommandValidator : AbstractValidator<DeleteResourceCommand>
{
    public DeleteResourceCommandValidator()
    {
        RuleFor(x => x.ResourceId)
            .NotEmpty()
            .WithMessage("Resource ID is required.");

        RuleFor(x => x.DeletedBy)
            .NotEmpty()
            .WithMessage("Deleted By is required.")
            .MaximumLength(100)
            .WithMessage("Deleted By must not exceed 100 characters.");
    }
}
