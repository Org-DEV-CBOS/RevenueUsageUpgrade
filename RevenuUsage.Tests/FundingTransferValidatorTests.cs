using RevenuUsage.Application.Features.FundingTransfers;
namespace RevenuUsage.Tests;
public sealed class FundingTransferValidatorTests
{
    [Fact] public async Task Coverage_rejects_same_account_and_non_positive_amount(){var id=Guid.NewGuid();var result=await new CreateCoverageValidator().ValidateAsync(new CreateCoverageCommand(id,id,0,null,null,DateTime.Today,"user"));Assert.Contains(result.Errors,x=>x.PropertyName=="ToAccountId");Assert.Contains(result.Errors,x=>x.PropertyName=="Amount");}
    [Fact] public async Task Deal_requires_positive_rate_and_different_account(){var id=Guid.NewGuid();var result=await new CreateDealValidator().ValidateAsync(new CreateDealCommand(id,id,1,0,null,null,DateTime.Today,"user"));Assert.Contains(result.Errors,x=>x.PropertyName=="ToAccountId");Assert.Contains(result.Errors,x=>x.PropertyName=="ExchangeRate");}
    [Fact] public async Task Valid_funding_transfers_pass_validation(){var from=Guid.NewGuid();var to=Guid.NewGuid();Assert.True((await new CreateCoverageValidator().ValidateAsync(new CreateCoverageCommand(from,to,10,null,null,DateTime.Today,"user"))).IsValid);Assert.True((await new CreateDealValidator().ValidateAsync(new CreateDealCommand(from,to,10,1.5m,null,null,DateTime.Today,"user"))).IsValid);}
}
