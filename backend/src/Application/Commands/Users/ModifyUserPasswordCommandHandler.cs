using ConstructMate.Core;
using ConstructMate.Core.Events.Users;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Microsoft.AspNetCore.Identity;

namespace ConstructMate.Application.Commands.Users;

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
    public static async Task<ApplicationUser> LoadAsync(ModifyUserPasswordCommand userCommand, UserManager<ApplicationUser> userManager)
    {
        var user = await userManager.FindByIdAsync(userCommand.Id.ToString());
        StatusCodeGuard.IsNotNull(user, StatusCodes.Status404NotFound, "User whose password have to be changed not found");

        return user;
    }

    public static async Task<UserPasswordChanged> Handle(ModifyUserPasswordCommand userCommand, ApplicationUser user,
        UserManager<ApplicationUser> userManager)
    {
        var result = await userManager.ChangePasswordAsync(user, userCommand.OldPassword, userCommand.NewPassword);
        var errorDescriptions = result.Errors.Select(r => r.Description);
        var errors = string.Join(" ", errorDescriptions);
        StatusCodeGuard.IsTrue(result.Succeeded, StatusCodes.Status400BadRequest, errors); //result.Errors.First().Description ??

        return new UserPasswordChanged(user.Id);
    }
}
