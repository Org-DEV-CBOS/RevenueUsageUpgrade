using MediatR;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Transfers.Queries.GetTransfers;

public sealed class GetTransfersQueryHandler
    : IRequestHandler<GetTransfersQuery, PagedResponse<TransferListItemDto>>
{
    private readonly ITransferRepository _repository;

    public GetTransfersQueryHandler(ITransferRepository repository) => _repository = repository;

    public async Task<PagedResponse<TransferListItemDto>> Handle(
        GetTransfersQuery request,
        CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _repository.GetTransfersAsync(
            request.CorrespondentAccountId,
            request.BeneficiaryId,
            request.CurrencyId,
            request.Status,
            request.StartDate,
            request.EndDate,
            request.Page,
            request.PageSize,
            cancellationToken);

        var rows = items.Select(x => new TransferListItemDto(
            x.TransferId,
            x.TransferDate,
            x.CorrespondentAccountId,
            x.AccountNumber,
            x.AccountName,
            x.BeneficiaryId,
            x.BeneficiaryName,
            x.CurrencyId,
            x.CurrencyCode,
            x.Amount,
            x.Purpose,
            x.ReferenceNo,
            x.TransferStatus,
            x.ConfirmedTime,
            x.RejectedTime,
            x.RejectReason)).ToList();

        return new PagedResponse<TransferListItemDto>(rows, request.Page, request.PageSize, totalCount);
    }
}
