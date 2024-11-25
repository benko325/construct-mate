using ConstructMate.Core;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Marten;

namespace ConstructMate.Application.Queries.ConstructionDiaries;

public record GetConstructionDiaryByIdQuery(Guid DiaryId, Guid RequesterId);

public class GetConstructionDiaryByIdQueryHandler
{
    public static async Task<Construction> LoadAsync(GetConstructionDiaryByIdQuery diaryQuery,
        IQuerySession session, CancellationToken cancellationToken)
    {
        var construction = await session.Query<Construction>()
            .Where(c => c.ConstructionDiary != null && c.ConstructionDiary.Id == diaryQuery.DiaryId)
            .FirstOrDefaultAsync(cancellationToken);
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound,
            "Construction for the diary not found");
        StatusCodeGuard.IsNotNull(construction.ConstructionDiary, StatusCodes.Status404NotFound,
            "Diary not found in construction");
        
        var contributorIds = construction.ConstructionDiary.DiaryContributors.Select(c => c.ContributorId);
        StatusCodeGuard.IsTrue(construction.OwnerId == diaryQuery.RequesterId || contributorIds.Contains(diaryQuery.RequesterId),
            StatusCodes.Status403Forbidden,
            "User can see only diaries made by him or where he is allowed to contribute");

        return construction;
    }

    public static async Task<ConstructionDiary> Handle(GetConstructionDiaryByIdQuery diaryQuery,
        Construction construction)
    {
        // nullability checked in LoadAsync
        return await Task.FromResult(construction.ConstructionDiary!);
    }
}