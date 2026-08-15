using MediatR;
using Microsoft.AspNetCore.Mvc;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Application.Features.Beneficiaries.Queries.GetBeneficiaryStatement;
using RevenuUsage.Application.Features.MasterData;

namespace RevenuUsage.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BeneficiariesController : ControllerBase
{
    private readonly IMediator _mediator;

    public BeneficiariesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BeneficiaryDto>>> GetAll([FromQuery] bool activeOnly = true, CancellationToken ct = default) => Ok(await _mediator.Send(new GetBeneficiariesQuery(activeOnly), ct));
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] SaveBeneficiaryDto model, CancellationToken ct) => Ok(new { beneficiaryId = await _mediator.Send(new SaveBeneficiaryCommand(model with { BeneficiaryId = null }), ct) });
    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] SaveBeneficiaryDto model, CancellationToken ct) { await _mediator.Send(new SaveBeneficiaryCommand(model with { BeneficiaryId = id }),ct); return NoContent(); }
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id,[FromBody] DeleteMasterDataDto model,CancellationToken ct){await _mediator.Send(new DeleteBeneficiaryCommand(id,model.DeletedBy),ct);return NoContent();}

    /// <summary>
    /// Get transfers per beneficiary
    /// </summary>
    [HttpGet("{beneficiaryId}/transfers")]
    [ProducesResponseType(typeof(IEnumerable<BeneficiaryStatementDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<BeneficiaryStatementDto>>> GetBeneficiaryStatement(
        [FromRoute] Guid beneficiaryId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        CancellationToken cancellationToken)
    {
        var query = new GetBeneficiaryStatementQuery(beneficiaryId, startDate, endDate);

        var result = await _mediator.Send(query, cancellationToken);

        return Ok(result);
    }
}
