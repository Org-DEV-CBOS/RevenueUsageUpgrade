using MediatR;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.Transfers.Queries.GetTransfers;

public sealed record GetTransfersQuery(
    Guid? CorrespondentAccountId,
    Guid? BeneficiaryId,
    Guid? CurrencyId,
    string? Status,
    DateTime? StartDate,
    DateTime? EndDate,
    int Page = 1,
    int PageSize = 25,
    int PageNumber = 0) : IRequest<PagedResponse<TransferListItemDto>>
{
    public int ResolvedPage => PageNumber > 0 ? PageNumber : Page;
}
