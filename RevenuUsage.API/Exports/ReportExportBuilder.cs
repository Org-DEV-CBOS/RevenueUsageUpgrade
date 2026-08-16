using ClosedXML.Excel;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using RevenuUsage.Domain.Entities;

namespace RevenuUsage.API.Exports;

public static class ReportExportBuilder
{
    public static byte[] BuildForeignReserveExcel(IReadOnlyList<ForeignReserveReportRow> rows)
    {
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("ForeignReserve");

        var headers = new[]
        {
            "Report Date",
            "Correspondent Balances USD",
            "Cash In Hand USD",
            "Gold Value USD",
            "Deposits USD",
            "Resources USD",
            "Usages USD",
            "Grand Total USD"
        };

        for (var i = 0; i < headers.Length; i++)
            ws.Cell(1, i + 1).Value = headers[i];

        for (var i = 0; i < rows.Count; i++)
        {
            var row = rows[i];
            var r = i + 2;
            ws.Cell(r, 1).Value = row.ReportDate;
            ws.Cell(r, 2).Value = row.CorrespondentBalancesUsd;
            ws.Cell(r, 3).Value = row.CashInHandUsd;
            ws.Cell(r, 4).Value = row.GoldValueUsd;
            ws.Cell(r, 5).Value = row.DepositsUsd;
            ws.Cell(r, 6).Value = row.ResourcesUsd;
            ws.Cell(r, 7).Value = row.UsagesUsd;
            ws.Cell(r, 8).Value = row.GrandTotalUsd;
        }

        ws.Column(1).Style.DateFormat.Format = "yyyy-mm-dd";
        for (var col = 2; col <= 8; col++)
            ws.Column(col).Style.NumberFormat.Format = "#,##0.00";

        ws.Range(1, 1, 1, headers.Length).Style.Font.Bold = true;
        ws.Range(1, 1, rows.Count + 1, headers.Length).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        ws.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }

    public static byte[] BuildObligationExcel(IReadOnlyList<ObligationReportRow> rows)
    {
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Obligations");

        var headers = new[]
        {
            "Client Name",
            "Client Type",
            "Currency",
            "Total Amount",
            "Paid Amount",
            "Remaining Amount",
            "Due Date",
            "Status"
        };

        for (var i = 0; i < headers.Length; i++)
            ws.Cell(1, i + 1).Value = headers[i];

        for (var i = 0; i < rows.Count; i++)
        {
            var row = rows[i];
            var r = i + 2;
            ws.Cell(r, 1).Value = row.ClientName;
            ws.Cell(r, 2).Value = row.ClientType;
            ws.Cell(r, 3).Value = row.CurrencyCode;
            ws.Cell(r, 4).Value = row.TotalAmount;
            ws.Cell(r, 5).Value = row.PaidAmount;
            ws.Cell(r, 6).Value = row.RemainingAmount;
            ws.Cell(r, 7).Value = row.DueDate;
            ws.Cell(r, 8).Value = row.Status;
        }

        for (var col = 4; col <= 6; col++)
            ws.Column(col).Style.NumberFormat.Format = "#,##0.00";
        ws.Column(7).Style.DateFormat.Format = "yyyy-mm-dd";

        ws.Range(1, 1, 1, headers.Length).Style.Font.Bold = true;
        ws.Range(1, 1, rows.Count + 1, headers.Length).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        ws.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }

    public static byte[] BuildForeignReservePdf(IReadOnlyList<ForeignReserveReportRow> rows)
    {
        return Document.Create(document =>
        {
            document.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(20);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Text("Foreign Reserve Report").SemiBold().FontSize(16);

                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.ConstantColumn(80);
                        for (var i = 0; i < 7; i++) columns.RelativeColumn();
                    });

                    AddCell(table, "Report Date", true);
                    AddCell(table, "Correspondent Balances", true);
                    AddCell(table, "Cash In Hand", true);
                    AddCell(table, "Gold Value", true);
                    AddCell(table, "Deposits", true);
                    AddCell(table, "Resources", true);
                    AddCell(table, "Usages", true);
                    AddCell(table, "Grand Total", true);

                    foreach (var row in rows)
                    {
                        AddCell(table, row.ReportDate.ToString("yyyy-MM-dd"));
                        AddCell(table, row.CorrespondentBalancesUsd.ToString("N2"));
                        AddCell(table, row.CashInHandUsd.ToString("N2"));
                        AddCell(table, row.GoldValueUsd.ToString("N2"));
                        AddCell(table, row.DepositsUsd.ToString("N2"));
                        AddCell(table, row.ResourcesUsd.ToString("N2"));
                        AddCell(table, row.UsagesUsd.ToString("N2"));
                        AddCell(table, row.GrandTotalUsd.ToString("N2"));
                    }
                });
            });
        }).GeneratePdf();
    }

    public static byte[] BuildObligationPdf(IReadOnlyList<ObligationReportRow> rows)
    {
        return Document.Create(document =>
        {
            document.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(20);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Text("Obligations Report").SemiBold().FontSize(16);

                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(2);
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                    });

                    AddCell(table, "Client Name", true);
                    AddCell(table, "Client Type", true);
                    AddCell(table, "Currency", true);
                    AddCell(table, "Total", true);
                    AddCell(table, "Paid", true);
                    AddCell(table, "Remaining", true);
                    AddCell(table, "Due Date", true);
                    AddCell(table, "Status", true);

                    foreach (var row in rows)
                    {
                        AddCell(table, row.ClientName);
                        AddCell(table, row.ClientType);
                        AddCell(table, row.CurrencyCode);
                        AddCell(table, row.TotalAmount.ToString("N2"));
                        AddCell(table, row.PaidAmount.ToString("N2"));
                        AddCell(table, row.RemainingAmount.ToString("N2"));
                        AddCell(table, row.DueDate?.ToString("yyyy-MM-dd") ?? string.Empty);
                        AddCell(table, row.Status);
                    }
                });
            });
        }).GeneratePdf();
    }

    public static byte[] BuildMovementExcel(IReadOnlyList<MovementReportRow> rows, string title, string groupHeader)
    {
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add(SheetName(title));

        ws.Cell(1, 1).Value = groupHeader;
        ws.Cell(1, 2).Value = "Total Amount";

        for (var i = 0; i < rows.Count; i++)
        {
            ws.Cell(i + 2, 1).Value = rows[i].GroupName;
            ws.Cell(i + 2, 2).Value = rows[i].TotalAmount;
        }

        var totalRow = rows.Count + 2;
        ws.Cell(totalRow, 1).Value = "Total";
        ws.Cell(totalRow, 2).Value = rows.Sum(x => x.TotalAmount);
        ws.Row(totalRow).Style.Font.Bold = true;

        ws.Column(2).Style.NumberFormat.Format = "#,##0.00";
        ws.Row(1).Style.Font.Bold = true;
        ws.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }

    public static byte[] BuildMovementPdf(IReadOnlyList<MovementReportRow> rows, string title, string groupHeader)
    {
        return BuildSimplePdf(
            title,
            new[] { groupHeader, "Total Amount" },
            rows.Select(row => new[] { row.GroupName, row.TotalAmount.ToString("N2") }).ToList(),
            new[] { "Total", rows.Sum(x => x.TotalAmount).ToString("N2") });
    }

    public static byte[] BuildResourcesExcel(IReadOnlyList<ResourceSummaryReportRow> rows)
    {
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Resources");

        ws.Cell(1, 1).Value = "Resource Type";
        ws.Cell(1, 2).Value = "Total Amount";

        for (var i = 0; i < rows.Count; i++)
        {
            ws.Cell(i + 2, 1).Value = rows[i].ResourceTypeName;
            ws.Cell(i + 2, 2).Value = rows[i].TotalAmount;
        }

        var totalRow = rows.Count + 2;
        ws.Cell(totalRow, 1).Value = "Total";
        ws.Cell(totalRow, 2).Value = rows.Sum(x => x.TotalAmount);
        ws.Row(totalRow).Style.Font.Bold = true;

        ws.Column(2).Style.NumberFormat.Format = "#,##0.00";
        ws.Row(1).Style.Font.Bold = true;
        ws.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }

    public static byte[] BuildResourcesPdf(IReadOnlyList<ResourceSummaryReportRow> rows)
    {
        return BuildSimplePdf(
            "Resources Summary",
            new[] { "Resource Type", "Total Amount" },
            rows.Select(row => new[] { row.ResourceTypeName, row.TotalAmount.ToString("N2") }).ToList(),
            new[] { "Total", rows.Sum(x => x.TotalAmount).ToString("N2") });
    }

    public static byte[] BuildCorrespondentBalanceExcel(IReadOnlyList<CorrespondentBalanceReportRow> rows)
    {
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Balances");

        var headers = new[] { "Correspondent", "Currency", "Account Number", "Current Balance" };
        for (var i = 0; i < headers.Length; i++)
            ws.Cell(1, i + 1).Value = headers[i];

        for (var i = 0; i < rows.Count; i++)
        {
            var row = rows[i];
            var r = i + 2;
            ws.Cell(r, 1).Value = row.CorrespondentNameEn;
            ws.Cell(r, 2).Value = row.CurrencyCode;
            ws.Cell(r, 3).Value = row.AccountNumber;
            ws.Cell(r, 4).Value = row.CurrentBalance;
        }

        ws.Column(4).Style.NumberFormat.Format = "#,##0.00";
        ws.Range(1, 1, 1, headers.Length).Style.Font.Bold = true;
        ws.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }

    public static byte[] BuildCorrespondentBalancePdf(IReadOnlyList<CorrespondentBalanceReportRow> rows)
    {
        return BuildSimplePdf(
            "Correspondent Balances",
            new[] { "Correspondent", "Currency", "Account Number", "Current Balance" },
            rows.Select(row => new[]
            {
                row.CorrespondentNameEn,
                row.CurrencyCode,
                row.AccountNumber,
                row.CurrentBalance.ToString("N2")
            }).ToList());
    }

    private static byte[] BuildSimplePdf(
        string title,
        IReadOnlyList<string> headers,
        IReadOnlyList<string[]> dataRows,
        IReadOnlyList<string>? footerRow = null)
    {
        return Document.Create(document =>
        {
            document.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(20);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Text(title).SemiBold().FontSize(16);

                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(2);
                        for (var i = 1; i < headers.Count; i++) columns.RelativeColumn();
                    });

                    foreach (var header in headers)
                        AddCell(table, header, true);

                    foreach (var row in dataRows)
                        foreach (var value in row)
                            AddCell(table, value);

                    if (footerRow is not null)
                        foreach (var value in footerRow)
                            AddCell(table, value, true);
                });
            });
        }).GeneratePdf();
    }

    private static string SheetName(string title)
    {
        var name = new string(title.Where(c => !"[]:*?/\\".Contains(c)).ToArray()).Trim();
        return name.Length > 31 ? name[..31] : name;
    }

    private static void AddCell(TableDescriptor table, string value, bool header = false)
    {
        var cell = table.Cell().Border(1).Padding(4).Background(header ? Colors.Grey.Lighten2 : Colors.White);
        if (header)
        {
            cell.Text(value).SemiBold();
            return;
        }

        cell.Text(value);
    }
}
