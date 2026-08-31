using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RevenuUsage.Application.Common;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Application.Features.Currencies.Commands.AddExchangeRate;
using RevenuUsage.Application.Features.Currencies.Commands.DeleteExchangeRate;
using RevenuUsage.Application.Features.Currencies.Queries.GetCorrespondentBalancesByCurrency;
using RevenuUsage.Application.Features.Currencies.Queries.GetCurrencyBalances;
using RevenuUsage.Application.Features.Currencies.Queries.GetDailyValuation;
using RevenuUsage.Application.Features.Currencies.Queries.GetExchangeRate;
using RevenuUsage.Application.Features.MasterData;

namespace RevenuUsage.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CurrenciesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CurrenciesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<CurrencyDto>>> GetAll(
        [FromQuery] bool activeOnly = true,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        CancellationToken ct = default) =>
        Ok(Paging.Create(await _mediator.Send(new GetCurrenciesQuery(activeOnly), ct), page, pageSize, pageNumber));
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] SaveCurrencyDto model,CancellationToken ct)=>Ok(new{currencyId=await _mediator.Send(new SaveCurrencyCommand(model with{CurrencyId=null}),ct)});
    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id,[FromBody] SaveCurrencyDto model,CancellationToken ct){await _mediator.Send(new SaveCurrencyCommand(model with{CurrencyId=id}),ct);return NoContent();}
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id,[FromBody] DeleteMasterDataDto model,CancellationToken ct){await _mediator.Send(new DeleteCurrencyCommand(id,model.DeletedBy),ct);return NoContent();}

    /// <summary>
    /// Get balances per currency
    /// </summary>
    [HttpGet("balances")]
    [ProducesResponseType(typeof(PagedResponse<CurrencyBalanceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResponse<CurrencyBalanceDto>>> GetCurrencyBalances(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetCurrencyBalancesQuery(), cancellationToken);
        return Ok(Paging.Create(result, page, pageSize, pageNumber));
    }

    /// <summary>
    /// Get daily valuation (optionally filtered by date)
    /// </summary>
    [HttpGet("daily-valuation")]
    [ProducesResponseType(typeof(PagedResponse<DailyValuationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResponse<DailyValuationDto>>> GetDailyValuation(
        [FromQuery] DateTime? valuationDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetDailyValuationQuery(valuationDate), cancellationToken);
        return Ok(Paging.Create(result, page, pageSize, pageNumber));
    }

    /// <summary>
    /// Get exchange rates with optional filters
    /// </summary>
    [HttpGet("exchange-rates")]
    [ProducesResponseType(typeof(PagedResponse<ExchangeRateDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResponse<ExchangeRateDto>>> GetExchangeRate(
        [FromQuery] DateTime? rateDate,
        [FromQuery] Guid? fromCurrencyId,
        [FromQuery] Guid? toCurrencyId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetExchangeRateQuery(rateDate, fromCurrencyId, toCurrencyId), cancellationToken);
        return Ok(Paging.Create(result, page, pageSize, pageNumber));
    }

    /// <summary>
    /// Add a new exchange rate
    /// </summary>
    [HttpPost("exchange-rates")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> AddExchangeRate(
        [FromBody] AddExchangeRateDto request,
        CancellationToken cancellationToken)
    {
        var command = new AddExchangeRateCommand(
            request.RateDate,
            request.FromCurrencyId,
            request.ToCurrencyId,
            request.RateValue,
            request.CreatedBy);

        await _mediator.Send(command, cancellationToken);

        return Ok(new { message = "Exchange rate added successfully" });
    }

    /// <summary>
    /// Delete an exchange rate
    /// </summary>
    [HttpDelete("exchange-rates/{exchangeRateId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> DeleteExchangeRate(
        [FromRoute] Guid exchangeRateId,
        [FromBody] DeleteExchangeRateDto request,
        CancellationToken cancellationToken)
    {
        var command = new DeleteExchangeRateCommand(exchangeRateId, request.DeletedBy);

        await _mediator.Send(command, cancellationToken);

        return Ok(new { message = "Exchange rate deleted successfully" });
    }

    /// <summary>
    /// Get correspondent balances grouped by currency
    /// </summary>
    [HttpGet("correspondent-balances")]
    [ProducesResponseType(typeof(PagedResponse<CorrespondentBalanceByCurrencyDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResponse<CorrespondentBalanceByCurrencyDto>>> GetCorrespondentBalancesByCurrency(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetCorrespondentBalancesByCurrencyQuery(), cancellationToken);
        return Ok(Paging.Create(result, page, pageSize, pageNumber));
    }
}
