using ConstructMate.Core;
using ConstructMate.Core.Events;
using Mapster;
using Microsoft.AspNetCore.Identity;

namespace ConstructMate.Application.Commands;

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
    public static async Task<IResult> Handle(CreateUserCommand userCommand, UserManager<ApplicationUser> userManager)
    {
        var newUser = userCommand.Adapt<ApplicationUser>();
        newUser.UserName = userCommand.Email;
        newUser.EmailConfirmed = true; // no need to confirm the email as for now

        var result = await userManager.CreateAsync(newUser, userCommand.Password);

        return result.Succeeded ? Results.Ok(newUser.Adapt<UserCreated>()) : Results.BadRequest(result.Errors);
    }
}
