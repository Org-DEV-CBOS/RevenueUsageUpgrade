using FluentValidation;
using MediatR;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;
namespace RevenuUsage.Application.Features.FundingTransfers;

public record GetCoveragesQuery(Guid? AccountId,DateTime? StartDate,DateTime? EndDate):IRequest<IReadOnlyList<Coverage>>;
public record CreateCoverageCommand(Guid FromAccountId,Guid ToAccountId,decimal Amount,string? ReferenceNo,string? Narration,DateTime TransactionDate,string CreatedBy):IRequest<Guid>;
public record DeleteCoverageCommand(Guid Id,string DeletedBy):IRequest;
public record GetDealsQuery(Guid? AccountId,DateTime? StartDate,DateTime? EndDate):IRequest<IReadOnlyList<Deal>>;
public record CreateDealCommand(Guid FromAccountId,Guid ToAccountId,decimal FromAmount,decimal ExchangeRate,string? ReferenceNo,string? Narration,DateTime TransactionDate,string CreatedBy):IRequest<Guid>;
public record DeleteDealCommand(Guid Id,string DeletedBy):IRequest;

public sealed class FundingTransferHandler:
 IRequestHandler<GetCoveragesQuery,IReadOnlyList<Coverage>>,IRequestHandler<CreateCoverageCommand,Guid>,IRequestHandler<DeleteCoverageCommand>,
 IRequestHandler<GetDealsQuery,IReadOnlyList<Deal>>,IRequestHandler<CreateDealCommand,Guid>,IRequestHandler<DeleteDealCommand>
{
 private readonly ICoverageRepository _covers;private readonly IDealRepository _deals;
 public FundingTransferHandler(ICoverageRepository covers,IDealRepository deals)=>(_covers,_deals)=(covers,deals);
 public async Task<IReadOnlyList<Coverage>> Handle(GetCoveragesQuery r,CancellationToken ct)=>(await _covers.GetAsync(r.AccountId,r.StartDate,r.EndDate,ct)).ToList();
 public Task<Guid> Handle(CreateCoverageCommand r,CancellationToken ct)=>_covers.CreateAsync(new Coverage{FromCorrespondentAccountId=r.FromAccountId,ToCorrespondentAccountId=r.ToAccountId,Amount=r.Amount,ReferenceNo=r.ReferenceNo?.Trim(),Narration=r.Narration?.Trim(),TransactionDate=r.TransactionDate},r.CreatedBy,ct);
 public Task Handle(DeleteCoverageCommand r,CancellationToken ct)=>_covers.DeleteAsync(r.Id,r.DeletedBy,ct);
 public async Task<IReadOnlyList<Deal>> Handle(GetDealsQuery r,CancellationToken ct)=>(await _deals.GetAsync(r.AccountId,r.StartDate,r.EndDate,ct)).ToList();
 public Task<Guid> Handle(CreateDealCommand r,CancellationToken ct)=>_deals.CreateAsync(new Deal{FromCorrespondentAccountId=r.FromAccountId,ToCorrespondentAccountId=r.ToAccountId,FromAmount=r.FromAmount,ExchangeRate=r.ExchangeRate,ReferenceNo=r.ReferenceNo?.Trim(),Narration=r.Narration?.Trim(),TransactionDate=r.TransactionDate},r.CreatedBy,ct);
 public Task Handle(DeleteDealCommand r,CancellationToken ct)=>_deals.DeleteAsync(r.Id,r.DeletedBy,ct);
}
public sealed class CreateCoverageValidator:AbstractValidator<CreateCoverageCommand>{public CreateCoverageValidator(){RuleFor(x=>x.FromAccountId).NotEmpty();RuleFor(x=>x.ToAccountId).NotEmpty().NotEqual(x=>x.FromAccountId);RuleFor(x=>x.Amount).GreaterThan(0);RuleFor(x=>x.TransactionDate).NotEmpty();RuleFor(x=>x.CreatedBy).NotEmpty();}}
public sealed class CreateDealValidator:AbstractValidator<CreateDealCommand>{public CreateDealValidator(){RuleFor(x=>x.FromAccountId).NotEmpty();RuleFor(x=>x.ToAccountId).NotEmpty().NotEqual(x=>x.FromAccountId);RuleFor(x=>x.FromAmount).GreaterThan(0);RuleFor(x=>x.ExchangeRate).GreaterThan(0);RuleFor(x=>x.TransactionDate).NotEmpty();RuleFor(x=>x.CreatedBy).NotEmpty();}}
