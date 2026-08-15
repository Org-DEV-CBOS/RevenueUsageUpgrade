using MediatR;
using Microsoft.AspNetCore.Mvc;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Application.Features.Correspondents;

namespace RevenuUsage.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CorrespondentsController : ControllerBase
{
    private readonly IMediator _mediator;
    public CorrespondentsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CorrespondentDto>>> GetAll(
        [FromQuery] bool activeOnly = true, CancellationToken ct = default) =>
        Ok(await _mediator.Send(new GetCorrespondentsQuery(activeOnly), ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CorrespondentDto>> Get(Guid id, CancellationToken ct)
    {
        var item = await _mediator.Send(new GetCorrespondentQuery(id), ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateCorrespondentDto request, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateCorrespondentCommand(request), ct);
        return CreatedAtAction(nameof(Get), new { id }, id);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateCorrespondentDto request, CancellationToken ct)
    {
        if (id != request.CorrespondentId) return BadRequest(new { message = "Correspondent ID mismatch." });
        await _mediator.Send(new UpdateCorrespondentCommand(request), ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, DeleteMasterDataDto request, CancellationToken ct)
    {
        await _mediator.Send(new DeleteCorrespondentCommand(id, request.DeletedBy), ct);
        return NoContent();
    }
}
