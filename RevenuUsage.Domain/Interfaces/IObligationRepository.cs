using RevenuUsage.Domain.Entities;

namespace RevenuUsage.Domain.Interfaces;

public interface IObligationRepository
{
    Task<IEnumerable<Obligation>> GetObligationsAsync(bool activeOnly, Guid? clientTypeId = null, CancellationToken cancellationToken = default);
    Task<Guid> CreateObligationAsync(Obligation item, string createdBy, CancellationToken cancellationToken = default);
    Task DeleteObligationAsync(Guid obligationId, string deletedBy, CancellationToken cancellationToken = default);
    Task AddObligationPayment(Guid obligationId, Guid correspondentAccountId, DateTime paymentDate, decimal amount, string referenceNo, string notes, string createdBy, CancellationToken cancellationToken = default);
    Task DeleteObligationPayment(Guid obligationPaymentId, string deletedBy, CancellationToken cancellationToken = default);
    Task<ObligationStatement> GetObligationStatementAsync(Guid obligationId, CancellationToken cancellationToken = default);

    /* Client types are renamed and deactivated, never added or removed. */
    Task<IEnumerable<ClientType>> GetClientTypesAsync(bool activeOnly, CancellationToken cancellationToken = default);
    Task UpdateClientTypeAsync(ClientType item, string? actor, CancellationToken cancellationToken = default);

    Task<IEnumerable<ObligationType>> GetObligationTypesAsync(bool activeOnly, CancellationToken cancellationToken = default);
    Task<Guid> CreateObligationTypeAsync(ObligationType item, string? actor, CancellationToken cancellationToken = default);
    Task UpdateObligationTypeAsync(ObligationType item, string? actor, CancellationToken cancellationToken = default);
    Task DeleteObligationTypeAsync(Guid id, string? actor, CancellationToken cancellationToken = default);
}
