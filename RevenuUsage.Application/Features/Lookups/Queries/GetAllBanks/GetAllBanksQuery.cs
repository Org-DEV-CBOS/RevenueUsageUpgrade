using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.Lookups.Queries.GetAllBanks;

public record GetAllBanksQuery : IQuery<IEnumerable<BankDto>>;
