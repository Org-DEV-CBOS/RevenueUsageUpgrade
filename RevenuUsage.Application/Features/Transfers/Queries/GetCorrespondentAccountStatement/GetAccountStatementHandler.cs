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
                x.IsOpening,
                x.EventDate,
                // The database stamps these in UTC. Tagging the kind is what makes the
                // serialized value carry an offset, so the browser can show local time.
                x.EventTime is { } eventTime
                    ? DateTime.SpecifyKind(eventTime, DateTimeKind.Utc)
                    : (DateTime?)null,
                x.EventType,
                x.AmountIn,
                x.AmountOut,
                x.RunningBalance,
                x.Notes
            )).ToList();

        }
    }

}
