using CommunityToolkit.Diagnostics;
using ConstructMate.Core;
using ConstructMate.Core.Events;
using Marten;

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
    public static async Task<ApplicationUser> LoadAsync(DeleteUserCommand userCommand, IQuerySession session, CancellationToken cancellationToken)
    {
        var user = await session.LoadAsync<ApplicationUser>(userCommand.Id, cancellationToken);
        // TODO: return 404 with message when resolved
        Guard.IsNotNull(user, "User to be deleted");

        return user;
    }

    public static async Task<UserDeleted> Handle(DeleteUserCommand userCommand, ApplicationUser user, IDocumentSession session, CancellationToken cancellationToken)
    {
        session.Delete(user);
        // TODO: delete all constructions, files, etc. that belongs to deleted user
        await session.SaveChangesAsync(cancellationToken);

        return new UserDeleted(user.Id);
    }
}
