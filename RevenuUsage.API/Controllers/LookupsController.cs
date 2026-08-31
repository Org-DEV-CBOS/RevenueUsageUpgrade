using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RevenuUsage.Application.Common;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Application.Features.Lookups.Commands.CreateBank;
using RevenuUsage.Application.Features.Lookups.Commands.CreateCompany;
using RevenuUsage.Application.Features.Lookups.Commands.CreateCountry;
using RevenuUsage.Application.Features.Lookups.Commands.DeleteBank;
using RevenuUsage.Application.Features.Lookups.Commands.DeleteCompany;
using RevenuUsage.Application.Features.Lookups.Commands.DeleteCountry;
using RevenuUsage.Application.Features.Lookups.Commands.UpdateBank;
using RevenuUsage.Application.Features.Lookups.Commands.UpdateCompany;
using RevenuUsage.Application.Features.Lookups.Commands.UpdateCountry;
using RevenuUsage.Application.Features.Lookups.Queries.GetAllBanks;
using RevenuUsage.Application.Features.Lookups.Queries.GetAllCompanies;
using RevenuUsage.Application.Features.Lookups.Queries.GetAllCountries;
using RevenuUsage.Application.Features.Lookups.Queries.GetBankById;
using RevenuUsage.Application.Features.Lookups.Queries.GetCompanyById;
using RevenuUsage.Application.Features.Lookups.Queries.GetCountryById;
using RevenuUsage.Application.Features.MasterData;

namespace RevenuUsage.API.Controllers;

//[Authorize]
[ApiController]
[Route("api/[controller]")]
public class LookupsController : ControllerBase
{
    private readonly IMediator _mediator;

    public LookupsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region Banks

    /// <summary>
    /// Get all banks
    /// </summary>
    [HttpGet("banks")]
    [ProducesResponseType(typeof(PagedResponse<BankDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResponse<BankDto>>> GetAllBanks(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetAllBanksQuery(), cancellationToken);
        var items = Paging.Search(result, search, b => [b.BankNameEn, b.BankNameAr, b.ShortName, b.BankCode]);
        return Ok(Paging.Create(items, page, pageSize, pageNumber));
    }

    /// <summary>
    /// Get bank by ID
    /// </summary>
    [HttpGet("banks/{id}")]
    [ProducesResponseType(typeof(BankDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BankDto>> GetBankById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetBankByIdQuery(id);
        var result = await _mediator.Send(query, cancellationToken);

        if (result == null)
            return NotFound(new { message = "Bank not found" });

        return Ok(result);
    }

    /// <summary>
    /// Create a new bank
    /// </summary>
    [HttpPost("banks")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<Guid>> CreateBank([FromBody] CreateBankDto request, CancellationToken cancellationToken)
    {
        var command = new CreateBankCommand(
            request.BankCode,
            request.BankNameEn,
            request.BankNameAr,
            request.ShortName,
            request.CreatedBy);

        var bankId = await _mediator.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetBankById), new { id = bankId }, bankId);
    }

    /// <summary>
    /// Update an existing bank
    /// </summary>
    [HttpPut("banks/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> UpdateBank(Guid id, [FromBody] UpdateBankDto request, CancellationToken cancellationToken)
    {
        if (id != request.BankId)
            return BadRequest(new { message = "Bank ID mismatch" });

        var command = new UpdateBankCommand(
            request.BankId,
            request.BankCode,
            request.BankNameEn,
            request.BankNameAr,
            request.ShortName,
            request.IsActive,
            request.ModifiedBy);

        await _mediator.Send(command, cancellationToken);

        return Ok(new { message = "Bank updated successfully" });
    }

    /// <summary>
    /// Delete a bank
    /// </summary>
    [HttpDelete("banks/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> DeleteBank(Guid id, [FromBody] DeleteBankDto request, CancellationToken cancellationToken)
    {
        if (id != request.BankId)
            return BadRequest(new { message = "Bank ID mismatch" });

        var command = new DeleteBankCommand(request.BankId, request.DeletedBy);

        await _mediator.Send(command, cancellationToken);

        return Ok(new { message = "Bank deleted successfully" });
    }

    #endregion

    #region Companies

    /// <summary>
    /// Get all companies
    /// </summary>
    [HttpGet("companies")]
    [ProducesResponseType(typeof(PagedResponse<CompanyDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResponse<CompanyDto>>> GetAllCompanies(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetAllCompaniesQuery(), cancellationToken);
        var items = Paging.Search(result, search, c => [c.CompanyNameEn, c.CompanyNameAr, c.ShortName, c.Notes, c.CompanyCode]);
        return Ok(Paging.Create(items, page, pageSize, pageNumber));
    }

    /// <summary>
    /// Get company by ID
    /// </summary>
    [HttpGet("companies/{id}")]
    [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<CompanyDto>> GetCompanyById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetCompanyByIdQuery(id);
        var result = await _mediator.Send(query, cancellationToken);

        if (result == null)
            return NotFound(new { message = "Company not found" });

        return Ok(result);
    }

    /// <summary>
    /// Create a new company
    /// </summary>
    [HttpPost("companies")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<Guid>> CreateCompany([FromBody] CreateCompanyDto request, CancellationToken cancellationToken)
    {
        var command = new CreateCompanyCommand(
            request.CompanyCode,
            request.CompanyNameEn,
            request.CompanyNameAr,
            request.ShortName,
            request.Notes,
            request.CreatedBy);

        var companyId = await _mediator.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetCompanyById), new { id = companyId }, companyId);
    }

    /// <summary>
    /// Update an existing company
    /// </summary>
    [HttpPut("companies/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> UpdateCompany(Guid id, [FromBody] UpdateCompanyDto request, CancellationToken cancellationToken)
    {
        if (id != request.CompanyId)
            return BadRequest(new { message = "Company ID mismatch" });

        var command = new UpdateCompanyCommand(
            request.CompanyId,
            request.CompanyCode,
            request.CompanyNameEn,
            request.CompanyNameAr,
            request.ShortName,
            request.Notes,
            request.IsActive,
            request.ModifiedBy);

        await _mediator.Send(command, cancellationToken);

        return Ok(new { message = "Company updated successfully" });
    }

    /// <summary>
    /// Delete a company
    /// </summary>
    [HttpDelete("companies/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> DeleteCompany(Guid id, [FromBody] DeleteCompanyDto request, CancellationToken cancellationToken)
    {
        if (id != request.CompanyId)
            return BadRequest(new { message = "Company ID mismatch" });

        var command = new DeleteCompanyCommand(request.CompanyId, request.DeletedBy);

        await _mediator.Send(command, cancellationToken);

        return Ok(new { message = "Company deleted successfully" });
    }

    #endregion

    #region Countries

    /// <summary>
    /// Get all countries
    /// </summary>
    [HttpGet("countries")]
    [ProducesResponseType(typeof(PagedResponse<CountryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResponse<CountryDto>>> GetAllCountries(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetAllCountriesQuery(), cancellationToken);
        var items = Paging.Search(result, search, c => [c.CountryNameEn, c.CountryNameAr, c.IsoCode, c.CountryCode]);
        return Ok(Paging.Create(items, page, pageSize, pageNumber));
    }

    /// <summary>
    /// Get country by ID
    /// </summary>
    [HttpGet("countries/{id}")]
    [ProducesResponseType(typeof(CountryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<CountryDto>> GetCountryById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetCountryByIdQuery(id);
        var result = await _mediator.Send(query, cancellationToken);

        if (result == null)
            return NotFound(new { message = "Country not found" });

        return Ok(result);
    }

    /// <summary>
    /// Create a new country
    /// </summary>
    [HttpPost("countries")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<Guid>> CreateCountry([FromBody] CreateCountryDto request, CancellationToken cancellationToken)
    {
        var command = new CreateCountryCommand(
            request.CountryCode,
            request.CountryNameEn,
            request.CountryNameAr,
            request.IsoCode,
            request.CreatedBy);

        var countryId = await _mediator.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetCountryById), new { id = countryId }, countryId);
    }

    /// <summary>
    /// Update an existing country
    /// </summary>
    [HttpPut("countries/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> UpdateCountry(Guid id, [FromBody] UpdateCountryDto request, CancellationToken cancellationToken)
    {
        if (id != request.CountryId)
            return BadRequest(new { message = "Country ID mismatch" });

        var command = new UpdateCountryCommand(
            request.CountryId,
            request.CountryCode,
            request.CountryNameEn,
            request.CountryNameAr,
            request.IsoCode,
            request.IsActive,
            request.ModifiedBy);

        await _mediator.Send(command, cancellationToken);

        return Ok(new { message = "Country updated successfully" });
    }

    /// <summary>
    /// Delete a country
    /// </summary>
    [HttpDelete("countries/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> DeleteCountry(Guid id, [FromBody] DeleteCountryDto request, CancellationToken cancellationToken)
    {
        if (id != request.CountryId)
            return BadRequest(new { message = "Country ID mismatch" });

        var command = new DeleteCountryCommand(request.CountryId, request.DeletedBy);

        await _mediator.Send(command, cancellationToken);

        return Ok(new { message = "Country deleted successfully" });
    }

    #endregion

    #region Operation Types

    [HttpGet("operation-types")]
    public async Task<ActionResult<PagedResponse<OperationTypeDto>>> GetOperationTypes(
        [FromQuery] bool activeOnly = true,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        CancellationToken ct = default) =>
        Ok(Paging.Create(await _mediator.Send(new GetOperationTypesQuery(activeOnly), ct), page, pageSize, pageNumber));

    [HttpPost("operation-types")]
    public async Task<ActionResult> CreateOperationType([FromBody] SaveOperationTypeDto model, CancellationToken ct) =>
        Ok(new { operationTypeId = await _mediator.Send(new SaveOperationTypeCommand(model with { OperationTypeId = null }), ct) });

    [HttpPut("operation-types/{id:guid}")]
    public async Task<ActionResult> UpdateOperationType(Guid id, [FromBody] SaveOperationTypeDto model, CancellationToken ct)
    {
        await _mediator.Send(new SaveOperationTypeCommand(model with { OperationTypeId = id }), ct);
        return NoContent();
    }

    [HttpDelete("operation-types/{id:guid}")]
    public async Task<ActionResult> DeleteOperationType(Guid id, [FromBody] DeleteMasterDataDto model, CancellationToken ct)
    {
        await _mediator.Send(new DeleteOperationTypeCommand(id, model.DeletedBy), ct);
        return NoContent();
    }

    #endregion

    #region Usage Types

    [HttpGet("usage-types")]
    public async Task<ActionResult<PagedResponse<UsageTypeDto>>> GetUsageTypes(
        [FromQuery] bool activeOnly = true,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        CancellationToken ct = default) =>
        Ok(Paging.Create(await _mediator.Send(new GetUsageTypesQuery(activeOnly), ct), page, pageSize, pageNumber));

    [HttpPost("usage-types")]
    public async Task<ActionResult> CreateUsageType([FromBody] SaveUsageTypeDto model, CancellationToken ct) =>
        Ok(new { usageTypeId = await _mediator.Send(new SaveUsageTypeCommand(model with { UsageTypeId = null }), ct) });

    [HttpPut("usage-types/{id:guid}")]
    public async Task<ActionResult> UpdateUsageType(Guid id, [FromBody] SaveUsageTypeDto model, CancellationToken ct)
    {
        await _mediator.Send(new SaveUsageTypeCommand(model with { UsageTypeId = id }), ct);
        return NoContent();
    }

    [HttpDelete("usage-types/{id:guid}")]
    public async Task<ActionResult> DeleteUsageType(Guid id, [FromBody] DeleteMasterDataDto model, CancellationToken ct)
    {
        await _mediator.Send(new DeleteUsageTypeCommand(id, model.DeletedBy), ct);
        return NoContent();
    }

    #endregion
}
