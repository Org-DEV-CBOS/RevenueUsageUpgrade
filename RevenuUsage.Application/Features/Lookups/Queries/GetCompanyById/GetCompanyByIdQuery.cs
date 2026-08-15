using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.Lookups.Queries.GetCompanyById;

public record GetCompanyByIdQuery(Guid CompanyId) : IQuery<CompanyDto?>;
