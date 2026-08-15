using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Commands.CreateBank;

public record CreateBankCommand(
    long BankCode,
    string? BankNameEn,
    string BankNameAr,
    string? ShortName,
    string? CreatedBy) : ICommand<Guid>;
