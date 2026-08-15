using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Commands.CreateCompany;

public class CreateCompanyCommandHandler : ICommandHandler<CreateCompanyCommand, Guid>
{
    private readonly ILookupRepository _lookupRepository;

    public CreateCompanyCommandHandler(ILookupRepository lookupRepository)
    {
        _lookupRepository = lookupRepository;
    }

    public async Task<Guid> Handle(CreateCompanyCommand request, CancellationToken cancellationToken)
    {
        var company = new Company
        {
            CompanyCode = request.CompanyCode,
            CompanyNameEn = request.CompanyNameEn,
            CompanyNameAr = request.CompanyNameAr,
            ShortName = request.ShortName,
            Notes = request.Notes,
            CreatedBy = request.CreatedBy
        };

        var companyId = await _lookupRepository.CreateCompanyAsync(company, cancellationToken);

        return companyId;
    }
}
