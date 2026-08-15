using FluentValidation;

namespace RevenuUsage.Application.Features.Lookups.Commands.UpdateCompany;

public class UpdateCompanyCommandValidator : AbstractValidator<UpdateCompanyCommand>
{
    public UpdateCompanyCommandValidator()
    {
        RuleFor(x => x.CompanyId)
            .NotEmpty().WithMessage("Company ID is required");

        RuleFor(x => x.CompanyCode)
            .GreaterThan(0).WithMessage("Company code must be greater than 0");

        RuleFor(x => x.CompanyNameAr)
            .NotEmpty().WithMessage("Company name in Arabic is required")
            .MaximumLength(200).WithMessage("Company name in Arabic cannot exceed 200 characters");

        RuleFor(x => x.CompanyNameEn)
            .MaximumLength(200).WithMessage("Company name in English cannot exceed 200 characters");

        RuleFor(x => x.ShortName)
            .MaximumLength(50).WithMessage("Short name cannot exceed 50 characters");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes cannot exceed 500 characters");
    }
}
