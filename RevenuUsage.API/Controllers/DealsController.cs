using MediatR;using Microsoft.AspNetCore.Authorization;using Microsoft.AspNetCore.Mvc;using RevenuUsage.Application.Features.FundingTransfers;using RevenuUsage.Domain.Entities;
namespace RevenuUsage.API.Controllers;
[Authorize][ApiController][Route("api/[controller]")]public sealed class DealsController:ControllerBase
{private readonly IMediator _mediator;public DealsController(IMediator mediator)=>_mediator=mediator;
[HttpGet]public async Task<ActionResult<IReadOnlyList<Deal>>> Get([FromQuery]Guid? correspondentAccountId,[FromQuery]DateTime? startDate,[FromQuery]DateTime? endDate,CancellationToken ct)=>Ok(await _mediator.Send(new GetDealsQuery(correspondentAccountId,startDate,endDate),ct));
[HttpPost]public async Task<ActionResult> Create(CreateDealCommand command,CancellationToken ct)=>Ok(new{dealId=await _mediator.Send(command,ct)});
[HttpDelete("{id:guid}")]public async Task<ActionResult> Delete(Guid id,[FromBody]DeleteDealDto dto,CancellationToken ct){await _mediator.Send(new DeleteDealCommand(id,dto.DeletedBy),ct);return NoContent();}}
public sealed record DeleteDealDto(string DeletedBy);
