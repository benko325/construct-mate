using CommunityToolkit.Diagnostics;
using ConstructMate.Core;
using ConstructMate.Core.Events.Users;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Mapster;
using Microsoft.AspNetCore.Identity;

namespace ConstructMate.Application.Commands.Users;

/// <summary>
/// Create user command
/// </summary>
/// <param name="FirstName">First name of new user</param>
/// <param name="LastName">Last name of new user</param>
/// <param name="Email">Email of new user</param>
/// <param name="Password">Password of new user</param>
public record CreateUserCommand(
    string FirstName,
    string LastName,
    string Email,
    string Password);

/// <summary>
/// Create a new user in DB
/// </summary>
public class CreateUserCommandHandler
{
    // no need to check the email duplication in LoadAsync as it is checked by userManager
    public static async Task<UserCreated> Handle(CreateUserCommand userCommand, UserManager<ApplicationUser> userManager)
    {
        var newUser = userCommand.Adapt<ApplicationUser>();
        newUser.UserName = userCommand.Email;
        newUser.EmailConfirmed = true; // no need to confirm the email as for now

        var result = await userManager.CreateAsync(newUser, userCommand.Password);

        var errorDescriptions = result.Errors.Select(r => r.Description);
        var errors = string.Join(" ", errorDescriptions);
        StatusCodeGuard.IsTrue(result.Succeeded, StatusCodes.Status400BadRequest, errors); //result.Errors.First().Description ??

        // create folder for this user
        var folderPath = $"{Constants.FilesFolder}/{newUser.Id}";
        Directory.CreateDirectory(folderPath);

        return newUser.Adapt<UserCreated>();
    }
}
