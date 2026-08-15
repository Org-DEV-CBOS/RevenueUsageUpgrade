using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Queries.GetAllBanks;

public class GetAllBanksQueryHandler : IQueryHandler<GetAllBanksQuery, IEnumerable<BankDto>>
{
    private readonly ILookupRepository _lookupRepository;

    public GetAllBanksQueryHandler(ILookupRepository lookupRepository)
    {
        _lookupRepository = lookupRepository;
    }

    public async Task<IEnumerable<BankDto>> Handle(GetAllBanksQuery request, CancellationToken cancellationToken)
    {
        var banks = await _lookupRepository.GetAllBanksAsync(cancellationToken);

        return banks.Select(b => new BankDto
        {
            BankId = b.BankId,
            BankCode = b.BankCode,
            BankNameEn = b.BankNameEn,
            BankNameAr = b.BankNameAr,
            ShortName = b.ShortName,
            IsActive = b.IsActive
        });
    }
}
