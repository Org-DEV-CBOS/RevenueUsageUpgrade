using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RevenuUsage.API.Exports;
using RevenuUsage.Application.Common;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Application.Features.Reporting;
using RevenuUsage.Domain.Entities;

namespace RevenuUsage.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class ReportsController : ControllerBase
{
    private const string BalancesTitle = "Correspondent's Balances";
    private const string ExcelContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private readonly IMediator _mediator;

    public ReportsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(DashboardSummary), StatusCodes.Status200OK)]
    public async Task<ActionResult<DashboardSummary>> Dashboard(DateTime? asOfDate, CancellationToken ct)
    {
        return Ok(await _mediator.Send(new GetDashboardQuery(asOfDate ?? DateTime.Today), ct));
    }

    [HttpGet("foreign-reserve")]
    public async Task<ActionResult> Reserve(
        DateTime startDate,
        DateTime endDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        CancellationToken ct = default)
    {
        var rows = await _mediator.Send(new GetForeignReserveReportQuery(startDate, endDate), ct);
        return Ok(Paging.Create(rows, page, pageSize, pageNumber));
    }

    [HttpGet("obligations")]
    public async Task<ActionResult> Obligations(
        DateTime? startDate,
        DateTime? endDate,
        string? status,
        Guid? clientTypeId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] int pageNumber = 0,
        CancellationToken ct = default)
    {
        var rows = await _mediator.Send(new GetObligationReportQuery(startDate, endDate, status, clientTypeId), ct);
        return Ok(Paging.Create(rows, page, pageSize, pageNumber, ObligationTotals));
    }

    /// <summary>A currency column per holding, with per-currency totals and a USD summary.</summary>
    [HttpGet("correspondent-balances")]
    [ProducesResponseType(typeof(CorrespondentBalanceReportDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<CorrespondentBalanceReportDto>> CorrespondentBalances(
        DateTime? asOfDate,
        string? searchValue,
        CancellationToken ct = default) =>
        Ok(await _mediator.Send(new GetCorrespondentBalanceReportQuery(asOfDate, searchValue), ct));

    /// <summary>One row per correspondent, every currency they hold converted to USD.</summary>
    [HttpGet("correspondent-total-balances")]
    [ProducesResponseType(typeof(CorrespondentBalanceReportDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<CorrespondentBalanceReportDto>> CorrespondentTotalBalances(
        DateTime? asOfDate,
        string? searchValue,
        CancellationToken ct = default) =>
        Ok(await _mediator.Send(new GetCorrespondentBalanceReportQuery(asOfDate, searchValue, InUsd: true), ct));

    [HttpGet("foreign-reserve/export")]
    public async Task<IActionResult> ExportForeignReserve(
        DateTime startDate,
        DateTime endDate,
        [FromQuery] string format = "xlsx",
        CancellationToken ct = default)
    {
        var rows = (await _mediator.Send(new GetForeignReserveReportQuery(startDate, endDate), ct)).ToList();

        return IsPdf(format)
            ? Pdf(ReportExportBuilder.BuildForeignReservePdf(rows), "foreign-reserve")
            : Excel(ReportExportBuilder.BuildForeignReserveExcel(rows), "foreign-reserve");
    }

    [HttpGet("obligations/export")]
    public async Task<IActionResult> ExportObligations(
        DateTime? startDate,
        DateTime? endDate,
        string? status,
        Guid? clientTypeId,
        [FromQuery] string format = "xlsx",
        [FromQuery] string lang = "en",
        CancellationToken ct = default)
    {
        var rows = (await _mediator.Send(new GetObligationReportQuery(startDate, endDate, status, clientTypeId), ct)).ToList();
        var arabic = IsArabic(lang);

        return IsPdf(format)
            ? Pdf(ReportExportBuilder.BuildObligationPdf(rows, arabic), "obligations")
            : Excel(ReportExportBuilder.BuildObligationExcel(rows, arabic), "obligations");
    }

    [HttpGet("correspondent-balances/export")]
    public async Task<IActionResult> ExportCorrespondentBalances(
        DateTime? asOfDate,
        string? searchValue,
        [FromQuery] string format = "xlsx",
        CancellationToken ct = default)
    {
        var report = await _mediator.Send(new GetCorrespondentBalanceReportQuery(asOfDate, searchValue), ct);

        return IsPdf(format)
            ? Pdf(ReportExportBuilder.BuildCorrespondentBalancePdf(report, BalancesTitle), "correspondent-balances")
            : Excel(ReportExportBuilder.BuildCorrespondentBalanceExcel(report), "correspondent-balances");
    }

    [HttpGet("correspondent-total-balances/export")]
    public async Task<IActionResult> ExportCorrespondentTotalBalances(
        DateTime? asOfDate,
        string? searchValue,
        [FromQuery] string format = "xlsx",
        CancellationToken ct = default)
    {
        var report = await _mediator.Send(new GetCorrespondentBalanceReportQuery(asOfDate, searchValue, InUsd: true), ct);

        return IsPdf(format)
            ? Pdf(ReportExportBuilder.BuildCorrespondentBalancePdf(report, BalancesTitle), "correspondent-total-balances")
            : Excel(ReportExportBuilder.BuildCorrespondentBalanceExcel(report), "correspondent-total-balances");
    }

    /// <summary>
    /// Footed over every obligation the filters match, not just the page on screen.
    /// Obligations with no published USD rate are left out; the report says so.
    /// </summary>
    private static IReadOnlyDictionary<string, decimal> ObligationTotals(IReadOnlyList<ObligationReportRow> rows) =>
        new Dictionary<string, decimal>
        {
            ["remainingAmountUsd"] = rows.Where(row => row.RemainingAmountUsd.HasValue).Sum(row => row.RemainingAmountUsd!.Value)
        };

    private FileContentResult Pdf(byte[] content, string namePrefix) =>
        File(content, "application/pdf", FileName(namePrefix, "pdf"));

    private FileContentResult Excel(byte[] content, string namePrefix) =>
        File(content, ExcelContentType, FileName(namePrefix, "xlsx"));

    private static string FileName(string prefix, string extension) =>
        $"{prefix}-{DateTime.UtcNow:yyyyMMdd_HHmmss}.{extension}";

    private static bool IsPdf(string format) => format.Equals("pdf", StringComparison.OrdinalIgnoreCase);

    private static bool IsArabic(string lang) => lang.StartsWith("ar", StringComparison.OrdinalIgnoreCase);
}
