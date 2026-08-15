using MediatR;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Transfers.Queries.GetCorrespondentAccountStatement
{
    public class GetAccountStatementHandler : IRequestHandler<GetAccountStatementQuery, List<AccountStatementDto>>
    {
        private readonly ITransferRepository _repository;

        public GetAccountStatementHandler(ITransferRepository repository) => _repository = repository;

        public async Task<List<AccountStatementDto>> Handle(GetAccountStatementQuery request, CancellationToken cancellationToken)
        {
            var results = await _repository.GetStatementAsync(
                request.CorrespondentAccountId,
                request.StartDate,
                request.EndDate);

            return results.Select(x => new AccountStatementDto(
                x.EventDate,
                x.EventType,
                x.AmountIn,
                x.AmountOut,
                x.RunningBalance,
                x.Notes
            )).ToList();

        }
    }

}
