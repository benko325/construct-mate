using ConstructMate.Application.Queries.Responses;
using ConstructMate.Core;
using Marten;

namespace ConstructMate.Application.Queries.Constructions;

/// <summary>
/// Get all user's finished constructions query
/// </summary>
/// <param name="UserId">Id of user whose constructions have to be returned</param>
public record GetAllUsersFinishedConstructionsQuery(Guid UserId);

/// <summary>
/// Get all finished constructions that were made by defined user
/// </summary>
public class GetAllUsersFinishedConstructionsQueryHandler
{
    public static async Task<QueryCollectionResponse<Construction>> Handle(GetAllUsersFinishedConstructionsQuery finishedConstructionsQuery,
        IQuerySession session)
    {
        var constructions = await session.Query<Construction>()
            .Where(c => c.OwnerId == finishedConstructionsQuery.UserId && c.EndDate < DateOnly.FromDateTime(DateTime.UtcNow))
            .ToListAsync();

        return new QueryCollectionResponse<Construction>(constructions);
    }
}