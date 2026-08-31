using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RevenuUsage.Application.Common;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Application.Features.Correspondents;

namespace RevenuUsage.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class CorrespondentAccountsController : ControllerBase
{
    private readonly IMediator _mediator;
    public CorrespondentAccountsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<PagedResponse<CorrespondentAccountDto>>> GetAll(
        [FromQuery] Guid? correspondentId,
        [FromQuery] Guid? currencyId,
        [FromQuery] bool activeOnly = true,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        CancellationToken ct = default) =>
        Ok(Paging.Create(
            await _mediator.Send(new GetCorrespondentAccountsQuery(correspondentId, currencyId, activeOnly), ct),
            page,
            pageSize,
            pageNumber));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CorrespondentAccountDto>> Get(Guid id, CancellationToken ct)
    {
        var item = await _mediator.Send(new GetCorrespondentAccountQuery(id), ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateCorrespondentAccountDto request, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateCorrespondentAccountCommand(request), ct);
        return CreatedAtAction(nameof(Get), new { id }, id);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateCorrespondentAccountDto request, CancellationToken ct)
    {
        if (id != request.CorrespondentAccountId) return BadRequest(new { message = "Account ID mismatch." });
        await _mediator.Send(new UpdateCorrespondentAccountCommand(request), ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, DeleteMasterDataDto request, CancellationToken ct)
    {
        await _mediator.Send(new DeleteCorrespondentAccountCommand(id, request.DeletedBy), ct);
        return NoContent();
    }
}
