using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace RevenuUsage.API.Exports;

/// <summary>
/// The masthead every exported report carries: the bank logo, the issuing department,
/// the report name and when it was produced, over a page counter.
/// </summary>
public static class ReportBranding
{
    private const string OrganisationName = "Central Bank Of Sudan";
    private const string DepartmentName = "Gold and Reserve Department - statistic section";

    /// <summary>
    /// Obligation clients are named in Arabic, which QuestPDF's bundled font cannot
    /// render. These ship with Windows and cover both scripts.
    /// </summary>
    private const string PrimaryFont = "Tahoma";

    private static readonly Lazy<byte[]?> Logo = new(LoadLogo);

    /// <summary>
    /// Lays out a branded portrait page around <paramref name="content"/>. Landscape is
    /// available for reports too wide to fit, such as a currency column per holding.
    /// <paramref name="subtitle"/> states the date a report covers, where that differs
    /// from when it was produced.
    /// </summary>
    public static byte[] Document(
        string title,
        Action<IContainer> content,
        bool landscape = false,
        string? subtitle = null)
    {
        return QuestPDF.Fluent.Document.Create(document =>
        {
            document.Page(page =>
            {
                page.Size(landscape ? PageSizes.A4.Landscape() : PageSizes.A4);
                page.Margin(24);
                page.DefaultTextStyle(x => x.FontSize(9).FontFamily(PrimaryFont));

                page.Header().Element(container => Masthead(container, title, subtitle));
                page.Content().PaddingVertical(10).Element(content);
                page.Footer().AlignCenter().Text(text =>
                {
                    text.DefaultTextStyle(x => x.FontSize(8).FontColor(Colors.Grey.Darken1));
                    text.Span("-- ");
                    text.CurrentPageNumber();
                    text.Span(" of ");
                    text.TotalPages();
                    text.Span(" --");
                });
            });
        }).GeneratePdf();
    }

    private static void Masthead(IContainer container, string title, string? subtitle)
    {
        container.Column(header =>
        {
            header.Item().Row(row =>
            {
                var logo = Logo.Value;
                if (logo is not null)
                {
                    row.ConstantItem(58).AlignMiddle().Image(logo);
                }

                row.RelativeItem().AlignCenter().Column(titles =>
                {
                    titles.Item().Text(OrganisationName).SemiBold().FontSize(13);
                    titles.Item().Text(DepartmentName).FontSize(9).FontColor(Colors.Grey.Darken2);
                    titles.Item().PaddingTop(4).Text(title).SemiBold().FontSize(12);

                    if (subtitle is not null)
                    {
                        titles.Item().Text(subtitle).SemiBold().FontSize(9);
                    }

                    titles.Item().Text(DateTime.Now.ToString("dd/MM/yyyy h:mm:ss tt")).FontSize(8).FontColor(Colors.Grey.Darken1);
                });

                // Balances the logo so the titles stay centred on the page.
                if (logo is not null)
                {
                    row.ConstantItem(58);
                }
            });

            header.Item().PaddingTop(6).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
        });
    }

    private static byte[]? LoadLogo()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "Exports", "Assets", "cbos-logo-blue.png");
        return File.Exists(path) ? File.ReadAllBytes(path) : null;
    }
}
