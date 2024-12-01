using ConstructMate.Application.Queries.Responses;
using ConstructMate.Core;
using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wolverine;
using Wolverine.Http;
using Wolverine.Http.Marten;
using ConstructMate.Application.ServiceInterfaces;
using ConstructMate.Infrastructure.StatusCodeGuard;
using ConstructMate.Core.Events.Users;
using ConstructMate.Application.Commands.Users;
using ConstructMate.Application.Queries.Users;

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
/// <param name="NewFirstName">New first name of modified user</param>
/// <param name="NewLastName">New last name of modified user</param>
/// <param name="NewEmail">New email of modified user</param>
public record ModifyUserRequest(
    string NewFirstName,
    string NewLastName,
    string NewEmail);

/// <summary>
/// Modify existing user's password request
/// </summary>
/// <param name="OldPassword">Old password of specified user</param>
/// <param name="NewPassword">New password of specified user</param>
/// <param name="NewPasswordAgain">New password again for check of equality with NewPassword field</param>
public record ModifyUserPasswordRequest(
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

    /// <summary>
    /// Get existing user by id
    /// </summary>
    /// <param name="user">User with defined Id</param>
    /// <returns>User</returns>
    [ProducesResponseType<ApplicationUser>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<object>(StatusCodes.Status404NotFound)]
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
    [ProducesResponseType<UserCreated>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [AllowAnonymous]
    [WolverinePost("/users/register")]
    public static async Task<UserCreated> CreateNewUserAsync([FromBody] CreateUserRequest request, IMessageBus bus)
    {
        var command = request.Adapt<CreateUserCommand>();
        var result = await bus.InvokeAsync<UserCreated>(command);
        return result;
    }

    /// <summary>
    /// Login user
    /// </summary>
    /// <param name="request"><see cref="LoginUserRequest"/></param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <param name="httpContext">Injected HttpContext</param>
    /// <returns>UserLoggedIn - token and info about expiration</returns>
    [ProducesResponseType<UserLoggedIn>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status405MethodNotAllowed)]
    [AllowAnonymous]
    [WolverinePost("/users/login")]
    public static async Task<UserLoggedIn> LoginAsync([FromBody] LoginUserRequest request, IMessageBus bus, HttpContext httpContext)
    {
        var command = request.Adapt<LoginUserCommand>();
        var result = await bus.InvokeAsync<UserLoggedIn>(command);
        
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddHours(12)
        };
        httpContext.Response.Cookies.Append("cm-jwt", result.Token, cookieOptions);
        
        return result;
    }

    /// <summary>
    /// Log out the current logged-in user (delete jwt from cookie)
    /// </summary>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="httpContext">Injected HttpContext</param>
    /// <returns><see cref="UserLoggedOut"/></returns>
    [ProducesResponseType<UserLoggedOut>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [Authorize]
    [WolverineDelete("/users/logout")]
    public static UserLoggedOut Logout(IApplicationUserContext userContext, HttpContext httpContext)
    {
        httpContext.Response.Cookies.Delete("cm-jwt");
        return new UserLoggedOut(userContext.UserId);
    }

    /// <summary>
    /// Modify an existing user (his first name, last name and email)
    /// </summary>
    /// <param name="request"><see cref="ModifyUserRequest"/></param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <param name="httpContext">Injected HttpContext</param>
    /// <returns>UserModified - id of modified user, new first name, last name, email and new token</returns>
    [ProducesResponseType<UserModified>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverinePatch("/users")]
    public static async Task<UserModified> ModifyUserAsync([FromBody] ModifyUserRequest request,
        IApplicationUserContext userContext, IMessageBus bus, HttpContext httpContext)
    {
        var command = request.Adapt<ModifyUserCommand>() with { Id = userContext.UserId };
        var result = await bus.InvokeAsync<UserModified>(command);
        
        // remove old token from the cookie
        httpContext.Response.Cookies.Delete("cm-jwt");
        
        // add an updated one
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddHours(12)
        };
        httpContext.Response.Cookies.Append("cm-jwt", result.NewToken, cookieOptions);
        
        return result;
    }

    /// <summary>
    /// Update password for existing user
    /// </summary>
    /// <param name="request"><see cref="ModifyUserPasswordRequest"/></param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>UserPasswordChanged - Id of user whose password has been changed</returns>
    [ProducesResponseType<UserPasswordChanged>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverinePatch("/users/password")]
    public static async Task<UserPasswordChanged> UpdatePasswordAsync([FromBody] ModifyUserPasswordRequest request,
        IApplicationUserContext userContext, IMessageBus bus)
    {
        var command = request.Adapt<ModifyUserPasswordCommand>() with { Id = userContext.UserId };
        var result = await bus.InvokeAsync<UserPasswordChanged>(command);
        return result;
    }

    /// <summary>
    /// Delete an existing user's files (all files and constructions that belongs to him) - user can only delete his files
    /// </summary>
    /// <remarks>
    /// User will remain in the db (because he can contribute to the other diaries), just all his files will be removed
    /// </remarks>
    /// <param name="id">Id of user to be deleted</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>UserDeleted - id of deleted user</returns>
    [ProducesResponseType<UserFilesDeleted>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverineDelete("/users/{id}/files")]
    public static async Task<UserFilesDeleted> DeleteUserAsync([FromRoute] Guid id, IApplicationUserContext userContext, IMessageBus bus)
    {
        StatusCodeGuard.IsEqualTo(userContext.UserId, id, StatusCodes.Status401Unauthorized, "User can delete his files only");

        var command = new DeleteUserFilesCommand(id);
        var result = await bus.InvokeAsync<UserFilesDeleted>(command);
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
    public static async Task<IEnumerable<ApplicationUser>> GetAllUsersAsync(IMessageBus bus)
    {
        var query = new GetAllUsersQuery();
        var result = await bus.InvokeAsync<QueryCollectionResponse<ApplicationUser>>(query);
        return result.QueryResponseItems;
    }

    /// <summary>
    /// Get info about currently logged-in user
    /// </summary>
    /// <remarks>
    /// Endpoint is used to verify if the user is logged-in
    /// </remarks>
    /// <param name="userContext">Injected custom user context</param>
    /// <returns><see cref="UserInfo"/></returns>
    [ProducesResponseType<UserInfo>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [Authorize]
    [WolverineGet("/users/info")]
    public static UserInfo GetMyInfo(IApplicationUserContext userContext)
    {
        return new UserInfo(userContext.UserId, userContext.UserName, userContext.UserEmail);
    }

    /// <summary>
    /// Get first name, last name and email of currently logged-in user
    /// </summary>
    /// <remarks>
    /// For update first name, last name and email endpoint
    /// </remarks>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns><see cref="UserNameEmail"/></returns>
    [ProducesResponseType<UserNameEmail>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverineGet("/users/name-email")]
    public static async Task<UserNameEmail> GetMyNameAndEmail(IApplicationUserContext userContext, IMessageBus bus)
    {
        var query = new GetUserNameAndEmailQuery(userContext.UserId);
        var result = await bus.InvokeAsync<UserNameEmail>(query);
        return result;
    }
}
