using ClosedXML.Excel;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Domain.Entities;

namespace RevenuUsage.API.Exports;

public static class ReportExportBuilder
{
    /// <summary>Nothing held reads as a dash, the way the printed reports have always shown it.</summary>
    private const string Nil = "-";

    /// <summary>Positive; negative; zero as a dash.</summary>
    private const string DashOnZeroFormat = "#,##0.00;-#,##0.00;\"-\"";

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

        return Save(workbook);
    }

    public static byte[] BuildForeignReservePdf(IReadOnlyList<ForeignReserveReportRow> rows)
    {
        return ReportBranding.Document("Foreign Reserve", content =>
        {
            content.Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(70);
                    for (var i = 0; i < 7; i++) columns.RelativeColumn();
                });

                Head(table, "Report Date");
                Head(table, "Correspondent Balances");
                Head(table, "Cash In Hand");
                Head(table, "Gold Value");
                Head(table, "Deposits");
                Head(table, "Resources");
                Head(table, "Usages");
                Head(table, "Grand Total");

                foreach (var row in rows)
                {
                    Text(table, row.ReportDate.ToString("yyyy-MM-dd"));
                    Money(table, row.CorrespondentBalancesUsd);
                    Money(table, row.CashInHandUsd);
                    Money(table, row.GoldValueUsd);
                    Money(table, row.DepositsUsd);
                    Money(table, row.ResourcesUsd);
                    Money(table, row.UsagesUsd);
                    Money(table, row.GrandTotalUsd);
                }
            });
        }, landscape: true);
    }

    public static byte[] BuildObligationExcel(IReadOnlyList<ObligationReportRow> rows, bool arabic = false)
    {
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Obligations");

        var headers = new[] { "Client Name", "Ccy", "Total Amounts", "Paid Amounts", "Remaining", "Remaining in USD" };
        for (var i = 0; i < headers.Length; i++)
            ws.Cell(1, i + 1).Value = headers[i];

        for (var i = 0; i < rows.Count; i++)
        {
            var row = rows[i];
            var r = i + 2;
            ws.Cell(r, 1).Value = ClientName(row, arabic);
            ws.Cell(r, 2).Value = row.CurrencySymbol ?? row.CurrencyCode;
            ws.Cell(r, 3).Value = row.TotalAmount;
            ws.Cell(r, 4).Value = row.PaidAmount;
            ws.Cell(r, 5).Value = row.RemainingAmount;

            // Left blank where the currency has no published rate, rather than shown as
            // a zero that would quietly drag the total down.
            if (row.RemainingAmountUsd.HasValue)
                ws.Cell(r, 6).Value = row.RemainingAmountUsd.Value;
        }

        var totalRow = rows.Count + 2;
        ws.Cell(totalRow, 1).Value = "Total";
        ws.Cell(totalRow, 6).Value = RemainingUsdTotal(rows);
        ws.Row(totalRow).Style.Font.Bold = true;

        for (var col = 3; col <= 6; col++)
            ws.Column(col).Style.NumberFormat.Format = "#,##0.00";

        ws.Range(1, 1, 1, headers.Length).Style.Font.Bold = true;
        ws.Range(1, 1, totalRow, headers.Length).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        ws.Columns().AdjustToContents();

        return Save(workbook);
    }

    public static byte[] BuildObligationPdf(IReadOnlyList<ObligationReportRow> rows, bool arabic = false)
    {
        return ReportBranding.Document("CBOS Obligations", content =>
        {
            content.Column(column =>
            {
                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3);
                        columns.ConstantColumn(40);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                    });

                    Head(table, "Client Name");
                    Head(table, "Ccy");
                    Head(table, "Total Amounts");
                    Head(table, "Paid Amounts");
                    Head(table, "Remaining");
                    Head(table, "Remaining in USD");

                    foreach (var row in rows)
                    {
                        Text(table, ClientName(row, arabic));
                        Text(table, row.CurrencySymbol ?? row.CurrencyCode);
                        Money(table, row.TotalAmount);
                        Money(table, row.PaidAmount);
                        Money(table, row.RemainingAmount);
                        Money(table, row.RemainingAmountUsd);
                    }

                    Head(table, "Total");
                    table.Cell().ColumnSpan(4).Border(1).Background(Colors.Grey.Lighten2).Padding(4).Text(string.Empty);
                    Head(table, RemainingUsdTotal(rows).ToString("N3"));
                });

                var unrated = rows.Count(row => !row.RateToUsd.HasValue && row.RemainingAmount != 0);
                if (unrated > 0)
                {
                    column.Item().PaddingTop(8).Text(
                            $"{unrated} obligation(s) are held in a currency with no published USD rate and are not included in the total.")
                        .FontSize(8)
                        .FontColor(Colors.Red.Medium);
                }
            });
        });
    }

    public static byte[] BuildCorrespondentBalanceExcel(CorrespondentBalanceReportDto report, bool includeTotalInUsd = true)
    {
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Balances");
        var lastColumn = report.Currencies.Count + 1;

        ws.Cell(1, 1).Value = "Correspondent Name";
        for (var i = 0; i < report.Currencies.Count; i++)
            ws.Cell(1, i + 2).Value = report.Currencies[i];

        var r = 2;
        foreach (var row in report.Rows)
        {
            ws.Cell(r, 1).Value = row.CorrespondentName;
            for (var i = 0; i < row.Balances.Count; i++)
                SetAmount(ws.Cell(r, i + 2), row.Balances[i]);
            r++;
        }

        ws.Cell(r, 1).Value = "Total";
        for (var i = 0; i < report.CurrencyTotals.Count; i++)
            SetAmount(ws.Cell(r, i + 2), report.CurrencyTotals[i]);
        ws.Row(r).Style.Font.Bold = true;
        r++;

        if (includeTotalInUsd)
        {
            ws.Cell(r, 1).Value = "Total In USD";
            for (var i = 0; i < report.CurrencyTotalsUsd.Count; i++)
                SetAmount(ws.Cell(r, i + 2), report.CurrencyTotalsUsd[i]);
            ws.Row(r).Style.Font.Bold = true;
            r++;
        }

        r += 1;

        ws.Cell(r, 1).Value = AsOfLabel(report.AsOfDate);
        r += 2;

        foreach (var (label, amount) in Summary(report))
        {
            ws.Cell(r, 1).Value = label;
            ws.Cell(r, 2).Value = amount;
            ws.Cell(r, 2).Style.NumberFormat.Format = "#,##0.00";
            ws.Row(r).Style.Font.Bold = true;
            r++;
        }

        if (report.UnconvertedCurrencyCount > 0)
        {
            ws.Cell(r + 1, 1).Value = UnconvertedNote(report.UnconvertedCurrencyCount);
        }

        ws.Range(1, 1, 1, lastColumn).Style.Font.Bold = true;
        ws.Range(1, 1, r, lastColumn).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        ws.Columns().AdjustToContents();

        return Save(workbook);
    }

    public static byte[] BuildCorrespondentBalancePdf(CorrespondentBalanceReportDto report, string title, bool includeTotalInUsd = true)
    {
        return ReportBranding.Document(title, content =>
        {
            content.Column(column =>
            {
                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3);
                        for (var i = 0; i < report.Currencies.Count; i++) columns.RelativeColumn(2);
                    });

                    Head(table, "Correspondent Name");
                    foreach (var currency in report.Currencies)
                        Head(table, currency);

                    foreach (var row in report.Rows)
                    {
                        Text(table, row.CorrespondentName);
                        foreach (var balance in row.Balances)
                            Money(table, balance);
                    }

                    // The printed report has always carried three decimals on its total
                    // rows, where the body carries two.
                    Head(table, "Total");
                    foreach (var total in report.CurrencyTotals)
                        Head(table, Amount(total, "N3"));

                    if (includeTotalInUsd)
                    {
                        Head(table, "Total In USD");
                        foreach (var total in report.CurrencyTotalsUsd)
                            Head(table, Amount(total, "N3"));
                    }
                });

                column.Item().PaddingTop(12).Width(240).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(2);
                        columns.RelativeColumn();
                    });

                    foreach (var (label, amount) in Summary(report))
                    {
                        Head(table, label);
                        Head(table, amount.ToString("N2"));
                    }
                });

                if (report.UnconvertedCurrencyCount > 0)
                {
                    column.Item().PaddingTop(8)
                        .Text(UnconvertedNote(report.UnconvertedCurrencyCount))
                        .FontSize(8)
                        .FontColor(Colors.Red.Medium);
                }
            });
        }, landscape: report.Currencies.Count > 4, subtitle: AsOfLabel(report.AsOfDate));
    }

    private static string AsOfLabel(DateTime asOfDate) => $"As of {asOfDate:dd/MM/yyyy}";

    private static IEnumerable<(string Label, decimal Amount)> Summary(CorrespondentBalanceReportDto report)
    {
        yield return ("EQU.IN USD", report.EquivalentUsd);
        yield return ("T.Pending in USD", report.PendingUsd);
        yield return ("Net balance", report.NetBalanceUsd);
    }

    private static string UnconvertedNote(int count) =>
        $"{count} currency(ies) hold a balance with no published USD rate and are not included in the USD figures.";

    private static decimal RemainingUsdTotal(IReadOnlyList<ObligationReportRow> rows) =>
        rows.Where(row => row.RemainingAmountUsd.HasValue).Sum(row => row.RemainingAmountUsd!.Value);

    private static string ClientName(ObligationReportRow row, bool arabic)
    {
        if (arabic && !string.IsNullOrWhiteSpace(row.ClientNameAr))
        {
            return row.ClientNameAr;
        }

        return string.IsNullOrWhiteSpace(row.ClientName) ? row.ClientNameAr ?? string.Empty : row.ClientName;
    }

    /// <summary>
    /// Writes a real number so the column can still be summed, but formatted to print a
    /// dash for zero the way the report does. Nothing held at all is left blank, which
    /// keeps it distinguishable from a zero balance.
    /// </summary>
    private static void SetAmount(IXLCell cell, decimal? amount)
    {
        if (amount is null)
        {
            return;
        }

        cell.Value = amount.Value;
        cell.Style.NumberFormat.Format = DashOnZeroFormat;
    }

    private static string Amount(decimal? value, string format = "N2") =>
        value is null || value.Value == 0 ? Nil : value.Value.ToString(format);

    private static byte[] Save(XLWorkbook workbook)
    {
        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }

    // Every column is centred, matching the reports on screen and the printed ones before them.
    private static void Head(TableDescriptor table, string value) =>
        table.Cell().Border(1).Background(Colors.Grey.Lighten2).Padding(4).AlignCenter().Text(value).SemiBold();

    private static void Text(TableDescriptor table, string value) =>
        table.Cell().Border(1).Padding(4).AlignCenter().Text(value);

    private static void Money(TableDescriptor table, decimal? value) =>
        table.Cell().Border(1).Padding(4).AlignCenter().Text(Amount(value));
}
