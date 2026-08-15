using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Commands.DeleteCompany;

public record DeleteCompanyCommand(Guid CompanyId, string? DeletedBy) : ICommand;
