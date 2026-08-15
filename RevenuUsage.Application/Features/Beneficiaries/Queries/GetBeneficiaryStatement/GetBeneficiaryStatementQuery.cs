using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.Beneficiaries.Queries.GetBeneficiaryStatement;

public sealed record GetBeneficiaryStatementQuery(
    Guid BeneficiaryId,
    DateTime? StartDate,
    DateTime? EndDate) : IQuery<IEnumerable<BeneficiaryStatementDto>>;
