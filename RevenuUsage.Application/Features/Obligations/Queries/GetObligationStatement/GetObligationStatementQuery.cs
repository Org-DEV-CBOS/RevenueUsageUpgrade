using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.Obligations.Queries.GetObligationStatement;

public sealed record GetObligationStatementQuery(Guid ObligationId) : IQuery<ObligationStatementDto>;
