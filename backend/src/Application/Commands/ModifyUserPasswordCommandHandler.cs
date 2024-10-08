using CommunityToolkit.Diagnostics;
using ConstructMate.Core;
using ConstructMate.Core.Events;
using Marten;
using Microsoft.AspNetCore.Identity;

namespace ConstructMate.Application.Commands;

/// <summary>
/// Modify user password command
/// </summary>
/// <param name="Id">Id of user to be modified</param>
/// <param name="OldPassword">Old password of user to be modified</param>
/// <param name="NewPassword">New password of user to be modified</param>
public record ModifyUserPasswordCommand(
    Guid Id,
    string OldPassword,
    string NewPassword);

/// <summary>
/// Change user's password (its hash in the db)
/// </summary>
public class ModifyUserPasswordCommandHandler
{
    // TODO: uncomment when Guards are overrided and nice status codes and errors are implemented
    //public static async Task<ApplicationUser> LoadAsync(ModifyUserPasswordCommand userCommand, IQuerySession session, CancellationToken cancellationToken)
    //{
    //    var user = await session.LoadAsync<ApplicationUser>(userCommand.Id, cancellationToken);
    //    Guard.IsNotNull(user, "User whose password have to be changed");

    //    return user;
    //}

    public static async Task<IResult> Handle(ModifyUserPasswordCommand userCommand, IDocumentSession session,
        UserManager<ApplicationUser> userManager, CancellationToken cancellationToken)
    {
        var user = await session.LoadAsync<ApplicationUser>(userCommand.Id, cancellationToken);
        if (user == null) return Results.NotFound("User with defined Id not found in the DB");

        var result = await userManager.ChangePasswordAsync(user, userCommand.OldPassword, userCommand.NewPassword);

        return result.Succeeded ? Results.Ok(new UserPasswordChanged(user.Id)) : Results.BadRequest(result.Errors);
    }
}
