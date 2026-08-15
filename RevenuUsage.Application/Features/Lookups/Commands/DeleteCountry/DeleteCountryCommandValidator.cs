using FluentValidation;

namespace RevenuUsage.Application.Features.Lookups.Commands.DeleteCountry;

public class DeleteCountryCommandValidator : AbstractValidator<DeleteCountryCommand>
{
    public DeleteCountryCommandValidator()
    {
        RuleFor(x => x.CountryId)
            .NotEmpty().WithMessage("Country ID is required");
    }
}
