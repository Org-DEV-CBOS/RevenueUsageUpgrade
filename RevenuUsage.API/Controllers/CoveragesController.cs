using MediatR;using Microsoft.AspNetCore.Authorization;using Microsoft.AspNetCore.Mvc;using RevenuUsage.Application.Features.FundingTransfers;using RevenuUsage.Domain.Entities;
namespace RevenuUsage.API.Controllers;
[Authorize][ApiController][Route("api/[controller]")]public sealed class CoveragesController:ControllerBase
{private readonly IMediator _mediator;public CoveragesController(IMediator mediator)=>_mediator=mediator;
[HttpGet]public async Task<ActionResult<IReadOnlyList<Coverage>>> Get([FromQuery]Guid? correspondentAccountId,[FromQuery]DateTime? startDate,[FromQuery]DateTime? endDate,CancellationToken ct)=>Ok(await _mediator.Send(new GetCoveragesQuery(correspondentAccountId,startDate,endDate),ct));
[HttpPost]public async Task<ActionResult> Create(CreateCoverageCommand command,CancellationToken ct)=>Ok(new{coverageId=await _mediator.Send(command,ct)});
[HttpDelete("{id:guid}")]public async Task<ActionResult> Delete(Guid id,[FromBody]DeleteFundingTransferDto dto,CancellationToken ct){await _mediator.Send(new DeleteCoverageCommand(id,dto.DeletedBy),ct);return NoContent();}}
public sealed record DeleteFundingTransferDto(string DeletedBy);
