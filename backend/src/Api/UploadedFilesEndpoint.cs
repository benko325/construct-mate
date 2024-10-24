using ConstructMate.Application.Commands.UploadedFiles;
using ConstructMate.Application.ServiceInterfaces;
using ConstructMate.Core;
using ConstructMate.Core.Events.UploadedFiles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wolverine;
using Wolverine.Http;
using Wolverine.Http.Marten;

namespace ConstructMate.Api;

public class UploadedFilesEndpoint
{
    /// <summary>
    /// Upload profile picture for construction (when there already is some, it will be replaced)
    /// (jpg, jpeg, png and svg are only allowed)
    /// </summary>
    /// <param name="id">Id of construction for which a new profile picture has to be uploaded</param>
    /// <param name="file">Profile picture to be uploaded</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>ProfilePictureUploaded - info about uploaded profile picture</returns>
    [ProducesResponseType<ProfilePictureUploaded>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverinePost("constructions/{id}/profile-picture")]
    public static async Task<ProfilePictureUploaded> UploadConstructionProfilePicture([FromRoute] Guid id,
        [FromForm] IFormFile file, IApplicationUserContext userContext, IMessageBus bus)
    {
        var command = new UploadProfilePictureCommand(file, id, userContext.UserId);
        var result = await bus.InvokeAsync<ProfilePictureUploaded>(command);
        return result;
    }

    /// <summary>
    /// Get profile picture Url for defined construction
    /// </summary>
    /// <param name="construction">Construction with defined Id</param>
    /// <returns>Profile picture url</returns>
    [ProducesResponseType<string>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<object>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverineGet("/constructions/{id}/profile-picture")]
    public static string GetProfilePictureForConstruction([Document] Construction construction)
    {
        return construction.ProfilePictureUrl;
    }

    /// <summary>
    /// Delete profile picture for defined construction (set url to default)
    /// </summary>
    /// <param name="id">Id of construction which profiloe picture has to be deleted</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>ProfilePictureDeleted - Id of construction and new profile picture Url</returns>
    [ProducesResponseType<ProfilePictureDeleted>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status405MethodNotAllowed)]
    [Authorize]
    [WolverineDelete("/constructions/{id}/profile-picture")]
    public static async Task<ProfilePictureDeleted> DeleteProfilePictureForConstruction([FromRoute] Guid id,
        IApplicationUserContext userContext, IMessageBus bus)
    {
        var command = new DeleteProfilePictureCommand(id, userContext.UserId);
        var result = await bus.InvokeAsync<ProfilePictureDeleted>(command);
        return result;
    }

    // TODO: get profile pic for construction, delete profile pic for construction
    // and also for other file types
}
