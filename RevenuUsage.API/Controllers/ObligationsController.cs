using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RevenuUsage.Application.Common;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Application.Features.Obligations.Commands.AddObligationPayment;
using RevenuUsage.Application.Features.Obligations.Commands.DeleteObligationPayment;
using RevenuUsage.Application.Features.Obligations.Queries.GetObligationStatement;
using RevenuUsage.Application.Features.ReservesAndObligations;
using RevenuUsage.Domain.Entities;

namespace RevenuUsage.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ObligationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ObligationsController(IMediator mediator)
    {
        _mediator = mediator;
    }
    [HttpGet]
    public async Task<ActionResult<PagedResponse<Obligation>>> GetAll(
        [FromQuery] bool activeOnly = true,
        [FromQuery] string? clientType = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        CancellationToken ct = default) =>
        Ok(Paging.Create(await _mediator.Send(new GetObligationsQuery(activeOnly, clientType), ct), page, pageSize, pageNumber));
    [HttpPost] public async Task<ActionResult> Create(CreateObligationCommand command,CancellationToken ct)=>Ok(new{obligationId=await _mediator.Send(command,ct)});
    [HttpDelete("{id:guid}")] public async Task<ActionResult> Delete(Guid id,[FromBody]DeleteMasterDataDto dto,CancellationToken ct){await _mediator.Send(new DeleteObligationCommand(id,dto.DeletedBy??string.Empty),ct);return NoContent();}

    /// <summary>
    /// Add a payment to an obligation
    /// </summary>
    [HttpPost("payment")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> AddObligationPayment(
        [FromBody] AddObligationPaymentDto request,
        CancellationToken cancellationToken)
    {
        var command = new AddObligationPaymentCommand(
            request.ObligationId,
            request.CorrespondentAccountId,
            request.PaymentDate,
            request.Amount,
            request.ReferenceNo,
            request.Notes,
            request.CreatedBy);

        await _mediator.Send(command, cancellationToken);

        return Ok(new { message = "Payment added successfully" });
    }

    /// <summary>
    /// Delete an obligation payment
    /// </summary>
    [HttpDelete("payment/{obligationPaymentId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> DeleteObligationPayment(
        [FromRoute] Guid obligationPaymentId,
        [FromBody] DeleteObligationPaymentDto request,
        CancellationToken cancellationToken)
    {
        var command = new DeleteObligationPaymentCommand(obligationPaymentId, request.DeletedBy);

        await _mediator.Send(command, cancellationToken);

        return Ok(new { message = "Payment deleted successfully" });
    }

    /// <summary>
    /// Get obligation statement with all payments
    /// </summary>
    [HttpGet("statement/{obligationId}")]
    [ProducesResponseType(typeof(ObligationStatementDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ObligationStatementDto>> GetObligationStatement(
        [FromRoute] Guid obligationId,
        CancellationToken cancellationToken)
    {
        var query = new GetObligationStatementQuery(obligationId);

        var result = await _mediator.Send(query, cancellationToken);

        return Ok(result);
    }
}
