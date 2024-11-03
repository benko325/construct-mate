using ConstructMate.Application.Queries.Responses;
using ConstructMate.Core;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Marten;

namespace ConstructMate.Application.Queries.ConstructionDiaries;

/// <summary>
/// Get first and last day that contains any record in the diary query
/// </summary>
/// <param name="DiaryId"></param>
public record GetDiaryFirstAndLastDayWithRecordQuery(Guid DiaryId);

/// <summary>
/// Get first and last day that contains any record in the diary
/// </summary>
public class GetDiaryFirstAndLastDayWithRecordQueryHandler
{
    public static async Task<Construction> LoadAsync(GetDiaryFirstAndLastDayWithRecordQuery diaryQuery,
        IQuerySession session, CancellationToken cancellationToken)
    {
        var construction = await session.Query<Construction>()
            .Where(c => c.ConstructionDiary != null && c.ConstructionDiary.Id == diaryQuery.DiaryId)
            .FirstOrDefaultAsync(cancellationToken);
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound,
            "Construction for the diary not found");
        StatusCodeGuard.IsNotNull(construction.ConstructionDiary, StatusCodes.Status404NotFound,
            "Diary in construction not found");

        return construction;
    }

    public static DiaryFirstLastDayWithRecords Handle(GetDiaryFirstAndLastDayWithRecordQuery diaryQuery,
        Construction construction)
    {
        // diary nullability checked in LoadAsync
        var firstDate = construction.ConstructionDiary!.DiaryDateFrom;
        var lastDate = construction.ConstructionDiary.DiaryDateTo;
        // find first date with record
        while (firstDate <= lastDate)
        {
            var date = firstDate;
            var dailyRecord = construction.ConstructionDiary.DailyRecords
                .FirstOrDefault(r => r.Date == date);
            StatusCodeGuard.IsNotNull(dailyRecord, StatusCodes.Status500InternalServerError,
                $"No daily record found for the date {date}");
            
            var combinedList = new List<DiaryRecord>();
            combinedList.AddRange(dailyRecord.OtherRecords);
            combinedList.AddRange(dailyRecord.Weather);
            combinedList.AddRange(dailyRecord.Machines);
            combinedList.AddRange(dailyRecord.Work);
            combinedList.AddRange(dailyRecord.Workers);
            
            if (combinedList.Count > 0) break;
            
            firstDate = firstDate.AddDays(1);
        }
        
        // find last date with record
        while (lastDate > firstDate)
        {
            var date = lastDate;
            var dailyRecord = construction.ConstructionDiary.DailyRecords
                .FirstOrDefault(r => r.Date == date);
            StatusCodeGuard.IsNotNull(dailyRecord, StatusCodes.Status500InternalServerError,
                $"No daily record found for the date {date}");
            
            var combinedList = new List<DiaryRecord>();
            combinedList.AddRange(dailyRecord.OtherRecords);
            combinedList.AddRange(dailyRecord.Weather);
            combinedList.AddRange(dailyRecord.Machines);
            combinedList.AddRange(dailyRecord.Work);
            combinedList.AddRange(dailyRecord.Workers);
            
            if (combinedList.Count > 0) break;

            lastDate = lastDate.AddDays(-1);
        }

        // if there is no record in the whole diary, first date will be greater because of the first while loop
        if (firstDate > lastDate)
        {
            return new DiaryFirstLastDayWithRecords(diaryQuery.DiaryId, null, null);
        }

        return new DiaryFirstLastDayWithRecords(diaryQuery.DiaryId, firstDate, lastDate);
    }
}