using FluentValidation;using MediatR;using RevenuUsage.Domain.Entities;using RevenuUsage.Domain.Interfaces;namespace RevenuUsage.Application.Features.ReservesAndObligations;
public record GetReservesQuery(DateTime? StartDate,DateTime? EndDate):IRequest<IReadOnlyList<ReserveSnapshot>>;public record CreateReserveCommand(DateTime ReserveDate,decimal GoldValue,decimal CashInHand,decimal Deposits,string? Notes,string CreatedBy):IRequest<Guid>;public record DeleteReserveCommand(Guid Id,string Actor):IRequest;
public record GetObligationsQuery(bool ActiveOnly=true,Guid? ClientTypeId=null):IRequest<IReadOnlyList<Obligation>>;public record CreateObligationCommand(DateTime ObligationDate,Guid ClientTypeId,Guid CurrencyId,decimal TotalAmount,DateTime? DueDate,string? ReferenceNo,string? Notes,string CreatedBy,Guid? ObligationTypeId=null,Guid? BankId=null,Guid? CompanyId=null):IRequest<Guid>;public record DeleteObligationCommand(Guid Id,string Actor):IRequest;
public sealed class ReservesObligationsHandler:IRequestHandler<GetReservesQuery,IReadOnlyList<ReserveSnapshot>>,IRequestHandler<CreateReserveCommand,Guid>,IRequestHandler<DeleteReserveCommand>,IRequestHandler<GetObligationsQuery,IReadOnlyList<Obligation>>,IRequestHandler<CreateObligationCommand,Guid>,IRequestHandler<DeleteObligationCommand>{private readonly IReserveRepository _reserves;private readonly IObligationRepository _obligations;public ReservesObligationsHandler(IReserveRepository r,IObligationRepository o)=>(_reserves,_obligations)=(r,o);public async Task<IReadOnlyList<ReserveSnapshot>>Handle(GetReservesQuery r,CancellationToken ct)=>(await _reserves.GetAsync(r.StartDate,r.EndDate,ct)).ToList();public Task<Guid>Handle(CreateReserveCommand r,CancellationToken ct)=>_reserves.CreateAsync(new ReserveSnapshot{ReserveDate=r.ReserveDate,GoldValue=r.GoldValue,CashInHand=r.CashInHand,Deposits=r.Deposits,Notes=r.Notes},r.CreatedBy,ct);public Task Handle(DeleteReserveCommand r,CancellationToken ct)=>_reserves.DeleteAsync(r.Id,r.Actor,ct);public async Task<IReadOnlyList<Obligation>>Handle(GetObligationsQuery r,CancellationToken ct)=>(await _obligations.GetObligationsAsync(r.ActiveOnly,r.ClientTypeId,ct)).ToList();public Task<Guid>Handle(CreateObligationCommand r,CancellationToken ct)=>_obligations.CreateObligationAsync(new Obligation{ObligationDate=r.ObligationDate,ClientTypeId=r.ClientTypeId,ObligationTypeId=r.ObligationTypeId,BankId=r.BankId,CompanyId=r.CompanyId,CurrencyId=r.CurrencyId,TotalAmount=r.TotalAmount,DueDate=r.DueDate,ReferenceNo=r.ReferenceNo,Notes=r.Notes},r.CreatedBy,ct);public Task Handle(DeleteObligationCommand r,CancellationToken ct)=>_obligations.DeleteObligationAsync(r.Id,r.Actor,ct);}
public sealed class CreateReserveValidator:AbstractValidator<CreateReserveCommand>{public CreateReserveValidator(){RuleFor(x=>x.ReserveDate).NotEmpty();RuleFor(x=>x.GoldValue).GreaterThanOrEqualTo(0);RuleFor(x=>x.CashInHand).GreaterThanOrEqualTo(0);RuleFor(x=>x.Deposits).GreaterThanOrEqualTo(0);RuleFor(x=>x).Must(x=>x.GoldValue+x.CashInHand+x.Deposits>0).WithMessage("At least one reserve value is required.");}}
public sealed class CreateObligationValidator:AbstractValidator<CreateObligationCommand>
{
    /*
    Which client type demands which id is settled by dbo.uspCreateObligation, because only
    the database knows the ClientTypeCode behind a ClientTypeId. What is checkable here is
    that the ids which did arrive describe one coherent client.
    */
    public CreateObligationValidator()
    {
        RuleFor(x=>x.ClientTypeId).NotEmpty();
        RuleFor(x=>x).Must(x=>IsSet(x.BankId)^IsSet(x.CompanyId)).WithMessage("An obligation belongs to either a bank or a company, not both.");
        RuleFor(x=>x.ObligationTypeId).Empty().When(x=>IsSet(x.BankId)).WithMessage("A bank client does not have an obligation type.");
        RuleFor(x=>x.ObligationTypeId).NotEmpty().When(x=>IsSet(x.CompanyId)).WithMessage("An obligation type is required for a company client.");
        RuleFor(x=>x.CurrencyId).NotEmpty();
        RuleFor(x=>x.TotalAmount).GreaterThan(0);
        RuleFor(x=>x.ReferenceNo).MaximumLength(100);
        RuleFor(x=>x.DueDate).GreaterThanOrEqualTo(x=>x.ObligationDate).When(x=>x.DueDate.HasValue);
    }

    private static bool IsSet(Guid? id)=>id.HasValue&&id.Value!=Guid.Empty;
}
