using FluentValidation;
using MediatR;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Obligations;

/*
The two lookups behind an obligation's client. They sit here rather than with the other
master data because they are read through IObligationRepository, and because client types
are deliberately missing a create and a delete: dbo.uspCreateObligation only has rules for
the bank and the company rows.
*/

public record GetClientTypesQuery(bool ActiveOnly = true) : IRequest<IReadOnlyList<ClientTypeDto>>;
public record UpdateClientTypeCommand(Guid Id, SaveClientTypeDto Model) : IRequest;
public record GetObligationTypesQuery(bool ActiveOnly = true) : IRequest<IReadOnlyList<ObligationTypeDto>>;
public record SaveObligationTypeCommand(SaveObligationTypeDto Model) : IRequest<Guid>;
public record DeleteObligationTypeCommand(Guid Id, string? Actor) : IRequest;

public sealed class ObligationTypeHandler :
    IRequestHandler<GetClientTypesQuery, IReadOnlyList<ClientTypeDto>>,
    IRequestHandler<UpdateClientTypeCommand>,
    IRequestHandler<GetObligationTypesQuery, IReadOnlyList<ObligationTypeDto>>,
    IRequestHandler<SaveObligationTypeCommand, Guid>,
    IRequestHandler<DeleteObligationTypeCommand>
{
    private readonly IObligationRepository _obligations;

    public ObligationTypeHandler(IObligationRepository obligations) => _obligations = obligations;

    public async Task<IReadOnlyList<ClientTypeDto>> Handle(GetClientTypesQuery r, CancellationToken ct) =>
        (await _obligations.GetClientTypesAsync(r.ActiveOnly, ct))
            .Select(x => new ClientTypeDto(x.ClientTypeId, x.ClientTypeCode, x.ClientTypeNameEn, x.ClientTypeNameAr, x.IsActive, x.HasMovements))
            .ToList();

    public Task Handle(UpdateClientTypeCommand r, CancellationToken ct) =>
        _obligations.UpdateClientTypeAsync(
            new ClientType
            {
                ClientTypeId = r.Id,
                ClientTypeNameEn = r.Model.ClientTypeNameEn.Trim(),
                ClientTypeNameAr = r.Model.ClientTypeNameAr?.Trim(),
                IsActive = r.Model.IsActive
            },
            r.Model.Actor,
            ct);

    public async Task<IReadOnlyList<ObligationTypeDto>> Handle(GetObligationTypesQuery r, CancellationToken ct) =>
        (await _obligations.GetObligationTypesAsync(r.ActiveOnly, ct))
            .Select(x => new ObligationTypeDto(x.ObligationTypeId, x.ObligationTypeNameEn, x.ObligationTypeNameAr, x.IsActive, x.HasMovements))
            .ToList();

    public async Task<Guid> Handle(SaveObligationTypeCommand r, CancellationToken ct)
    {
        var item = new ObligationType
        {
            ObligationTypeId = r.Model.ObligationTypeId ?? Guid.Empty,
            ObligationTypeNameEn = r.Model.ObligationTypeNameEn.Trim(),
            ObligationTypeNameAr = r.Model.ObligationTypeNameAr?.Trim(),
            IsActive = r.Model.IsActive
        };

        if (r.Model.ObligationTypeId is null)
        {
            return await _obligations.CreateObligationTypeAsync(item, r.Model.Actor, ct);
        }

        await _obligations.UpdateObligationTypeAsync(item, r.Model.Actor, ct);
        return item.ObligationTypeId;
    }

    public Task Handle(DeleteObligationTypeCommand r, CancellationToken ct) =>
        _obligations.DeleteObligationTypeAsync(r.Id, r.Actor, ct);
}

public sealed class UpdateClientTypeValidator : AbstractValidator<UpdateClientTypeCommand>
{
    public UpdateClientTypeValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Model.ClientTypeNameEn).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Model.ClientTypeNameAr).MaximumLength(100);
    }
}

public sealed class SaveObligationTypeValidator : AbstractValidator<SaveObligationTypeCommand>
{
    public SaveObligationTypeValidator()
    {
        RuleFor(x => x.Model.ObligationTypeNameEn).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Model.ObligationTypeNameAr).MaximumLength(100);
    }
}
