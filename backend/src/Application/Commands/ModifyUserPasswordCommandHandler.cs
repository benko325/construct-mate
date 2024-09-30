using CommunityToolkit.Diagnostics;
using ConstructMate.Core;
using ConstructMate.Core.Events;
using Marten;

namespace ConstructMate.Application.Commands;

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
    public static async Task<User> LoadAsync(ModifyUserPasswordCommand userCommand, IQuerySession session, CancellationToken cancellationToken)
    {
        var user = await session.LoadAsync<User>(userCommand.Id, cancellationToken);
        // TODO: update with error messages and status codes
        Guard.IsNotNull(user, "User whose password have to be changed");

        // TODO: check if old password hash matches hash of new password

        return user;
    }

    public static async Task<UserPasswordChanged> Handle(ModifyUserPasswordCommand userCommand, User user, IDocumentSession session, CancellationToken cancellationToken)
    {
        // TODO: update when hashing is resolved
        user.PasswordHash = "NewPasswordHash";

        session.Update(user);
        await session.SaveChangesAsync(cancellationToken);

        return new UserPasswordChanged(user.Id);
    }
}
