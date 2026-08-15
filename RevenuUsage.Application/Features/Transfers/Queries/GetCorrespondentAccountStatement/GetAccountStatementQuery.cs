using MediatR;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.Transfers.Queries.GetCorrespondentAccountStatement
{
    public class GetAccountStatementQuery : IRequest<List<AccountStatementDto>>
    {
        public Guid CorrespondentAccountId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

}
