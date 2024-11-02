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
/// Modify diary from and to dates
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
        StatusCodeGuard.IsEqualTo(construction.OwnerId, diaryCommand.RequesterId, StatusCodes.Status401Unauthorized,
            "Dates can be only modified by construciton owner");
        
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
        if (diaryCommand.NewDateFrom < construction.ConstructionDiary!.DiaryDateFrom)
        {
            // TODO: add new daily records
        }
        else
        {
            // TODO: delete daily records
        }

        if (diaryCommand.NewDateTo > construction.ConstructionDiary.DiaryDateTo)
        {
            // TODO: add new daily records
        }
        else
        {
            // TODO: delete daily records
        }
        
        // TODO: Update diary dates + update the db
        // !!! check if also the construction dates have to be updated

        return new DiaryFromToDatesModified(construction.ConstructionDiary.Id,
            construction.ConstructionDiary.DiaryDateFrom, construction.ConstructionDiary.DiaryDateTo);
    }
}