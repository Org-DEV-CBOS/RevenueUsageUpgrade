using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.Lookups.Queries.GetAllCompanies;

public record GetAllCompaniesQuery : IQuery<IEnumerable<CompanyDto>>;
