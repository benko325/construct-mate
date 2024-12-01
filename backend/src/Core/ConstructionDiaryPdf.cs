using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ConstructMate.Core;

public class ConstructionDiaryPdf(ConstructionDiary diary) : IDocument
{
    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(1, Unit.Centimetre);
            page.Content().Background(Colors.White).Padding(2, Unit.Centimetre)
                .AlignCenter().AlignMiddle().Text("Stavebný denník")
                .FontSize(32).Bold().FontColor(Colors.Black);
        });

        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(1, Unit.Centimetre);
            page.Content()
                .Padding(2, Unit.Centimetre)
                .AlignCenter()
                .Column(column =>
                {
                    column.Spacing(60);
                    column.Item().Text("Informácie o stavbe").FontSize(24).Bold().AlignCenter();

                    column.Item().Column(metadata =>
                    {
                        metadata.Spacing(40); 

                        metadata.Item().Column(item =>
                        {
                            item.Item().Text("Názov:").FontSize(16).Bold().AlignCenter();
                            item.Item().Text(diary.Name).FontSize(16).AlignCenter();
                        });

                        metadata.Item().Column(item =>
                        {
                            item.Item().Text("Adresa:").FontSize(16).Bold().AlignCenter();
                            item.Item().Text(diary.Address).FontSize(16).AlignCenter();
                        });

                        metadata.Item().Column(item =>
                        {
                            item.Item().Text("Stavbyvedúci:").FontSize(16).Bold().AlignCenter();
                            item.Item().Text(diary.ConstructionManager).FontSize(16).AlignCenter();
                        });

                        metadata.Item().Column(item =>
                        {
                            item.Item().Text("Stavebný dozor:").FontSize(16).Bold().AlignCenter();
                            item.Item().Text(diary.ConstructionSupervisor).FontSize(16).AlignCenter();
                        });

                        metadata.Item().Column(item =>
                        {
                            item.Item().Text("Stavebné povolenie:").FontSize(16).Bold().AlignCenter();
                            item.Item().Text(diary.ConstructionApproval).FontSize(16).AlignCenter();
                        });

                        metadata.Item().Column(item =>
                        {
                            item.Item().Text("Investor:").FontSize(16).Bold().AlignCenter();
                            item.Item().Text(diary.Investor).FontSize(16).AlignCenter();
                        });

                        metadata.Item().Column(item =>
                        {
                            item.Item().Text("Realizátor:").FontSize(16).Bold().AlignCenter();
                            item.Item().Text(diary.Implementer).FontSize(16).AlignCenter();
                        });
                    });
                });
        });

        // Additional Pages: Daily Records
        foreach (var record in diary.DailyRecords)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1, Unit.Centimetre);
                page.Content().Padding(2, Unit.Centimetre)
                    .Column(column =>
                    {
                        column.Spacing(20);
                        column.Item().Text($"Dátum: {record.Date}").FontSize(22).ExtraBold();

                        AddSection(column, "Počasie", record.Weather);
                        AddSection(column, "Pracovníci", record.Workers);
                        AddSection(column, "Stroje", record.Machines);
                        AddSection(column, "Práca", record.Work);
                        AddSection(column, "Ostatné záznamy", record.OtherRecords);
                    });
            });
        }
    }

    private void AddSection(ColumnDescriptor column, string sectionTitle, List<DiaryRecord> records)
    {
        column.Item().Column(innerColumn =>
        {
            innerColumn.Spacing(5);
            innerColumn.Item().Text(sectionTitle).FontSize(18).Bold().Underline();

            if (records.Count != 0)
            {
                foreach (var record in records)
                {
                    innerColumn.Item().Column(recordColumn =>
                    {
                        recordColumn.Item().Text(record.Content).FontSize(14).Medium();

                        recordColumn.Item().Text($"Autor: {record.AuthorName}, Rola: {record.AuthorRole.GetTranslation()}, Dátum: {record.CreatedAt:yyyy-MM-dd HH:mm}")
                            .FontSize(12)
                            .Italic()
                            .FontColor(Colors.Grey.Darken2);
                    });
                }
            }
            else
            {
                innerColumn.Item().Text("Žiadne záznamy").FontSize(14).Italic().FontColor(Colors.Grey.Darken1);
            }
        });
    }
}