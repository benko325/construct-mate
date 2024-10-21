using ConstructMate.Core;
using ConstructMate.Core.Events.Users;
using ConstructMate.Infrastructure;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Mapster;
using Marten;
using Microsoft.AspNetCore.Identity;

namespace ConstructMate.Application.Commands.Users;

/// <summary>
/// Modify an existing user command
/// </summary>
/// <param name="Id">Id of user to be modified</param>
/// <param name="NewFirstName">New first name of modified user</param>
/// <param name="NewLastName">New last name of modified user</param>
/// <param name="NewEmail">New email of modified user</param>
public record ModifyUserCommand(Guid Id, string NewFirstName, string NewLastName, string NewEmail);

/// <summary>
/// Modify and existing user (first name, last name and email) and return updated jwt
/// </summary>
public class ModifyUserCommandHandler
{
    public static async Task<ApplicationUser> LoadAsync(ModifyUserCommand userCommand, UserManager<ApplicationUser> userManager)
    {
        var user = await userManager.FindByIdAsync(userCommand.Id.ToString());
        StatusCodeGuard.IsNotNull(user, StatusCodes.Status404NotFound, "User to be modified not found");

        return user;
    }

    public static async Task<UserModified> Handle(ModifyUserCommand userCommand, ApplicationUser user, IDocumentSession session,
        UserManager<ApplicationUser> userManager, IConfiguration configuration, CancellationToken cancellationToken)
    {
        var emailResult = await userManager.SetEmailAsync(user, userCommand.NewEmail);
        var emailErrorDescriptions = emailResult.Errors.Select(r => r.Description);
        var emailErrors = string.Join(" ", emailErrorDescriptions);
        StatusCodeGuard.IsTrue(emailResult.Succeeded, StatusCodes.Status400BadRequest, emailErrors); //emailResult.Errors.First().Description ??

        // with email also username must be set because email is also used as a username!!!
        var userNameResult = await userManager.SetUserNameAsync(user, userCommand.NewEmail);
        var userNameErrorDescriptions = userNameResult.Errors.Select(r => r.Description);
        var userNameErrors = string.Join(" ", userNameErrorDescriptions);
        StatusCodeGuard.IsTrue(userNameResult.Succeeded, StatusCodes.Status400BadRequest, userNameErrors); //userNameResult.Errors.First().Description ??

        user.FirstName = userCommand.NewFirstName;
        user.LastName = userCommand.NewLastName;

        session.Update(user);
        await session.SaveChangesAsync(cancellationToken);

        var newJwt = JWTGenerator.GenerateJwtToken(user, configuration);

        return user.Adapt<UserModified>() with { NewToken = newJwt };
    }
}
