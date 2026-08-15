using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Commands.UpdateCompany;

public class UpdateCompanyCommandHandler : ICommandHandler<UpdateCompanyCommand>
{
    private readonly ILookupRepository _lookupRepository;

    public UpdateCompanyCommandHandler(ILookupRepository lookupRepository)
    {
        _lookupRepository = lookupRepository;
    }

    public async Task Handle(UpdateCompanyCommand request, CancellationToken cancellationToken)
    {
        var company = new Company
        {
            CompanyId = request.CompanyId,
            CompanyCode = request.CompanyCode,
            CompanyNameEn = request.CompanyNameEn,
            CompanyNameAr = request.CompanyNameAr,
            ShortName = request.ShortName,
            Notes = request.Notes,
            IsActive = request.IsActive,
            ModifiedBy = request.ModifiedBy
        };

        await _lookupRepository.UpdateCompanyAsync(company, cancellationToken);
    }
}
