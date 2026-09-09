using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RevenuUsage.Application.Common;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Application.Features.Obligations;
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
        [FromQuery] Guid? clientTypeId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetObligationsQuery(activeOnly, clientTypeId), ct);
        var items = Paging.Search(result, search, x =>
            [x.ClientNameEn, x.ClientNameAr, x.ClientTypeNameEn, x.ClientTypeNameAr, x.ObligationTypeNameEn, x.ObligationTypeNameAr, x.CurrencyNameEn, x.CurrencyNameAr, x.CurrencySymbol, x.ReferenceNo, x.Notes, x.BankName, x.CompanyName]);
        return Ok(Paging.Create(items, page, pageSize, pageNumber));
    }
    [HttpPost] public async Task<ActionResult> Create(CreateObligationCommand command,CancellationToken ct)=>Ok(new{obligationId=await _mediator.Send(command,ct)});
    [HttpDelete("{id:guid}")] public async Task<ActionResult> Delete(Guid id,[FromBody]DeleteMasterDataDto dto,CancellationToken ct){await _mediator.Send(new DeleteObligationCommand(id,dto.DeletedBy??string.Empty),ct);return NoContent();}

    #region Client Types

    /* Renaming and deactivating only. See ObligationTypeRequests for why there is no create. */

    [HttpGet("client-types")]
    public async Task<ActionResult<PagedResponse<ClientTypeDto>>> GetClientTypes(
        [FromQuery] bool activeOnly = true,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        CancellationToken ct = default) =>
        Ok(Paging.Create(await _mediator.Send(new GetClientTypesQuery(activeOnly), ct), page, pageSize, pageNumber));

    [HttpPut("client-types/{id:guid}")]
    public async Task<ActionResult> UpdateClientType(Guid id, [FromBody] SaveClientTypeDto model, CancellationToken ct)
    {
        await _mediator.Send(new UpdateClientTypeCommand(id, model), ct);
        return NoContent();
    }

    #endregion

    #region Obligation Types

    [HttpGet("types")]
    public async Task<ActionResult<PagedResponse<ObligationTypeDto>>> GetTypes(
        [FromQuery] bool activeOnly = true,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetObligationTypesQuery(activeOnly), ct);
        var items = Paging.Search(result, search, x =>
            [x.ObligationTypeNameEn, x.ObligationTypeNameAr]);
        return Ok(Paging.Create(items, page, pageSize, pageNumber));
    }

    [HttpPost("types")]
    public async Task<ActionResult> CreateType([FromBody] SaveObligationTypeDto model, CancellationToken ct) =>
        Ok(new { obligationTypeId = await _mediator.Send(new SaveObligationTypeCommand(model with { ObligationTypeId = null }), ct) });

    [HttpPut("types/{id:guid}")]
    public async Task<ActionResult> UpdateType(Guid id, [FromBody] SaveObligationTypeDto model, CancellationToken ct)
    {
        await _mediator.Send(new SaveObligationTypeCommand(model with { ObligationTypeId = id }), ct);
        return NoContent();
    }

    [HttpDelete("types/{id:guid}")]
    public async Task<ActionResult> DeleteType(Guid id, [FromBody] DeleteMasterDataDto model, CancellationToken ct)
    {
        await _mediator.Send(new DeleteObligationTypeCommand(id, model.DeletedBy), ct);
        return NoContent();
    }

    #endregion

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
