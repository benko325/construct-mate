using ConstructMate.Application.Queries.Responses;
using ConstructMate.Core;
using Marten;

namespace ConstructMate.Application.Queries.Constructions;

/// <summary>
/// Get all user's unfinished constructions query
/// </summary>
/// <param name="UserId">Id of user whose constructions have to be returned</param>
public record GetAllUsersUnfinishedConstructionsQuery(Guid UserId);

/// <summary>
/// Get all unfinished constructions that were made by defined user
/// </summary>
public class GetAllUsersUnfinishedConstructionsQueryHandler
{
    public static async Task<QueryCollectionResponse<Construction>> Handle(GetAllUsersUnfinishedConstructionsQuery unfinishedConstructionsQuery,
        IQuerySession session)
    {
        var constructions = await session.Query<Construction>()
            .Where(c => c.OwnerId == unfinishedConstructionsQuery.UserId && c.EndDate >= DateOnly.FromDateTime(DateTime.UtcNow))
            .ToListAsync();

        return new QueryCollectionResponse<Construction>(constructions);
    }
}
