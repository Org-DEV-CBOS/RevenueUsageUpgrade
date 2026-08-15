using FluentValidation;

namespace RevenuUsage.Application.Features.Resources.Commands.AddResourceToCorrespondentAccount;

public sealed class AddResourceToCorrespondentAccountCommandValidator 
    : AbstractValidator<AddResourceToCorrespondentAccountCommand>
{
    public AddResourceToCorrespondentAccountCommandValidator()
    {
        RuleFor(x => x.ResourceDate)
            .NotEmpty()
            .WithMessage("Resource date is required.");

        RuleFor(x => x.CorrespondentAccountId)
            .NotEmpty()
            .WithMessage("Correspondent Account ID is required.");

        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("Amount must be greater than zero.");

        RuleFor(x => x.ResourceTypeId)
            .NotEmpty()
            .WithMessage("Resource Type ID is required.");

        RuleFor(x => x.Notes)
            .MaximumLength(300)
            .WithMessage("Notes must not exceed 300 characters.")
            .When(x => !string.IsNullOrEmpty(x.Notes));

        RuleFor(x => x.CreatedBy)
            .NotEmpty()
            .WithMessage("Created By is required.")
            .MaximumLength(100)
            .WithMessage("Created By must not exceed 100 characters.");
    }
}
