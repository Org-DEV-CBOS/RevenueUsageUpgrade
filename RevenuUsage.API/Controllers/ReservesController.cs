using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RevenuUsage.Application.Common;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Application.Features.ReservesAndObligations;
using RevenuUsage.Domain.Entities;

namespace RevenuUsage.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class ReservesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReservesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<PagedResponse<ReserveSnapshot>>> Get(
        DateTime? startDate,
        DateTime? endDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        CancellationToken ct = default) =>
        Ok(Paging.Create(await _mediator.Send(new GetReservesQuery(startDate, endDate), ct), page, pageSize, pageNumber));

    [HttpPost]
    public async Task<ActionResult> Create(CreateReserveCommand command, CancellationToken ct) =>
        Ok(new { reserveSnapshotId = await _mediator.Send(command, ct) });

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, DeleteReserveDto dto, CancellationToken ct)
    {
        await _mediator.Send(new DeleteReserveCommand(id, dto.DeletedBy), ct);
        return NoContent();
    }
}

public sealed record DeleteReserveDto(string DeletedBy);
