using CommunityToolkit.Diagnostics;
using ConstructMate.Core;
using ConstructMate.Core.Events;
using Mapster;
using Marten;

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
    public static async Task<ApplicationUser> LoadAsync(ModifyUserCommand userCommand, IQuerySession session, CancellationToken cancellationToken)
    {
        var user = await session.LoadAsync<ApplicationUser>(userCommand.Id, cancellationToken);
        // TODO: edit when status codes and error handling is implemented
        Guard.IsNotNull(user, "User to be modified");

        return user;
    }

    public static async Task<UserModified> Handle(ModifyUserCommand userCommand, ApplicationUser user, IDocumentSession session, CancellationToken cancellationToken)
    {
        user.FirstName = userCommand.NewFirstName;
        user.LastName = userCommand.NewLastName;
        user.Email = userCommand.NewEmail;

        session.Update(user);
        await session.SaveChangesAsync(cancellationToken);

        return user.Adapt<UserModified>();
    }
}
