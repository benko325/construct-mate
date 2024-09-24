using ConstructMate.Application.Commands;
using ConstructMate.Core;
using ConstructMate.Core.Events;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Wolverine;
using Wolverine.Http;
using Wolverine.Http.Marten;

namespace ConstructMate.Api;

/// <summary>
/// Create new user request
/// </summary>
/// <param name="FirstName">First name of new user</param>
/// <param name="LastName">Last name of new user</param>
/// <param name="Email">Email of new user</param>
/// <param name="Password">Password of new user</param>
/// <param name="PasswordAgain">Again password for check of equality with Password property</param>
public record CreateUserRequest(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string PasswordAgain);

public class UsersEndpoint
{
    /// <summary>
    /// Get existing user by id
    /// </summary>
    /// <param name="user">User with defined Id</param>
    /// <returns>User</returns>
    [WolverineGet("/users/{id}")]
    public static User GetUserById([Document] User user)
    {
        return user;
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="request"></param>
    /// <param name="bus"></param>
    /// <returns></returns>
    [WolverinePost("/users")]
    public static async Task<UserCreated> CreateNewUser([FromBody] CreateUserRequest request, IMessageBus bus)
    {
        var command = request.Adapt<CreateUserCommand>();
        var result = await bus.InvokeAsync<UserCreated>(command);
        return result;
    }
}
