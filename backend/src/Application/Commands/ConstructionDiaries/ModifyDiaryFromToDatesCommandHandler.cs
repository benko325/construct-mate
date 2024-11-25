using ConstructMate.Core;
using ConstructMate.Core.Events.ConstructionDiaries;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Marten;

namespace ConstructMate.Application.Commands.ConstructionDiaries;

/// <summary>
/// Modify diary from and to dates command
/// </summary>
/// <param name="DiaryId">Id of diary to be modified</param>
/// <param name="NewDateFrom">New diary date from</param>
/// <param name="NewDateTo">New diary date to</param>
/// <param name="UpdateConstructionDates">If the construction dates have also to be updated</param>
/// <param name="RequesterId">Id of user who sent the request</param>
public record ModifyDiaryFromToDatesCommand(
    Guid DiaryId,
    DateOnly NewDateFrom,
    DateOnly NewDateTo,
    bool UpdateConstructionDates,
    Guid RequesterId);

/// <summary>
/// Modify diary from and to dates and add new (or remove) daily records
/// </summary>
public class ModifyDiaryFromToDatesCommandHandler
{
    public static async Task<Construction> LoadAsync(ModifyDiaryFromToDatesCommand diaryCommand, IQuerySession session,
        CancellationToken cancellationToken)
    {
        var construction = await session.Query<Construction>()
            .Where(c => c.ConstructionDiary != null && c.ConstructionDiary.Id == diaryCommand.DiaryId)
            .FirstOrDefaultAsync(cancellationToken);
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound,
            "Construction for diary not found");
        StatusCodeGuard.IsEqualTo(construction.OwnerId, diaryCommand.RequesterId, StatusCodes.Status403Forbidden,
            "Dates can be only modified by construction owner");
        
        var diary = construction.ConstructionDiary;
        StatusCodeGuard.IsNotNull(diary, StatusCodes.Status404NotFound, "Diary not found");

        if (diaryCommand.NewDateFrom > diary.DiaryDateFrom)
        {
            var dailyRecords = diary.DailyRecords
                .Where(d => d.Date >= diary.DiaryDateFrom && d.Date < diaryCommand.NewDateFrom);
            
            // check if there are not any records within the OldDateFrom and NewDateFrom
            var combinedList = new List<DiaryRecord>();
            foreach (var dailyRecord in dailyRecords)
            {
                combinedList.AddRange(dailyRecord.OtherRecords);
                combinedList.AddRange(dailyRecord.Weather);
                combinedList.AddRange(dailyRecord.Machines);
                combinedList.AddRange(dailyRecord.Work);
                combinedList.AddRange(dailyRecord.Workers);
            }
            
            StatusCodeGuard.IsTrue(combinedList.Count == 0, StatusCodes.Status403Forbidden,
                "Can not edit date from to new date, because some records were found between old from date and new from date");
        }

        if (diaryCommand.NewDateTo < diary.DiaryDateTo)
        {
            var dailyRecords = diary.DailyRecords
                .Where(d => d.Date > diaryCommand.NewDateTo && d.Date <= diary.DiaryDateTo);
            
            // check if there are not any records within the NewDateTo and OldDateTo
            var combinedList = new List<DiaryRecord>();
            foreach (var dailyRecord in dailyRecords)
            {
                combinedList.AddRange(dailyRecord.OtherRecords);
                combinedList.AddRange(dailyRecord.Weather);
                combinedList.AddRange(dailyRecord.Machines);
                combinedList.AddRange(dailyRecord.Work);
                combinedList.AddRange(dailyRecord.Workers);
            }
            
            StatusCodeGuard.IsTrue(combinedList.Count == 0, StatusCodes.Status403Forbidden,
                "Can not edit date to to a new date, because some records were found between new to date and old to date");
        }

        return construction;
    }

    public static async Task<DiaryFromToDatesModified> Handle(ModifyDiaryFromToDatesCommand diaryCommand,
        Construction construction, IDocumentSession session, CancellationToken cancellationToken)
    {
        // nullability of the diary checked in LoadAsync
        UpdateDailyRecords(construction, diaryCommand);

        if (diaryCommand.UpdateConstructionDates)
        {
            construction.StartDate = diaryCommand.NewDateFrom;
            construction.EndDate = diaryCommand.NewDateTo;
        }

        construction.ConstructionDiary!.DiaryDateFrom = diaryCommand.NewDateFrom;
        construction.ConstructionDiary.DiaryDateTo = diaryCommand.NewDateTo;
        
        session.Update(construction);
        await session.SaveChangesAsync(cancellationToken);

        return new DiaryFromToDatesModified(construction.ConstructionDiary.Id,
            construction.ConstructionDiary.DiaryDateFrom, construction.ConstructionDiary.DiaryDateTo);
    }

    private static void UpdateDailyRecords(Construction construction, ModifyDiaryFromToDatesCommand diaryCommand)
    {
        var oldDateFrom = construction.ConstructionDiary!.DiaryDateFrom;
        var newDateFrom = diaryCommand.NewDateFrom;
        
        // nullability of the diary checked in LoadAsync
        // add new records for new period
        if (newDateFrom < oldDateFrom)
        {
            for (var date = newDateFrom; date < oldDateFrom; date = date.AddDays(1))
            {
                var dailyRecord = new DailyRecord() { Date = date };
                construction.ConstructionDiary.DailyRecords.Add(dailyRecord);
            }
        }
        // remove old records that are out of new period
        else
        {
            var recordsToBeDeleted = construction.ConstructionDiary.DailyRecords
                .Where(r => r.Date < newDateFrom);
            construction.ConstructionDiary.DailyRecords =
                construction.ConstructionDiary.DailyRecords.Except(recordsToBeDeleted).ToList();
        }

        var oldDateTo = construction.ConstructionDiary.DiaryDateTo;
        var newDateTo = diaryCommand.NewDateTo;
        // add new records for new period
        if (newDateTo > oldDateTo)
        {
            for (var date = oldDateTo.AddDays(1); date <= newDateTo; date = date.AddDays(1))
            {
                var dailyRecord = new DailyRecord() { Date = date };
                construction.ConstructionDiary.DailyRecords.Add(dailyRecord);
            }
        }
        // remove old records that are out of new period
        else
        {
            var recordsToBeDeleted = construction.ConstructionDiary.DailyRecords
                .Where(r => r.Date > newDateTo);
            construction.ConstructionDiary.DailyRecords =
                construction.ConstructionDiary.DailyRecords.Except(recordsToBeDeleted).ToList();
        }
    }
}