using MediatR;
using Microsoft.AspNetCore.Mvc;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Application.Features.Currencies.Commands.AddExchangeRate;
using RevenuUsage.Application.Features.Currencies.Commands.DeleteExchangeRate;
using RevenuUsage.Application.Features.Currencies.Queries.GetCorrespondentBalancesByCurrency;
using RevenuUsage.Application.Features.Currencies.Queries.GetCurrencyBalances;
using RevenuUsage.Application.Features.Currencies.Queries.GetDailyValuation;
using RevenuUsage.Application.Features.Currencies.Queries.GetExchangeRate;
using RevenuUsage.Application.Features.MasterData;

namespace RevenuUsage.API.Controllers;

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
    public async Task<ActionResult<IReadOnlyList<CurrencyDto>>> GetAll([FromQuery] bool activeOnly=true,CancellationToken ct=default)=>Ok(await _mediator.Send(new GetCurrenciesQuery(activeOnly),ct));
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
    [ProducesResponseType(typeof(IEnumerable<CurrencyBalanceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<CurrencyBalanceDto>>> GetCurrencyBalances(
        CancellationToken cancellationToken)
    {
        var query = new GetCurrencyBalancesQuery();

        var result = await _mediator.Send(query, cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Get daily valuation (optionally filtered by date)
    /// </summary>
    [HttpGet("daily-valuation")]
    [ProducesResponseType(typeof(IEnumerable<DailyValuationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<DailyValuationDto>>> GetDailyValuation(
        [FromQuery] DateTime? valuationDate,
        CancellationToken cancellationToken)
    {
        var query = new GetDailyValuationQuery(valuationDate);

        var result = await _mediator.Send(query, cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Get exchange rates with optional filters
    /// </summary>
    [HttpGet("exchange-rates")]
    [ProducesResponseType(typeof(IEnumerable<ExchangeRateDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<ExchangeRateDto>>> GetExchangeRate(
        [FromQuery] DateTime? rateDate,
        [FromQuery] Guid? fromCurrencyId,
        [FromQuery] Guid? toCurrencyId,
        CancellationToken cancellationToken)
    {
        var query = new GetExchangeRateQuery(rateDate, fromCurrencyId, toCurrencyId);

        var result = await _mediator.Send(query, cancellationToken);

        return Ok(result);
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
    [ProducesResponseType(typeof(IEnumerable<CorrespondentBalanceByCurrencyDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<CorrespondentBalanceByCurrencyDto>>> GetCorrespondentBalancesByCurrency(
        CancellationToken cancellationToken)
    {
        var query = new GetCorrespondentBalancesByCurrencyQuery();

        var result = await _mediator.Send(query, cancellationToken);

        return Ok(result);
    }
}
