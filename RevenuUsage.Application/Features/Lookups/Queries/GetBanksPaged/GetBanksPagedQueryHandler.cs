using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Queries.GetBanksPaged;

public sealed class GetBanksPagedQueryHandler : IQueryHandler<GetBanksPagedQuery, PagedResponse<BankDto>>
{
    private readonly ILookupRepository _lookupRepository;

    public GetBanksPagedQueryHandler(ILookupRepository lookupRepository)
    {
        _lookupRepository = lookupRepository;
    }

    public async Task<PagedResponse<BankDto>> Handle(GetBanksPagedQuery request, CancellationToken cancellationToken)
    {
        var (banks, totalCount) = await _lookupRepository.GetBanksPagedAsync(
            request.Search,
            request.Page,
            request.PageSize,
            cancellationToken);

        var items = banks.Select(b => new BankDto
        {
            BankId = b.BankId,
            BankCode = b.BankCode,
            BankNameEn = b.BankNameEn,
            BankNameAr = b.BankNameAr,
            ShortName = b.ShortName,
            IsActive = b.IsActive
        }).ToList();

        return new PagedResponse<BankDto>(items, request.Page, request.PageSize, totalCount);
    }
}
