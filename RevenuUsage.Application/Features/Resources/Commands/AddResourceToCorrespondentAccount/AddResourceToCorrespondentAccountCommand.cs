using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Resources.Commands.AddResourceToCorrespondentAccount;

public sealed record AddResourceToCorrespondentAccountCommand(
    DateTime ResourceDate,
    Guid CorrespondentAccountId,
    decimal Amount,
    Guid ResourceTypeId,
    string? Notes,
    string CreatedBy) : ICommand;
