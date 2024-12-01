using ConstructMate.Core;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Marten;

namespace ConstructMate.Application.Queries.ConstructionDiaries;

/// <summary>
/// Get Pdf file od the diary query
/// </summary>
/// <param name="DiaryId">Id of the diary from which a Pdf has to be created</param>
/// <param name="RequesterId">Id of user who sent the request</param>
public record GetDiaryPdfFileQuery(Guid DiaryId, Guid RequesterId);

/// <summary>
/// Get (and create) Pdf file od the diary
/// </summary>
public class GetDiaryPdfFileQueryHandler
{
    public static async Task<ConstructionDiary> LoadAsync(GetDiaryPdfFileQuery diaryQuery, IQuerySession session,
        CancellationToken cancellationToken)
    {
        var construction = await session.Query<Construction>()
            .Where(c => c.ConstructionDiary != null && c.ConstructionDiary.Id == diaryQuery.DiaryId)
            .FirstOrDefaultAsync(cancellationToken);
        
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound,
            "Construction to export Pdf from diary not found");
        StatusCodeGuard.IsTrue(construction.OwnerId == diaryQuery.RequesterId
                               || construction.ConstructionDiary!.DiaryContributors.Select(c => c.ContributorId).Contains(diaryQuery.RequesterId), 
            StatusCodes.Status403Forbidden, "Only contributors can export the diary");

        return construction.ConstructionDiary!;
    }

    public static async Task<ConstructionDiaryPdf> Handle(GetDiaryPdfFileQuery diaryQuery, ConstructionDiary diary)
    {
        // export only pages that contain at least 1 record
        var dailyRecordsWithoutEmptyPages = new List<DailyRecord>();
        var firstDate = diary.DiaryDateFrom;
        var lastDate = diary.DiaryDateTo;
        
        for (var date = firstDate; date <= lastDate; date = date.AddDays(1))
        {
            var dailyRecord = diary.DailyRecords
                .FirstOrDefault(r => r.Date == date);
            if (dailyRecord == null) continue; // should now never happen
            
            var combinedList = new List<DiaryRecord>();
            combinedList.AddRange(dailyRecord.OtherRecords);
            combinedList.AddRange(dailyRecord.Weather);
            combinedList.AddRange(dailyRecord.Machines);
            combinedList.AddRange(dailyRecord.Work);
            combinedList.AddRange(dailyRecord.Workers);
            
            if (combinedList.Count > 0) dailyRecordsWithoutEmptyPages.Add(dailyRecord);
        }

        diary.DailyRecords = dailyRecordsWithoutEmptyPages;
        var document = new ConstructionDiaryPdf(diary);
        return await Task.FromResult(document);
    }
}