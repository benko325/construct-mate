using ConstructMate.Application.Queries.Responses;
using ConstructMate.Core;
using Marten;

namespace ConstructMate.Application.Queries.Constructions;

/// <summary>
/// Get all user's constructions query
/// </summary>
/// <param name="UserId">Id of user whose construction has to be returned</param>
public record GetAllUsersConstructionsQuery(Guid UserId);

/// <summary>
/// Get all constructions that were made by defined user
/// </summary>
public class GetAllUsersConstructionsQueryHandler
{
    public static async Task<QueryCollectionResponse<Construction>> Handle(GetAllUsersConstructionsQuery constructionsQuery,
        IQuerySession session)
    {
        var constructions = await session.Query<Construction>()
            .Where(c => c.OwnerId == constructionsQuery.UserId)
            .ToListAsync();

        return new QueryCollectionResponse<Construction>(constructions);
    }
}
