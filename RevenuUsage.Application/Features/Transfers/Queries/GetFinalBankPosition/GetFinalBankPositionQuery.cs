using MediatR;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.Transfers.Queries.GetFinalBankPosition
{
    public sealed record GetFinalBankPositionQuery(DateTime PositionDate)
    : IRequest<FinalBankPositionDto>;

}
