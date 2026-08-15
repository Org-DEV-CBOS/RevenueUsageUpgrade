using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Commands.CreateBank;

public class CreateBankCommandHandler : ICommandHandler<CreateBankCommand, Guid>
{
    private readonly ILookupRepository _lookupRepository;

    public CreateBankCommandHandler(ILookupRepository lookupRepository)
    {
        _lookupRepository = lookupRepository;
    }

    public async Task<Guid> Handle(CreateBankCommand request, CancellationToken cancellationToken)
    {
        var bank = new Bank
        {
            BankCode = request.BankCode,
            BankNameEn = request.BankNameEn,
            BankNameAr = request.BankNameAr,
            ShortName = request.ShortName,
            CreatedBy = request.CreatedBy
        };

        var bankId = await _lookupRepository.CreateBankAsync(bank, cancellationToken);

        return bankId;
    }
}
