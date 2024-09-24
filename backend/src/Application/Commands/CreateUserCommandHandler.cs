using CommunityToolkit.Diagnostics;
using ConstructMate.Core;
using ConstructMate.Core.Events;
using Mapster;
using Marten;

namespace ConstructMate.Application.Commands;

/// <summary>
/// Create user command
/// </summary>
/// <param name="Id">Id of new user</param>
/// <param name="FirstName">First name of new user</param>
/// <param name="LastName">Last name of new user</param>
/// <param name="Email">Email of new user</param>
/// <param name="Password">Password of new user</param>
/// <param name="PasswordAgain">Again password for check of equality with Password property</param>
public record CreateUserCommand(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string PasswordAgain);

/// <summary>
/// Create a new user in DB
/// </summary>
public class CreateUserCommandHandler
{
    public static async Task LoadAsync(CreateUserCommand userCommand, IQuerySession session, CancellationToken cancellationToken)
    {
        Guard.IsEqualTo(userCommand.Password, userCommand.PasswordAgain, "Given passwords must be the same");

        // Check if user with given email doesn't already exist
        var user = await session.Query<User>().FirstOrDefaultAsync(u => u.Email == userCommand.Email, token: cancellationToken);

        // TODO: better status codes + error messages
        Guard.IsNull(user, "User with given email already exists");
    }

    public static async Task<UserCreated> Handle(CreateUserCommand userCommand, IDocumentSession session, CancellationToken cancellationToken)
    {
        var newUser = userCommand.Adapt<User>();
        newUser.PasswordHash = "TODO: Save password hash";

        session.Store(newUser);
        await session.SaveChangesAsync(cancellationToken);

        return newUser.Adapt<UserCreated>();
    }
}
