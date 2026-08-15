using FluentValidation;

namespace RevenuUsage.Application.Features.RevenueUsages.Commands.RecordRevenueUsage;

public sealed class RecordRevenueUsageCommandValidator : AbstractValidator<RecordRevenueUsageCommand>
{
    public RecordRevenueUsageCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("ID is required.");

        RuleFor(x => x.CustomerId)
            .NotEmpty()
            .WithMessage("Customer ID is required.");

        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("Amount must be greater than zero.");

        RuleFor(x => x.RecordedAt)
            .NotEmpty()
            .WithMessage("Recorded At is required.")
            .LessThanOrEqualTo(DateTime.UtcNow)
            .WithMessage("Recorded At cannot be in the future.");

        RuleFor(x => x.Notes)
            .MaximumLength(1000)
            .WithMessage("Notes must not exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Notes));
    }
}
