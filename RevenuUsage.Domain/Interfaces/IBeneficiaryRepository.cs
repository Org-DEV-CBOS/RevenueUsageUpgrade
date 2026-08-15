using RevenuUsage.Domain.Entities;

namespace RevenuUsage.Domain.Interfaces;

public interface IBeneficiaryRepository
{
    Task<IEnumerable<Beneficiary>> GetBeneficiariesAsync(bool activeOnly, CancellationToken cancellationToken = default);
    Task<Beneficiary?> GetBeneficiaryAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Guid> CreateBeneficiaryAsync(Beneficiary item, string? actor, CancellationToken cancellationToken = default);
    Task UpdateBeneficiaryAsync(Beneficiary item, string? actor, CancellationToken cancellationToken = default);
    Task DeleteBeneficiaryAsync(Guid id, string? actor, CancellationToken cancellationToken = default);
    Task<IEnumerable<BeneficiaryStatement>> GetBeneficiaryStatementAsync(
        Guid beneficiaryId,
        DateTime? startDate,
        DateTime? endDate,
        CancellationToken cancellationToken = default);
}
