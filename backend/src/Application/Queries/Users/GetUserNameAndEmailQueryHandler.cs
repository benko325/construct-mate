using ConstructMate.Core;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Microsoft.AspNetCore.Identity;

namespace ConstructMate.Application.Queries.Users;

/// <summary>
/// Get user's first name, last name and email query
/// </summary>
/// <param name="Id">Id of user whose info has to be returned</param>
public record GetUserNameAndEmailQuery(Guid Id);

/// <summary>
/// Get user's first name, last name and email (for patch endpoint)
/// </summary>
public class GetUserNameAndEmailQueryHandler
{
    public static async Task<ApplicationUser> LoadAsync(GetUserNameAndEmailQuery userQuery, UserManager<ApplicationUser> userManager)
    {
        var user = await userManager.FindByIdAsync(userQuery.Id.ToString());
        StatusCodeGuard.IsNotNull(user, StatusCodes.Status404NotFound,
            "User with given Id not found");

        return user;
    }

    public static async Task<UserNameEmail> Handle(GetUserNameAndEmailQuery userQuery, ApplicationUser user)
    {
        return await Task.FromResult(new UserNameEmail(user.FirstName, user.LastName, user.Email!));
    }
}