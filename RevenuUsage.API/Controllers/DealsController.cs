using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RevenuUsage.Application.Common;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Application.Features.FundingTransfers;
using RevenuUsage.Domain.Entities;

namespace RevenuUsage.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class DealsController : ControllerBase
{
    private readonly IMediator _mediator;

    public DealsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<PagedResponse<Deal>>> Get(
        [FromQuery] Guid? correspondentAccountId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        CancellationToken ct = default) =>
        Ok(Paging.Create(
            await _mediator.Send(new GetDealsQuery(correspondentAccountId, startDate, endDate), ct),
            page,
            pageSize,
            pageNumber));

    [HttpPost]
    public async Task<ActionResult> Create(CreateDealCommand command, CancellationToken ct) =>
        Ok(new { dealId = await _mediator.Send(command, ct) });

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, [FromBody] DeleteDealDto dto, CancellationToken ct)
    {
        await _mediator.Send(new DeleteDealCommand(id, dto.DeletedBy), ct);
        return NoContent();
    }
}

public sealed record DeleteDealDto(string DeletedBy);
