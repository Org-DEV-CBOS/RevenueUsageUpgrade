using RevenuUsage.Domain.Entities;

namespace RevenuUsage.Domain.Interfaces;

public interface ICorrespondentRepository
{
    Task<IReadOnlyList<Correspondent>> GetCorrespondentsAsync(bool activeOnly, CancellationToken cancellationToken);
    Task<Correspondent?> GetCorrespondentAsync(Guid id, CancellationToken cancellationToken);
    Task<Guid> CreateCorrespondentAsync(Correspondent correspondent, string? createdBy, CancellationToken cancellationToken);
    Task UpdateCorrespondentAsync(Correspondent correspondent, string? modifiedBy, CancellationToken cancellationToken);
    Task DeleteCorrespondentAsync(Guid id, string? deletedBy, CancellationToken cancellationToken);

    Task<IReadOnlyList<CorrespondentAccount>> GetAccountsAsync(
        Guid? correspondentId, Guid? currencyId, bool activeOnly, CancellationToken cancellationToken);
    Task<CorrespondentAccount?> GetAccountAsync(Guid id, CancellationToken cancellationToken);
    Task<Guid> CreateAccountAsync(CorrespondentAccount account, string? createdBy, CancellationToken cancellationToken);
    Task UpdateAccountAsync(CorrespondentAccount account, string? modifiedBy, CancellationToken cancellationToken);
    Task DeleteAccountAsync(Guid id, string? deletedBy, CancellationToken cancellationToken);
}
