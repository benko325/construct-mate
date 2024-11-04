using ConstructMate.Core;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Marten;

namespace ConstructMate.Application.Queries.ConstructionDiaries;

/// <summary>
/// Get construction diary's daily record by day query
/// </summary>
/// <param name="DiaryId"></param>
/// <param name="Date"></param>
/// <param name="RequesterId"></param>
public record GetDiaryDailyRecordQuery(Guid DiaryId, DateOnly Date, Guid RequesterId);

/// <summary>
/// Get construction diary's daily record by day
/// </summary>
public class GetDiaryDailyRecordQueryHandler
{
    public static async Task<ConstructionDiary> LoadAsync(GetDiaryDailyRecordQuery diaryQuery,
        IQuerySession session, CancellationToken cancellationToken)
    {
        var construction = await session.Query<Construction>()
            .Where(c => c.ConstructionDiary != null && c.ConstructionDiary.Id == diaryQuery.DiaryId)
            .FirstOrDefaultAsync(cancellationToken);
        
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound,
            "Construction for the diary not found");
        StatusCodeGuard.IsNotNull(construction.ConstructionDiary, StatusCodes.Status404NotFound,
            "Construction diary not found");

        var diary = construction.ConstructionDiary;
        var contributorIds = diary.DiaryContributors.Select(c => c.ContributorId);
        StatusCodeGuard.IsTrue(construction.OwnerId == diaryQuery.RequesterId || contributorIds.Contains(diaryQuery.RequesterId),
            StatusCodes.Status401Unauthorized, "User needs to be construction owner or contributor to the diary");
        StatusCodeGuard.IsTrue(diary.DiaryDateFrom <= diaryQuery.Date && diary.DiaryDateTo >= diaryQuery.Date,
            StatusCodes.Status400BadRequest, "Date is out of range of diary from and to dates");

        return diary;
    }

    public static async Task<DailyRecord> Handle(GetDiaryDailyRecordQuery diaryQuery, ConstructionDiary diary,
        CancellationToken cancellationToken)
    {
        return await Task.FromResult(diary.DailyRecords
            .First(d => d.Date == diaryQuery.Date));
    }
}