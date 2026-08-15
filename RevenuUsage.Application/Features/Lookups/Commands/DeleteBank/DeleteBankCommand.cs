using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Lookups.Commands.DeleteBank;

public record DeleteBankCommand(Guid BankId, string? DeletedBy) : ICommand;
