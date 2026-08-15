using FluentValidation;

namespace RevenuUsage.Application.Features.Lookups.Commands.UpdateCountry;

public class UpdateCountryCommandValidator : AbstractValidator<UpdateCountryCommand>
{
    public UpdateCountryCommandValidator()
    {
        RuleFor(x => x.CountryId)
            .NotEmpty().WithMessage("Country ID is required");

        RuleFor(x => x.CountryCode)
            .GreaterThan(0).WithMessage("Country code must be greater than 0");

        RuleFor(x => x.CountryNameEn)
            .NotEmpty().WithMessage("Country name in English is required")
            .MaximumLength(200).WithMessage("Country name in English cannot exceed 200 characters");

        RuleFor(x => x.CountryNameAr)
            .NotEmpty().WithMessage("Country name in Arabic is required")
            .MaximumLength(200).WithMessage("Country name in Arabic cannot exceed 200 characters");

        RuleFor(x => x.IsoCode)
            .MaximumLength(10).WithMessage("ISO code cannot exceed 10 characters");
    }
}
