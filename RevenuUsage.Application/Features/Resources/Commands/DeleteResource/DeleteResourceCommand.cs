using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Application.Features.Resources.Commands.DeleteResource;

public sealed record DeleteResourceCommand(
    Guid ResourceId,
    string DeletedBy) : ICommand;
