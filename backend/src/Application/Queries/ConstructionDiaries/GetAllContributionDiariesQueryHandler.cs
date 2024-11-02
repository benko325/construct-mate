using ConstructMate.Application.Queries.Responses;
using ConstructMate.Core;
using Marten;

namespace ConstructMate.Application.Queries.ConstructionDiaries;

/// <summary>
/// Get all diaries where user is contributor query
/// </summary>
/// <param name="UserId">Id of user for who the diaries have to be returned</param>
public record GetAllContributionDiariesQuery(Guid UserId);

/// <summary>
/// Get all diaries where user is contributor
/// </summary>
public class GetAllContributionDiariesQueryHandler
{
    public static async Task<QueryCollectionResponse<ConstructionDiary>> Handle(GetAllContributionDiariesQuery diariesQuery,
        IQuerySession session, CancellationToken cancellationToken)
    {
        var constructionDiaries = await session.Query<Construction>()
            .Select(c => c.ConstructionDiary)
            .Where(d => d != null && d.DiaryContributors.Select(c => c.ContributorId).Contains(diariesQuery.UserId))
            .ToListAsync(token: cancellationToken);

        return new QueryCollectionResponse<ConstructionDiary>(constructionDiaries!);
    }
}