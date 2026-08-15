using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.Resources.Queries.GetResourceStatement;

public sealed record GetResourceStatementQuery(
    Guid CorrespondentAccountId,
    DateTime? StartDate,
    DateTime? EndDate) : IQuery<IEnumerable<ResourceStatementDto>>;
