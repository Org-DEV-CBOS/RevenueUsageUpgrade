using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RevenuUsage.API.Exports;
using RevenuUsage.Application.Features.Reporting;
using RevenuUsage.Domain.Entities;

namespace RevenuUsage.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class ReportsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReportsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult> Dashboard(DateTime? asOfDate, CancellationToken ct)
    {
        return Ok(await _mediator.Send(new GetDashboardQuery(asOfDate ?? DateTime.Today), ct));
    }

    [HttpGet("foreign-reserve")]
    public async Task<ActionResult> Reserve(DateTime startDate, DateTime endDate, CancellationToken ct)
    {
        return Ok(await _mediator.Send(new GetForeignReserveReportQuery(startDate, endDate), ct));
    }

    [HttpGet("obligations")]
    public async Task<ActionResult> Obligations(DateTime? startDate, DateTime? endDate, string? status, string? clientType, CancellationToken ct)
    {
        return Ok(await _mediator.Send(new GetObligationReportQuery(startDate, endDate, status, clientType), ct));
    }

    [HttpGet("credit-movements")]
    public async Task<ActionResult> CreditMovements(DateTime startDate, DateTime endDate, string? searchValue, CancellationToken ct) =>
        Ok(await _mediator.Send(new GetCreditMovementsReportQuery(startDate, endDate, searchValue), ct));

    [HttpGet("debit-movements")]
    public async Task<ActionResult> DebitMovements(DateTime startDate, DateTime endDate, string? searchValue, CancellationToken ct) =>
        Ok(await _mediator.Send(new GetDebitMovementsReportQuery(startDate, endDate, searchValue), ct));

    [HttpGet("resources")]
    public async Task<ActionResult> Resources(DateTime? startDate, DateTime? endDate, CancellationToken ct) =>
        Ok(await _mediator.Send(new GetResourcesReportQuery(startDate, endDate), ct));

    [HttpGet("correspondent-balances")]
    public async Task<ActionResult> CorrespondentBalances(string? searchValue, CancellationToken ct) =>
        Ok(await _mediator.Send(new GetCorrespondentBalanceReportQuery(searchValue), ct));

    [HttpGet("foreign-reserve/export")]
    public async Task<IActionResult> ExportForeignReserve(
        DateTime startDate,
        DateTime endDate,
        [FromQuery] string format = "xlsx",
        CancellationToken ct = default)
    {
        var rows = (await _mediator.Send(new GetForeignReserveReportQuery(startDate, endDate), ct)).ToList();
        var now = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");

        if (format.Equals("pdf", StringComparison.OrdinalIgnoreCase))
        {
            var pdf = ReportExportBuilder.BuildForeignReservePdf(rows);
            return File(pdf, "application/pdf", $"foreign-reserve-{now}.pdf");
        }

        var excel = ReportExportBuilder.BuildForeignReserveExcel(rows);
        return File(
            excel,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"foreign-reserve-{now}.xlsx");
    }

    [HttpGet("obligations/export")]
    public async Task<IActionResult> ExportObligations(
        DateTime? startDate,
        DateTime? endDate,
        string? status,
        string? clientType,
        [FromQuery] string format = "xlsx",
        CancellationToken ct = default)
    {
        var rows = (await _mediator.Send(new GetObligationReportQuery(startDate, endDate, status, clientType), ct)).ToList();
        var now = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");

        if (format.Equals("pdf", StringComparison.OrdinalIgnoreCase))
        {
            var pdf = ReportExportBuilder.BuildObligationPdf(rows);
            return File(pdf, "application/pdf", $"obligations-{now}.pdf");
        }

        var excel = ReportExportBuilder.BuildObligationExcel(rows);
        return File(
            excel,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"obligations-{now}.xlsx");
    }

    [HttpGet("credit-movements/export")]
    public async Task<IActionResult> ExportCreditMovements(
        DateTime startDate,
        DateTime endDate,
        string? searchValue,
        [FromQuery] string format = "xlsx",
        CancellationToken ct = default)
    {
        var rows = (await _mediator.Send(new GetCreditMovementsReportQuery(startDate, endDate, searchValue), ct)).ToList();
        return MovementFile(rows, "Credit Movements", "Resource Type", "credit-movements", format);
    }

    [HttpGet("debit-movements/export")]
    public async Task<IActionResult> ExportDebitMovements(
        DateTime startDate,
        DateTime endDate,
        string? searchValue,
        [FromQuery] string format = "xlsx",
        CancellationToken ct = default)
    {
        var rows = (await _mediator.Send(new GetDebitMovementsReportQuery(startDate, endDate, searchValue), ct)).ToList();
        return MovementFile(rows, "Debit Movements", "Beneficiary", "debit-movements", format);
    }

    [HttpGet("resources/export")]
    public async Task<IActionResult> ExportResources(
        DateTime? startDate,
        DateTime? endDate,
        [FromQuery] string format = "xlsx",
        CancellationToken ct = default)
    {
        var rows = (await _mediator.Send(new GetResourcesReportQuery(startDate, endDate), ct)).ToList();
        var now = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");

        if (IsPdf(format))
            return File(ReportExportBuilder.BuildResourcesPdf(rows), "application/pdf", $"resources-{now}.pdf");

        return ExcelFile(ReportExportBuilder.BuildResourcesExcel(rows), $"resources-{now}.xlsx");
    }

    [HttpGet("correspondent-balances/export")]
    public async Task<IActionResult> ExportCorrespondentBalances(
        string? searchValue,
        [FromQuery] string format = "xlsx",
        CancellationToken ct = default)
    {
        var rows = (await _mediator.Send(new GetCorrespondentBalanceReportQuery(searchValue), ct)).ToList();
        var now = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");

        if (IsPdf(format))
            return File(ReportExportBuilder.BuildCorrespondentBalancePdf(rows), "application/pdf", $"correspondent-balances-{now}.pdf");

        return ExcelFile(ReportExportBuilder.BuildCorrespondentBalanceExcel(rows), $"correspondent-balances-{now}.xlsx");
    }

    private IActionResult MovementFile(
        IReadOnlyList<MovementReportRow> rows,
        string title,
        string groupHeader,
        string fileNamePrefix,
        string format)
    {
        var now = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");

        if (IsPdf(format))
            return File(ReportExportBuilder.BuildMovementPdf(rows, title, groupHeader), "application/pdf", $"{fileNamePrefix}-{now}.pdf");

        return ExcelFile(ReportExportBuilder.BuildMovementExcel(rows, title, groupHeader), $"{fileNamePrefix}-{now}.xlsx");
    }

    private FileContentResult ExcelFile(byte[] content, string fileName) =>
        File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);

    private static bool IsPdf(string format) => format.Equals("pdf", StringComparison.OrdinalIgnoreCase);
}
