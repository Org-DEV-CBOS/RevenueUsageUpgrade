using RevenuUsage.Domain.Entities;

namespace RevenuUsage.Domain.Interfaces
{
    public interface ITransferRepository
    {
        Task CreateTransfer(Transfer createTransfer, CancellationToken cancellationToken = default);
        Task ConfirmTransfer(Transfer confirmTransfer, CancellationToken cancellationToken = default);
        Task RejectTransfer(Transfer rejectTransfer, CancellationToken cancellationToken = default);
        Task DeleteTransfer(Transfer DeleteTransfer, CancellationToken cancellationToken = default);
        Task<List<AccountStatement>> GetStatementAsync(Guid accountId, DateTime? start, DateTime? end);
        Task<FinalBankPosition?> GetFinalPositionAsync(DateTime positionDate);
        Task<List<CurrencyStatement>> GetCurrencyStatementAsync(Guid currencyId, DateTime asOfDate);
        Task<(IReadOnlyList<TransferListItem> Items, int TotalCount)> GetTransfersAsync(
            Guid? correspondentAccountId,
            Guid? beneficiaryId,
            Guid? currencyId,
            string? status,
            DateTime? startDate,
            DateTime? endDate,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default);
    }
}
