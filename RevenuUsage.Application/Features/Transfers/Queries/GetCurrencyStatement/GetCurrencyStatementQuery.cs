using MediatR;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.Transfers.Queries.GetCurrencyStatement
{
    public sealed record GetCurrencyStatementQuery(Guid CurrencyId, DateTime AsOfDate)
    : IRequest<List<CurrencyStatementDto>>;

}
