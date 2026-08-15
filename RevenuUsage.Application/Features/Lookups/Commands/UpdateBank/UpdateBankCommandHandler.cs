using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Commands.UpdateBank;

public class UpdateBankCommandHandler : ICommandHandler<UpdateBankCommand>
{
    private readonly ILookupRepository _lookupRepository;

    public UpdateBankCommandHandler(ILookupRepository lookupRepository)
    {
        _lookupRepository = lookupRepository;
    }

    public async Task Handle(UpdateBankCommand request, CancellationToken cancellationToken)
    {
        var bank = new Bank
        {
            BankId = request.BankId,
            BankCode = request.BankCode,
            BankNameEn = request.BankNameEn,
            BankNameAr = request.BankNameAr,
            ShortName = request.ShortName,
            IsActive = request.IsActive,
            ModifiedBy = request.ModifiedBy
        };

        await _lookupRepository.UpdateBankAsync(bank, cancellationToken);
    }
}
