using MediatR;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Transfers.Queries.GetCurrencyStatement
{
    public sealed class GetCurrencyStatementHandler
    : IRequestHandler<GetCurrencyStatementQuery, List<CurrencyStatementDto>>
    {
        private readonly ITransferRepository _repository;

        public GetCurrencyStatementHandler(ITransferRepository repository)
            => _repository = repository;

        public async Task<List<CurrencyStatementDto>> Handle(
            GetCurrencyStatementQuery request,
            CancellationToken cancellationToken)
        {
            var results = await _repository.GetCurrencyStatementAsync(
                request.CurrencyId,
                request.AsOfDate);

            if (!results.Any())
                throw new KeyNotFoundException($"No accounts found for Currency ID {request.CurrencyId}");

            return results.Select(m => new CurrencyStatementDto(
                m.CorrespondentAccountId,
                m.AccountNumber,
                m.AccountName,
                m.CurrentBalance,
                m.TotalResources,
                m.TotalCoverageIn,
                m.TotalCoverageOut,
                m.TotalConfirmedTransfers,
                m.NetBalance
            )).ToList();
        }
    }

}
