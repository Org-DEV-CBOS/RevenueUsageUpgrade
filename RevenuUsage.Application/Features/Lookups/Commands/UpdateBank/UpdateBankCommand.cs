using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Commands.UpdateBank;

public record UpdateBankCommand(
    Guid BankId,
    long BankCode,
    string? BankNameEn,
    string BankNameAr,
    string? ShortName,
    bool IsActive,
    string? ModifiedBy) : ICommand;
