using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Commands.UpdateCompany;

public record UpdateCompanyCommand(
    Guid CompanyId,
    long CompanyCode,
    string? CompanyNameEn,
    string CompanyNameAr,
    string? ShortName,
    string? Notes,
    bool IsActive,
    string? ModifiedBy) : ICommand;
