using ConstructMate.Core;
using ConstructMate.Core.Events;
using ConstructMate.Infrastructure.StatusCodeGuard;
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
    public static async Task<ApplicationUser> LoadAsync(DeleteUserCommand userCommand, UserManager<ApplicationUser> userManager)
    {
        var user = await userManager.FindByIdAsync(userCommand.Id.ToString());
        StatusCodeGuard.IsNotNull(user, StatusCodes.Status404NotFound, "User to be deleted not found");

        return user;
    }

    public static async Task<UserDeleted> Handle(DeleteUserCommand userCommand, ApplicationUser user,
        UserManager<ApplicationUser> userManager)
    {
        var result = await userManager.DeleteAsync(user);
        // TODO: delete all constructions, files, etc. that belongs to deleted user

        var errorDescriptions = result.Errors.Select(r => r.Description);
        var errors = string.Join(" ", errorDescriptions);
        StatusCodeGuard.IsTrue(result.Succeeded, StatusCodes.Status500InternalServerError, errors); //result.Errors.First().Description ??

        return new UserDeleted(user.Id);
    }
}
