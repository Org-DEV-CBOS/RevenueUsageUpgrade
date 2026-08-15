using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Queries.GetAllCompanies;

public class GetAllCompaniesQueryHandler : IQueryHandler<GetAllCompaniesQuery, IEnumerable<CompanyDto>>
{
    private readonly ILookupRepository _lookupRepository;

    public GetAllCompaniesQueryHandler(ILookupRepository lookupRepository)
    {
        _lookupRepository = lookupRepository;
    }

    public async Task<IEnumerable<CompanyDto>> Handle(GetAllCompaniesQuery request, CancellationToken cancellationToken)
    {
        var companies = await _lookupRepository.GetAllCompaniesAsync(cancellationToken);

        return companies.Select(c => new CompanyDto
        {
            CompanyId = c.CompanyId,
            CompanyCode = c.CompanyCode,
            CompanyNameEn = c.CompanyNameEn,
            CompanyNameAr = c.CompanyNameAr,
            ShortName = c.ShortName,
            Notes = c.Notes,
            IsActive = c.IsActive
        });
    }
}
