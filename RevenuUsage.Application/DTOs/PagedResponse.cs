namespace RevenuUsage.Application.DTOs;

public sealed record PagedResponse<T>(
    IReadOnlyList<T> Items,
    int Page,
    int PageSize,
    int TotalCount,

    /// <summary>
    /// Figures covering the whole result set rather than the current page, for reports
    /// that foot a column. Null when the caller has nothing to total.
    /// </summary>
    IReadOnlyDictionary<string, decimal>? Totals = null)
{
    public int TotalPages => TotalCount == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
}
