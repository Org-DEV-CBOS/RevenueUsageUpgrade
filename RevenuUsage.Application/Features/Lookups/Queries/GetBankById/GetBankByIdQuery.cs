using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.DTOs;

namespace RevenuUsage.Application.Features.Lookups.Queries.GetBankById;

public record GetBankByIdQuery(Guid BankId) : IQuery<BankDto?>;
