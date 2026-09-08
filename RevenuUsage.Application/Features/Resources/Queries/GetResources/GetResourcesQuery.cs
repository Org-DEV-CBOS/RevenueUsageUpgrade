using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Domain.Entities;

namespace RevenuUsage.Application.Features.Resources.Queries.GetResources;

public sealed record GetResourcesQuery(
    Guid? CorrespondentAccountId,
    Guid? ResourceTypeId,
    DateTime? StartDate,
    DateTime? EndDate) : IQuery<IEnumerable<ResourceListItem>>;
