using ConstructMate.Application.Commands;
using ConstructMate.Application.Queries;
using ConstructMate.Application.Queries.Responses;
using ConstructMate.Core;
using ConstructMate.Core.Events;
using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wolverine;
using Wolverine.Http;
using Wolverine.Http.Marten;
using System.Security.Claims;
using ConstructMate.Application.ServiceInterfaces;

namespace ConstructMate.Api;

/// <summary>
/// Create new user request
/// </summary>
/// <param name="FirstName">First name of new user</param>
/// <param name="LastName">Last name of new user</param>
/// <param name="Email">Email of new user</param>
/// <param name="Password">Password of new user</param>
/// <param name="PasswordAgain">Again password for check of equality with Password field</param>
public record CreateUserRequest(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string PasswordAgain);

/// <summary>
/// Modify user request (first name, last name and email)
/// </summary>
/// <param name="Id">Id of existing user to be modified</param>
/// <param name="NewFirstName">New first name of modified user</param>
/// <param name="NewLastName">New last name of modified user</param>
/// <param name="NewEmail">New email of modified user</param>
public record ModifyUserRequest(
    Guid Id,
    string NewFirstName,
    string NewLastName,
    string NewEmail);

/// <summary>
/// Modify existing user's password request
/// </summary>
/// <param name="Id">Id of user whose password has to be updated</param>
/// <param name="OldPassword">Old password of specified user</param>
/// <param name="NewPassword">New password of specified user</param>
/// <param name="NewPasswordAgain">New password again for check of equality with NewPassword field</param>
public record ModifyUserPasswordRequest(
    Guid Id,
    string OldPassword,
    string NewPassword,
    string NewPasswordAgain);

/// <summary>
/// Login user request
/// </summary>
/// <param name="Email">Email of user to be logged in</param>
/// <param name="Password">Password of the user to be logged in</param>
public record LoginUserRequest(string Email, string Password);

public class UsersEndpoint
{
    // TODO: reset password via email?? when there is enough time for that
    // TODO: implement StatusCodeGuard when resolved and edit commands

    /// <summary>
    /// Get existing user by id
    /// </summary>
    /// <param name="user">User with defined Id</param>
    /// <returns>User</returns>
    [ProducesResponseType<object>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ApplicationUser>(StatusCodes.Status200OK)]
    [Authorize]
    [WolverineGet("/users/{id}")]
    public static ApplicationUser GetUserById([Document] ApplicationUser user)
    {
        return user;
    }

    /// <summary>
    /// Create a new user (register a new user)
    /// </summary>
    /// <param name="request"><see cref="CreateUserRequest"/></param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>UserCreated - info about newly created user</returns>
    [ProducesResponseType<object>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<UserCreated>(StatusCodes.Status200OK)]
    [AllowAnonymous]
    [WolverinePost("/users")]
    public static async Task<IResult> CreateNewUser([FromBody] CreateUserRequest request, IMessageBus bus)
    {
        var command = request.Adapt<CreateUserCommand>();
        var result = await bus.InvokeAsync<IResult>(command);
        return result;
    }

    /// <summary>
    /// Login user
    /// </summary>
    /// <param name="request"><see cref="LoginUserRequest"/></param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>UserLoggedIn - token and info about expiration</returns>
    [ProducesResponseType<UserLoggedIn>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<object>(StatusCodes.Status404NotFound)]
    [AllowAnonymous]
    [WolverinePost("/users/login")]
    public static async Task<IResult> Login([FromBody] LoginUserRequest request, IMessageBus bus)
    {
        var command = request.Adapt<LoginUserCommand>();
        var result = await bus.InvokeAsync<IResult>(command);
        return result;
    }

    /// <summary>
    /// Modify an existing user (his first name, last name and email)
    /// </summary>
    /// <param name="id">Id of user to be modified</param>
    /// <param name="request"><see cref="ModifyUserRequest"/></param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>UserModified - id of modified user, new first name, last name, and email</returns>
    [ProducesResponseType<UserModified>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<object>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverinePatch("/users/{id}")]
    public static async Task<IResult> ModifyUser([FromRoute] Guid id, [FromBody] ModifyUserRequest request,
        IApplicationUserContext userContext, IMessageBus bus)
    {
        if (id != request.Id) return Results.BadRequest("Id in route and in request must be equal");
        if (userContext.UserId != id) return Results.Unauthorized();

        var command = request.Adapt<ModifyUserCommand>();
        var result = await bus.InvokeAsync<IResult>(command);
        return result;
    }

    /// <summary>
    /// Update password for existing user
    /// </summary>
    /// <param name="id">Id of user to be modified</param>
    /// <param name="request"><see cref="ModifyUserPasswordRequest"/></param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>UserPasswordChanged - Id of user whose password has been changed</returns>
    [ProducesResponseType<UserPasswordChanged>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<object>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverinePatch("/users/{id}/password")]
    public static async Task<IResult> UpdatePassword([FromRoute] Guid id, [FromBody] ModifyUserPasswordRequest request,
        IApplicationUserContext userContext, IMessageBus bus)
    {
        if (id != request.Id) return Results.BadRequest("Id in route and in request must be equal");
        if (userContext.UserId != id) return Results.Unauthorized();

        var command = request.Adapt<ModifyUserPasswordCommand>();
        var result = await bus.InvokeAsync<IResult>(command);
        return result;
    }

    /// <summary>
    /// Delete an existing user - user can only delete himself
    /// </summary>
    /// <param name="id">Id of user to be deleted</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>UserDeleted - id of deleted user</returns>
    [ProducesResponseType<UserDeleted>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<object>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverineDelete("/users/{id}")]
    public static async Task<IResult> DeleteUser([FromRoute] Guid id, IApplicationUserContext userContext, IMessageBus bus)
    {
        if (userContext.UserId != id) return Results.Unauthorized();

        var command = new DeleteUserCommand(id);
        var result = await bus.InvokeAsync<IResult>(command);
        return result;
    }

    /// <summary>
    /// Get all users from the database
    /// </summary>
    /// <remarks>
    /// This endpoints is only for testing purposes <br/>
    /// TODO: remove when finished or add authorization so that only I can access this endpoint
    /// </remarks>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>Collection of all users from the database</returns>
    [WolverineGet("/users")]
    public static async Task<IEnumerable<ApplicationUser>> GetAllUsers(IMessageBus bus)
    {
        var query = new GetAllUsersQuery();
        var result = await bus.InvokeAsync<QueryCollectionResponse<ApplicationUser>>(query);
        return result.QueryResponseItems;
    }

    /// <summary>
    /// Get info about currently logged in user
    /// </summary>
    /// <remarks>
    /// Just for testing purposes
    /// </remarks>
    /// <param name="httpContext"></param>
    /// <param name="userContext"></param>
    /// <returns></returns>
    [Authorize]
    [WolverineGet("/users/me")]
    public static string GetMyInfo(HttpContext httpContext, IApplicationUserContext userContext)
    {
        var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userName = httpContext.User.FindFirstValue(ClaimTypes.Name);
        var userEmail = httpContext.User.FindFirstValue(ClaimTypes.Email);

        return $"User ID: {userId} = {userContext.UserId}, User Name: {userName} = {userContext.UserName}, Email: {userEmail} = {userContext.UserEmail}";
    }
}
