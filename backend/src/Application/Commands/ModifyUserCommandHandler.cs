using ConstructMate.Core;
using ConstructMate.Core.Events;
using ConstructMate.Infrastructure;
using Mapster;
using Marten;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace ConstructMate.Application.Commands;

/// <summary>
/// Modify an existing user command
/// </summary>
/// <param name="Id">Id of user to be modified</param>
/// <param name="NewFirstName">New first name of modified user</param>
/// <param name="NewLastName">New last name of modified user</param>
/// <param name="NewEmail">New email of modified user</param>
public record ModifyUserCommand(Guid Id, string NewFirstName, string NewLastName, string NewEmail);

/// <summary>
/// Modify and existing user (first name, last name and email)
/// </summary>
public class ModifyUserCommandHandler
{
    // TODO: uncomment when Guards are overrided and nice status codes and errors are implemented
    //public static async Task<ApplicationUser> LoadAsync(ModifyUserCommand userCommand, IQuerySession session, CancellationToken cancellationToken)
    //{
    //    var user = await session.LoadAsync<ApplicationUser>(userCommand.Id, cancellationToken);
    //    // TODO: edit when status codes and error handling is implemented
    //    Guard.IsNotNull(user, "User to be modified");

    //    return user;
    //}

    public static async Task<IResult> Handle(ModifyUserCommand userCommand, IDocumentSession session,
        UserManager<ApplicationUser> userManager, IConfiguration configuration, CancellationToken cancellationToken)
    {
        var user = await session.LoadAsync<ApplicationUser>(userCommand.Id, cancellationToken);
        if (user == null) return Results.NotFound("User with defined Id not found in the DB");

        // with email also username must be set because email is also used as a username!!!
        await userManager.SetEmailAsync(user, userCommand.NewEmail);
        await userManager.SetUserNameAsync(user, userCommand.NewEmail);

        user.FirstName = userCommand.NewFirstName;
        user.LastName = userCommand.NewLastName;

        session.Update(user);
        await session.SaveChangesAsync(cancellationToken);

        var newJwt = JWTGenerator.GenerateJwtToken(user, configuration);

        return Results.Ok(user.Adapt<UserModified>() with { NewToken = newJwt });
    }
}
