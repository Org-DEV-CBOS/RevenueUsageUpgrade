using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Common;

public static class Paging
{
    public const int DefaultPage = 1;
    public const int DefaultPageSize = 25;
    public const int MaxPageSize = 500;

    public static PagedResponse<T> Create<T>(
        IEnumerable<T> source,
        int page,
        int pageSize,
        int pageNumber = 0)
    {
        if (pageNumber > 0)
        {
            page = pageNumber;
        }

        page = page < 1 ? DefaultPage : page;
        pageSize = pageSize < 1 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);

        var list = source as IReadOnlyList<T> ?? source.ToList();
        var totalCount = list.Count;
        var items = list.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return new PagedResponse<T>(items, page, pageSize, totalCount);
    }

    public static IReadOnlyList<T> Search<T>(IEnumerable<T> source, string? term, Func<T, object?[]> values)
    {
        var list = source as IReadOnlyList<T> ?? source.ToList();
        if (string.IsNullOrWhiteSpace(term))
        {
            return list;
        }

        var needle = term.Trim();
        return list
            .Where(item => values(item).Any(value =>
                value is not null &&
                value.ToString()!.Contains(needle, StringComparison.OrdinalIgnoreCase)))
            .ToList();
    }
}
