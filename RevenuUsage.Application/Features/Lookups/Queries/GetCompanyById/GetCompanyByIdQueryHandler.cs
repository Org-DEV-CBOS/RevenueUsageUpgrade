using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Queries.GetCompanyById;

public class GetCompanyByIdQueryHandler : IQueryHandler<GetCompanyByIdQuery, CompanyDto?>
{
    private readonly ILookupRepository _lookupRepository;

    public GetCompanyByIdQueryHandler(ILookupRepository lookupRepository)
    {
        _lookupRepository = lookupRepository;
    }

    public async Task<CompanyDto?> Handle(GetCompanyByIdQuery request, CancellationToken cancellationToken)
    {
        var company = await _lookupRepository.GetCompanyByIdAsync(request.CompanyId, cancellationToken);

        if (company == null)
            return null;

        return new CompanyDto
        {
            CompanyId = company.CompanyId,
            CompanyCode = company.CompanyCode,
            CompanyNameEn = company.CompanyNameEn,
            CompanyNameAr = company.CompanyNameAr,
            ShortName = company.ShortName,
            Notes = company.Notes,
            IsActive = company.IsActive
        };
    }
}
