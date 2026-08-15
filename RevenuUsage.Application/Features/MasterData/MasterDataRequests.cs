using FluentValidation;
using MediatR;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;

namespace RevenuUsage.Application.Features.MasterData;

public record GetBeneficiariesQuery(bool ActiveOnly = true) : IRequest<IReadOnlyList<BeneficiaryDto>>;
public record SaveBeneficiaryCommand(SaveBeneficiaryDto Model) : IRequest<Guid>;
public record DeleteBeneficiaryCommand(Guid Id, string? Actor) : IRequest;
public record GetCurrenciesQuery(bool ActiveOnly = true) : IRequest<IReadOnlyList<CurrencyDto>>;
public record SaveCurrencyCommand(SaveCurrencyDto Model) : IRequest<Guid>;
public record DeleteCurrencyCommand(Guid Id, string? Actor) : IRequest;
public record GetResourceTypesQuery(bool ActiveOnly = true) : IRequest<IReadOnlyList<ResourceTypeDto>>;
public record SaveResourceTypeCommand(SaveResourceTypeDto Model) : IRequest<Guid>;
public record DeleteResourceTypeCommand(Guid Id, string? Actor) : IRequest;

public sealed class MasterDataHandler :
    IRequestHandler<GetBeneficiariesQuery, IReadOnlyList<BeneficiaryDto>>, IRequestHandler<SaveBeneficiaryCommand, Guid>, IRequestHandler<DeleteBeneficiaryCommand>,
    IRequestHandler<GetCurrenciesQuery, IReadOnlyList<CurrencyDto>>, IRequestHandler<SaveCurrencyCommand, Guid>, IRequestHandler<DeleteCurrencyCommand>,
    IRequestHandler<GetResourceTypesQuery, IReadOnlyList<ResourceTypeDto>>, IRequestHandler<SaveResourceTypeCommand, Guid>, IRequestHandler<DeleteResourceTypeCommand>
{
    private readonly IBeneficiaryRepository _beneficiaries; private readonly ICurrencyRepository _currencies; private readonly IResourceRepository _resources;
    public MasterDataHandler(IBeneficiaryRepository beneficiaries, ICurrencyRepository currencies, IResourceRepository resources) => (_beneficiaries, _currencies, _resources) = (beneficiaries, currencies, resources);
    public async Task<IReadOnlyList<BeneficiaryDto>> Handle(GetBeneficiariesQuery r, CancellationToken ct) => (await _beneficiaries.GetBeneficiariesAsync(r.ActiveOnly, ct)).Select(x => new BeneficiaryDto(x.BeneficiaryId,x.BeneficiaryCode,x.BeneficiaryNameEn,x.BeneficiaryNameAr,x.IsActive,x.HasMovements)).ToList();
    public async Task<Guid> Handle(SaveBeneficiaryCommand r, CancellationToken ct) { var x = new Beneficiary { BeneficiaryId=r.Model.BeneficiaryId??Guid.Empty, BeneficiaryCode=r.Model.BeneficiaryCode.Trim(), BeneficiaryNameEn=r.Model.BeneficiaryNameEn.Trim(), BeneficiaryNameAr=r.Model.BeneficiaryNameAr?.Trim(), IsActive=r.Model.IsActive }; if(r.Model.BeneficiaryId is null) return await _beneficiaries.CreateBeneficiaryAsync(x,r.Model.Actor,ct); await _beneficiaries.UpdateBeneficiaryAsync(x,r.Model.Actor,ct); return x.BeneficiaryId; }
    public Task Handle(DeleteBeneficiaryCommand r, CancellationToken ct) => _beneficiaries.DeleteBeneficiaryAsync(r.Id,r.Actor,ct);
    public async Task<IReadOnlyList<CurrencyDto>> Handle(GetCurrenciesQuery r, CancellationToken ct) => (await _currencies.GetCurrenciesAsync(r.ActiveOnly,ct)).Select(x => new CurrencyDto(x.CurrencyId,x.CurrencyCode,x.CurrencyNameEn,x.CurrencyNameAr,x.Symbol,x.DecimalPlaces,x.IsActive,x.HasMovements)).ToList();
    public async Task<Guid> Handle(SaveCurrencyCommand r, CancellationToken ct) { var x=new Currency { CurrencyId=r.Model.CurrencyId??Guid.Empty,CurrencyCode=r.Model.CurrencyCode.Trim().ToUpperInvariant(),CurrencyNameEn=r.Model.CurrencyNameEn.Trim(),CurrencyNameAr=r.Model.CurrencyNameAr?.Trim(),Symbol=r.Model.Symbol?.Trim(),DecimalPlaces=r.Model.DecimalPlaces,IsActive=r.Model.IsActive}; if(r.Model.CurrencyId is null)return await _currencies.CreateCurrencyAsync(x,r.Model.Actor,ct);await _currencies.UpdateCurrencyAsync(x,r.Model.Actor,ct);return x.CurrencyId; }
    public Task Handle(DeleteCurrencyCommand r, CancellationToken ct) => _currencies.DeleteCurrencyAsync(r.Id,r.Actor,ct);
    public async Task<IReadOnlyList<ResourceTypeDto>> Handle(GetResourceTypesQuery r, CancellationToken ct) => (await _resources.GetResourceTypesAsync(r.ActiveOnly,ct)).Select(x => new ResourceTypeDto(x.ResourceTypeId,x.ResourceTypeCode,x.ResourceTypeNameEn,x.ResourceTypeNameAr,x.IsActive,x.HasMovements)).ToList();
    public async Task<Guid> Handle(SaveResourceTypeCommand r,CancellationToken ct){var x=new ResourceType{ResourceTypeId=r.Model.ResourceTypeId??Guid.Empty,ResourceTypeCode=r.Model.ResourceTypeCode.Trim(),ResourceTypeNameEn=r.Model.ResourceTypeNameEn.Trim(),ResourceTypeNameAr=r.Model.ResourceTypeNameAr?.Trim(),IsActive=r.Model.IsActive};if(r.Model.ResourceTypeId is null)return await _resources.CreateResourceTypeAsync(x,r.Model.Actor,ct);await _resources.UpdateResourceTypeAsync(x,r.Model.Actor,ct);return x.ResourceTypeId;}
    public Task Handle(DeleteResourceTypeCommand r,CancellationToken ct)=>_resources.DeleteResourceTypeAsync(r.Id,r.Actor,ct);
}

public sealed class SaveBeneficiaryValidator:AbstractValidator<SaveBeneficiaryCommand>{public SaveBeneficiaryValidator(){RuleFor(x=>x.Model.BeneficiaryCode).NotEmpty().MaximumLength(50);RuleFor(x=>x.Model.BeneficiaryNameEn).NotEmpty().MaximumLength(200);}}
public sealed class SaveCurrencyValidator:AbstractValidator<SaveCurrencyCommand>{public SaveCurrencyValidator(){RuleFor(x=>x.Model.CurrencyCode).NotEmpty().Length(3);RuleFor(x=>x.Model.CurrencyNameEn).NotEmpty().MaximumLength(100);RuleFor(x=>x.Model.DecimalPlaces).InclusiveBetween(0,6);}}
public sealed class SaveResourceTypeValidator:AbstractValidator<SaveResourceTypeCommand>{public SaveResourceTypeValidator(){RuleFor(x=>x.Model.ResourceTypeCode).NotEmpty().MaximumLength(50);RuleFor(x=>x.Model.ResourceTypeNameEn).NotEmpty().MaximumLength(100);}}
