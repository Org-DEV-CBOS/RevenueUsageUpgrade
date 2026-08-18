using FluentValidation;
using MediatR;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.Correspondents;

public sealed record GetCorrespondentsQuery(bool ActiveOnly = true) : IRequest<IReadOnlyList<CorrespondentDto>>;
public sealed record GetCorrespondentQuery(Guid CorrespondentId) : IRequest<CorrespondentDto?>;
public sealed record CreateCorrespondentCommand(CreateCorrespondentDto Model) : IRequest<Guid>;
public sealed record UpdateCorrespondentCommand(UpdateCorrespondentDto Model) : IRequest;
public sealed record DeleteCorrespondentCommand(Guid CorrespondentId, string? DeletedBy) : IRequest;

public sealed record GetCorrespondentAccountsQuery(
    Guid? CorrespondentId = null,
    Guid? CurrencyId = null,
    bool ActiveOnly = true) : IRequest<IReadOnlyList<CorrespondentAccountDto>>;
public sealed record GetCorrespondentAccountQuery(Guid CorrespondentAccountId) : IRequest<CorrespondentAccountDto?>;
public sealed record CreateCorrespondentAccountCommand(CreateCorrespondentAccountDto Model) : IRequest<Guid>;
public sealed record UpdateCorrespondentAccountCommand(UpdateCorrespondentAccountDto Model) : IRequest;
public sealed record DeleteCorrespondentAccountCommand(Guid CorrespondentAccountId, string? DeletedBy) : IRequest;

public sealed class CorrespondentRequestHandler :
    IRequestHandler<GetCorrespondentsQuery, IReadOnlyList<CorrespondentDto>>,
    IRequestHandler<GetCorrespondentQuery, CorrespondentDto?>,
    IRequestHandler<CreateCorrespondentCommand, Guid>,
    IRequestHandler<UpdateCorrespondentCommand>,
    IRequestHandler<DeleteCorrespondentCommand>,
    IRequestHandler<GetCorrespondentAccountsQuery, IReadOnlyList<CorrespondentAccountDto>>,
    IRequestHandler<GetCorrespondentAccountQuery, CorrespondentAccountDto?>,
    IRequestHandler<CreateCorrespondentAccountCommand, Guid>,
    IRequestHandler<UpdateCorrespondentAccountCommand>,
    IRequestHandler<DeleteCorrespondentAccountCommand>
{
    private readonly ICorrespondentRepository _repository;

    public CorrespondentRequestHandler(ICorrespondentRepository repository) => _repository = repository;

    public async Task<IReadOnlyList<CorrespondentDto>> Handle(GetCorrespondentsQuery request, CancellationToken ct) =>
        (await _repository.GetCorrespondentsAsync(request.ActiveOnly, ct)).Select(Map).ToList();

    public async Task<CorrespondentDto?> Handle(GetCorrespondentQuery request, CancellationToken ct)
    {
        var item = await _repository.GetCorrespondentAsync(request.CorrespondentId, ct);
        return item is null ? null : Map(item);
    }

    public Task<Guid> Handle(CreateCorrespondentCommand request, CancellationToken ct) =>
        _repository.CreateCorrespondentAsync(new Correspondent
        {
            CorrespondentCode = request.Model.CorrespondentCode.Trim(),
            CorrespondentNameEn = request.Model.CorrespondentNameEn.Trim(),
            CorrespondentNameAr = request.Model.CorrespondentNameAr?.Trim(),
            CountryId = request.Model.CountryId,
            IsActive = true
        }, request.Model.CreatedBy, ct);

    public Task Handle(UpdateCorrespondentCommand request, CancellationToken ct) =>
        _repository.UpdateCorrespondentAsync(new Correspondent
        {
            CorrespondentId = request.Model.CorrespondentId,
            CorrespondentCode = request.Model.CorrespondentCode.Trim(),
            CorrespondentNameEn = request.Model.CorrespondentNameEn.Trim(),
            CorrespondentNameAr = request.Model.CorrespondentNameAr?.Trim(),
            CountryId = request.Model.CountryId,
            IsActive = request.Model.IsActive
        }, request.Model.ModifiedBy, ct);

    public Task Handle(DeleteCorrespondentCommand request, CancellationToken ct) =>
        _repository.DeleteCorrespondentAsync(request.CorrespondentId, request.DeletedBy, ct);

    public async Task<IReadOnlyList<CorrespondentAccountDto>> Handle(GetCorrespondentAccountsQuery request, CancellationToken ct) =>
        (await _repository.GetAccountsAsync(request.CorrespondentId, request.CurrencyId, request.ActiveOnly, ct))
        .Select(Map).ToList();

    public async Task<CorrespondentAccountDto?> Handle(GetCorrespondentAccountQuery request, CancellationToken ct)
    {
        var item = await _repository.GetAccountAsync(request.CorrespondentAccountId, ct);
        return item is null ? null : Map(item);
    }

    public Task<Guid> Handle(CreateCorrespondentAccountCommand request, CancellationToken ct) =>
        _repository.CreateAccountAsync(new CorrespondentAccount
        {
            CorrespondentId = request.Model.CorrespondentId,
            CurrencyId = request.Model.CurrencyId,
            AccountNumber = request.Model.AccountNumber.Trim(),
            OpeningBalance = request.Model.OpeningBalance,
            IsActive = true
        }, request.Model.CreatedBy, ct);

    public Task Handle(UpdateCorrespondentAccountCommand request, CancellationToken ct) =>
        _repository.UpdateAccountAsync(new CorrespondentAccount
        {
            CorrespondentAccountId = request.Model.CorrespondentAccountId,
            CorrespondentId = request.Model.CorrespondentId,
            CurrencyId = request.Model.CurrencyId,
            AccountNumber = request.Model.AccountNumber.Trim(),
            OpeningBalance = request.Model.OpeningBalance,
            IsActive = request.Model.IsActive
        }, request.Model.ModifiedBy, ct);

    public Task Handle(DeleteCorrespondentAccountCommand request, CancellationToken ct) =>
        _repository.DeleteAccountAsync(request.CorrespondentAccountId, request.DeletedBy, ct);

    private static CorrespondentDto Map(Correspondent x) => new(
        x.CorrespondentId, x.CorrespondentCode, x.CorrespondentNameEn, x.CorrespondentNameAr,
        x.CountryId, x.CountryNameEn, x.CountryNameAr, x.IsActive);

    private static CorrespondentAccountDto Map(CorrespondentAccount x) => new(
        x.CorrespondentAccountId, x.CorrespondentId, x.CorrespondentNameEn, x.CorrespondentNameAr,
        x.CurrencyId, x.CurrencyCode, x.CurrencyNameEn, x.CurrencyNameAr, x.AccountNumber, x.OpeningBalance, x.CurrentBalance,
        x.IsActive, x.HasMovements);
}

public sealed class CreateCorrespondentCommandValidator : AbstractValidator<CreateCorrespondentCommand>
{
    public CreateCorrespondentCommandValidator()
    {
        RuleFor(x => x.Model.CorrespondentCode).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Model.CorrespondentNameEn).NotEmpty().MinimumLength(3).MaximumLength(200);
        RuleFor(x => x.Model.CorrespondentNameAr).MaximumLength(200);
        RuleFor(x => x.Model.CountryId).NotEmpty();
    }
}

public sealed class UpdateCorrespondentCommandValidator : AbstractValidator<UpdateCorrespondentCommand>
{
    public UpdateCorrespondentCommandValidator()
    {
        RuleFor(x => x.Model.CorrespondentId).NotEmpty();
        RuleFor(x => x.Model.CorrespondentCode).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Model.CorrespondentNameEn).NotEmpty().MinimumLength(3).MaximumLength(200);
        RuleFor(x => x.Model.CorrespondentNameAr).MaximumLength(200);
        RuleFor(x => x.Model.CountryId).NotEmpty();
    }
}

public sealed class CreateCorrespondentAccountCommandValidator : AbstractValidator<CreateCorrespondentAccountCommand>
{
    public CreateCorrespondentAccountCommandValidator()
    {
        RuleFor(x => x.Model.CorrespondentId).NotEmpty();
        RuleFor(x => x.Model.CurrencyId).NotEmpty();
        RuleFor(x => x.Model.AccountNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Model.OpeningBalance).GreaterThanOrEqualTo(0);
    }
}

public sealed class UpdateCorrespondentAccountCommandValidator : AbstractValidator<UpdateCorrespondentAccountCommand>
{
    public UpdateCorrespondentAccountCommandValidator()
    {
        RuleFor(x => x.Model.CorrespondentAccountId).NotEmpty();
        RuleFor(x => x.Model.CorrespondentId).NotEmpty();
        RuleFor(x => x.Model.CurrencyId).NotEmpty();
        RuleFor(x => x.Model.AccountNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Model.OpeningBalance).GreaterThanOrEqualTo(0);
    }
}
