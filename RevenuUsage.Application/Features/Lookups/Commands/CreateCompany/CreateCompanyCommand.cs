using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Commands.CreateCompany;

public record CreateCompanyCommand(
    long CompanyCode,
    string? CompanyNameEn,
    string CompanyNameAr,
    string? ShortName,
    string? Notes,
    string? CreatedBy) : ICommand<Guid>;
