using RevenuUsage.Domain.Entities;namespace RevenuUsage.Domain.Interfaces;
public interface IReserveRepository { Task<IEnumerable<ReserveSnapshot>> GetAsync(DateTime? from,DateTime? to,CancellationToken ct=default);Task<Guid>CreateAsync(ReserveSnapshot item,string actor,CancellationToken ct=default);Task DeleteAsync(Guid id,string actor,CancellationToken ct=default);}
