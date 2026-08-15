using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Beneficiaries.Queries.GetBeneficiaryStatement;

public sealed class GetBeneficiaryStatementQueryHandler : IQueryHandler<GetBeneficiaryStatementQuery, IEnumerable<BeneficiaryStatementDto>>
{
    private readonly IBeneficiaryRepository _repository;

    public GetBeneficiaryStatementQueryHandler(IBeneficiaryRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<BeneficiaryStatementDto>> Handle(GetBeneficiaryStatementQuery request, CancellationToken cancellationToken)
    {
        var statements = await _repository.GetBeneficiaryStatementAsync(
            request.BeneficiaryId,
            request.StartDate,
            request.EndDate,
            cancellationToken);

        return statements.Select(s => new BeneficiaryStatementDto(
            s.TransferId,
            s.TransferDate,
            s.AccountNumber,
            s.AccountName,
            s.Amount,
            s.TransferStatus,
            s.ReferenceNo,
            s.Purpose,
            s.ConfirmedTime,
            s.RejectedTime,
            s.RejectReason));
    }
}
