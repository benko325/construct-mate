using ConstructMate.Core;
using ConstructMate.Core.Events;
using ConstructMate.Infrastructure;
using Microsoft.AspNetCore.Identity;

namespace ConstructMate.Application.Commands;

/// <summary>
/// Login user command
/// </summary>
/// <param name="Email">Email of user to be logged in</param>
/// <param name="Password">Password of the user to be logged in</param>
public record LoginUserCommand(string Email, string Password);

public class LoginUserCommandHandler
{
    // TODO: move check logic to Loadasync when resolving the issue with returning Ok and some error IResults...

    //public static async Task<(IResult, ApplicationUser?)> LoadAsync(LoginUserCommand userCommand, UserManager<ApplicationUser> userManager, IQuerySession session, CancellationToken cancellationToken)
    //{
    //    var user = await userManager.FindByEmailAsync(userCommand.Email);
    //    if (user == null) return (Results.BadRequest("User with given email not found"), null);

    //    if (!await userManager.HasPasswordAsync(user)) return (Results.BadRequest("User does not have a password set"), null);

    //    var isPasswordValid = await userManager.CheckPasswordAsync(user, userCommand.Password);
    //    if (!isPasswordValid) return (Results.BadRequest("Invalid password"), null);

    //    return (Results.Ok(), user);
    //}

    public static async Task<IResult> Handle(LoginUserCommand userCommand, UserManager<ApplicationUser> userManager, IConfiguration configuration)
    {
        var user = await userManager.FindByEmailAsync(userCommand.Email);
        if (user == null) return Results.NotFound("User with given email not found");

        if (!await userManager.HasPasswordAsync(user)) return Results.BadRequest("User does not have a password set");

        var isPasswordValid = await userManager.CheckPasswordAsync(user, userCommand.Password);
        if (!isPasswordValid) return Results.BadRequest("Invalid password");

        // if (await userManager.IsLockedOutAsync(user)) return Results.BadRequest("User account locked out.");

        var token = JWTGenerator.GenerateJwtToken(user, configuration);

        return Results.Ok(new UserLoggedIn(token, DateTime.UtcNow.AddHours(12)));
    }
}
