using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Queries.GetBankById;

public class GetBankByIdQueryHandler : IQueryHandler<GetBankByIdQuery, BankDto?>
{
    private readonly ILookupRepository _lookupRepository;

    public GetBankByIdQueryHandler(ILookupRepository lookupRepository)
    {
        _lookupRepository = lookupRepository;
    }

    public async Task<BankDto?> Handle(GetBankByIdQuery request, CancellationToken cancellationToken)
    {
        var bank = await _lookupRepository.GetBankByIdAsync(request.BankId, cancellationToken);

        if (bank == null)
            return null;

        return new BankDto
        {
            BankId = bank.BankId,
            BankCode = bank.BankCode,
            BankNameEn = bank.BankNameEn,
            BankNameAr = bank.BankNameAr,
            ShortName = bank.ShortName,
            IsActive = bank.IsActive
        };
    }
}
