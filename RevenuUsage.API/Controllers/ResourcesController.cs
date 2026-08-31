using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RevenuUsage.Application.Common;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Application.Features.Resources.Commands.AddResourceToCorrespondentAccount;
using RevenuUsage.Application.Features.Resources.Commands.DeleteResource;
using RevenuUsage.Application.Features.Resources.Queries.GetResourceStatement;
using RevenuUsage.Application.Features.MasterData;

namespace RevenuUsage.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ResourcesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ResourcesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("types")]
    public async Task<ActionResult<PagedResponse<ResourceTypeDto>>> GetTypes(
        [FromQuery] bool activeOnly = true,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        CancellationToken ct = default) =>
        Ok(Paging.Create(await _mediator.Send(new GetResourceTypesQuery(activeOnly), ct), page, pageSize, pageNumber));
    [HttpPost("types")]
    public async Task<ActionResult> CreateType([FromBody] SaveResourceTypeDto model,CancellationToken ct)=>Ok(new{resourceTypeId=await _mediator.Send(new SaveResourceTypeCommand(model with{ResourceTypeId=null}),ct)});
    [HttpPut("types/{id:guid}")]
    public async Task<ActionResult> UpdateType(Guid id,[FromBody] SaveResourceTypeDto model,CancellationToken ct){await _mediator.Send(new SaveResourceTypeCommand(model with{ResourceTypeId=id}),ct);return NoContent();}
    [HttpDelete("types/{id:guid}")]
    public async Task<ActionResult> DeleteType(Guid id,[FromBody] DeleteMasterDataDto model,CancellationToken ct){await _mediator.Send(new DeleteResourceTypeCommand(id,model.DeletedBy),ct);return NoContent();}

    /// <summary>
    /// Add a resource to a correspondent account
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> AddResourceToCorrespondentAccount(
        [FromBody] AddResourceToCorrespondentAccountDto request,
        CancellationToken cancellationToken)
    {
        var command = new AddResourceToCorrespondentAccountCommand(
            request.ResourceDate,
            request.CorrespondentAccountId,
            request.Amount,
            request.ResourceTypeId,
            request.Notes,
            request.CreatedBy);

        await _mediator.Send(command, cancellationToken);

        return Ok(new { message = "Resource added successfully" });
    }

    /// <summary>
    /// Get resource statement for a correspondent account
    /// </summary>
    [HttpGet("statement/{correspondentAccountId}")]
    [ProducesResponseType(typeof(PagedResponse<ResourceStatementDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResponse<ResourceStatementDto>>> GetResourceStatement(
        [FromRoute] Guid correspondentAccountId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new GetResourceStatementQuery(correspondentAccountId, startDate, endDate),
            cancellationToken);
        return Ok(Paging.Create(result, page, pageSize, pageNumber));
    }

    /// <summary>
    /// Soft-delete a resource
    /// </summary>
    [HttpDelete("{resourceId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> DeleteResource(
        [FromRoute] Guid resourceId,
        [FromBody] DeleteResourceDto request,
        CancellationToken cancellationToken)
    {
        var command = new DeleteResourceCommand(resourceId, request.DeletedBy);

        await _mediator.Send(command, cancellationToken);

        return Ok(new { message = "Resource deleted successfully" });
    }
}

