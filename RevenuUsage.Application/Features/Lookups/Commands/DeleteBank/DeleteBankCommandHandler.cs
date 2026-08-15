using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Commands.DeleteBank;

public class DeleteBankCommandHandler : ICommandHandler<DeleteBankCommand>
{
    private readonly ILookupRepository _lookupRepository;

    public DeleteBankCommandHandler(ILookupRepository lookupRepository)
    {
        _lookupRepository = lookupRepository;
    }

    public async Task Handle(DeleteBankCommand request, CancellationToken cancellationToken)
    {
        await _lookupRepository.DeleteBankAsync(request.BankId, request.DeletedBy ?? "system", cancellationToken);
    }
}
