using CommunityToolkit.Diagnostics;
using ConstructMate.Core;
using ConstructMate.Core.Events;
using Marten;
using Microsoft.AspNetCore.Identity;

namespace ConstructMate.Application.Commands;

/// <summary>
/// Delete an existing user command
/// </summary>
/// <param name="Id">Id of user to be deleted</param>
public record DeleteUserCommand(Guid Id);

/// <summary>
/// Delete an existing user
/// </summary>
public class DeleteUserCommandHandler
{
    // TODO: uncomment when Guards are overrided and nice status codes and errors are implemented
    //public static async Task<ApplicationUser> LoadAsync(DeleteUserCommand userCommand, IQuerySession session, CancellationToken cancellationToken)
    //{
    //    var user = await session.LoadAsync<ApplicationUser>(userCommand.Id, cancellationToken);
    //    // TODO: return 404 with message when resolved
    //    Guard.IsNotNull(user, "User to be deleted");

    //    return user;
    //}

    public static async Task<IResult> Handle(DeleteUserCommand userCommand, IDocumentSession session, UserManager<ApplicationUser> userManager, CancellationToken cancellationToken)
    {
        var user = await session.LoadAsync<ApplicationUser>(userCommand.Id, cancellationToken);
        if (user == null) return Results.NotFound("User with defined Id not found in the DB");

        var result = await userManager.DeleteAsync(user);
        // TODO: delete all constructions, files, etc. that belongs to deleted user

        return result.Succeeded ? Results.Ok(new UserDeleted(user.Id)) : Results.BadRequest(result.Errors);
    }
}
