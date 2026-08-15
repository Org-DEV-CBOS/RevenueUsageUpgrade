using MediatR;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Transfers.Queries.GetFinalBankPosition
{
    public sealed class GetFinalBankPositionHandler
    : IRequestHandler<GetFinalBankPositionQuery, FinalBankPositionDto>
    {
        private readonly ITransferRepository _repository;

        public GetFinalBankPositionHandler(ITransferRepository repository) => _repository = repository;

        public async Task<FinalBankPositionDto> Handle(
            GetFinalBankPositionQuery request,
            CancellationToken cancellationToken)
        {
            var result = await _repository.GetFinalPositionAsync(request.PositionDate);
            if (result == null)
            {
                throw new Exception($"No data found for date {request.PositionDate:yyyy-MM-dd}");
            }

            return new FinalBankPositionDto(
                result.PositionDate,
                result.CashInHandUsd,
                result.GoldValueUsd,
                result.TotalCorrespondentBalancesUsd,
                result.BankNetPositionUsd
            );

        }
    }

}
