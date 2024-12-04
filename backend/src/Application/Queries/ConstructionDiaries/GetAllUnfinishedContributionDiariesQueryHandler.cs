using ConstructMate.Application.Queries.Responses;
using ConstructMate.Core;
using Marten;

namespace ConstructMate.Application.Queries.ConstructionDiaries;

/// <summary>
/// Get all actual (unfinished) diaries where user is contributor query
/// </summary>
/// <param name="UserId">Id of user for whom the diaries have to be returned</param>
public record GetAllUnfinishedContributionDiariesQuery(Guid UserId);

/// <summary>
/// Get all actual (unfinished) diaries where user is contributor (without those that he created)
/// </summary>
public class GetAllUnfinishedContributionDiariesQueryHandler
{
    public static async Task<QueryCollectionResponse<ConstructionDiary>> Handle(
        GetAllUnfinishedContributionDiariesQuery diariesQuery, IQuerySession session,
        CancellationToken cancellationToken)
    {
       var constructionDiaries = await session.Query<Construction>()
           .Where(c => c.ConstructionDiary != null && c.OwnerId != diariesQuery.UserId &&
                       c.ConstructionDiary.DiaryContributors.Any(d => d.ContributorId == diariesQuery.UserId) &&
                       c.ConstructionDiary.DiaryDateTo >= DateOnly.FromDateTime(DateTime.UtcNow))
           .Select(c => c.ConstructionDiary)
           .ToListAsync(token: cancellationToken);

        return new QueryCollectionResponse<ConstructionDiary>(constructionDiaries);
    }
}