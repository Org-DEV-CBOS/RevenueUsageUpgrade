using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.Lookups.Queries.GetBanksPaged;

public sealed record GetBanksPagedQuery(int Page, int PageSize, string? Search) : IQuery<PagedResponse<BankDto>>;
