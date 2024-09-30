using ConstructMate.Application.Queries.Responses;
using ConstructMate.Core;
using Marten;

namespace ConstructMate.Application.Queries;

/// <summary>
/// Get all users from the db query
/// </summary>
public record GetAllUsersQuery();

/// <summary>
/// Get all users from the database
/// </summary>
public class GetAllUsersQueryHandler
{
    public static async Task<QueryCollectionResponse<User>> Handle(GetAllUsersQuery usersQuery, IQuerySession session)
    {
        var users = await session.Query<User>().ToListAsync();
        return new QueryCollectionResponse<User>(users);
    }
}
