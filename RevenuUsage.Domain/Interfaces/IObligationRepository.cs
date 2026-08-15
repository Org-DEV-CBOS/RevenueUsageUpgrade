using RevenuUsage.Domain.Entities;

namespace RevenuUsage.Domain.Interfaces;

public interface IObligationRepository
{
    Task<IEnumerable<Obligation>> GetObligationsAsync(bool activeOnly, CancellationToken cancellationToken = default);
    Task<Guid> CreateObligationAsync(Obligation item, string createdBy, CancellationToken cancellationToken = default);
    Task DeleteObligationAsync(Guid obligationId, string deletedBy, CancellationToken cancellationToken = default);
    Task AddObligationPayment(Guid obligationId, Guid correspondentAccountId, DateTime paymentDate, decimal amount, string referenceNo, string notes, string createdBy, CancellationToken cancellationToken = default);
    Task DeleteObligationPayment(Guid obligationPaymentId, string deletedBy, CancellationToken cancellationToken = default);
    Task<ObligationStatement> GetObligationStatementAsync(Guid obligationId, CancellationToken cancellationToken = default);
}
