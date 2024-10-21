using ConstructMate.Core;
using ConstructMate.Core.Events.Users;
using ConstructMate.Infrastructure;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Microsoft.AspNetCore.Identity;

namespace ConstructMate.Application.Commands.Users;

/// <summary>
/// Login user command
/// </summary>
/// <param name="Email">Email of user to be logged in</param>
/// <param name="Password">Password of the user to be logged in</param>
public record LoginUserCommand(string Email, string Password);

/// <summary>
/// Login user - generate a jwt to access the application
/// </summary>
public class LoginUserCommandHandler
{
    public static async Task<ApplicationUser> LoadAsync(LoginUserCommand userCommand,
        UserManager<ApplicationUser> userManager)
    {
        var user = await userManager.FindByEmailAsync(userCommand.Email);
        StatusCodeGuard.IsNotNull(user, StatusCodes.Status404NotFound, "User with given email not found");
        StatusCodeGuard.IsTrue(await userManager.HasPasswordAsync(user), StatusCodes.Status405MethodNotAllowed,
            "User does not have a password set");

        var isPasswordValid = await userManager.CheckPasswordAsync(user, userCommand.Password);
        StatusCodeGuard.IsTrue(isPasswordValid, StatusCodes.Status400BadRequest, "Invalid password");
        // StatusCodeGuard.IsFalse(await userManager.IsLockedOutAsync(user), StatusCodes.Status405MethodNotAllowed, "User account locked out");

        return user;
    }

    public static async Task<UserLoggedIn> Handle(LoginUserCommand userCommand, ApplicationUser user, IConfiguration configuration)
    {
        var token = JWTGenerator.GenerateJwtToken(user, configuration);

        return await Task.FromResult(new UserLoggedIn(token, DateTime.UtcNow.AddHours(12)));
    }
}
