using ConstructMate.Application.Commands.UploadedFiles;
using ConstructMate.Application.ServiceInterfaces;
using ConstructMate.Core;
using ConstructMate.Core.Events.UploadedFiles;
using ConstructMate.Infrastructure.StatusCodeGuard;
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
    public static async Task<ProfilePictureUploaded> UploadConstructionProfilePictureAsync([FromRoute] Guid id,
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
    /// <param name="id">Id of construction which profile picture has to be deleted</param>
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
    public static async Task<ProfilePictureDeleted> DeleteProfilePictureForConstructionAsync([FromRoute] Guid id,
        IApplicationUserContext userContext, IMessageBus bus)
    {
        var command = new DeleteProfilePictureCommand(id, userContext.UserId);
        var result = await bus.InvokeAsync<ProfilePictureDeleted>(command);
        return result;
    }

    /// <summary>
    /// Upload building permit file (in .pdf format) - if there is already one, it will be replaced
    /// </summary>
    /// <param name="id">Id of construction for which a building permit file has to be uploaded</param>
    /// <param name="file">Building permit to be uploaded</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>BuildingPermitUploaded - Id of construction and path of the file</returns>
    [ProducesResponseType<BuildingPermitUploaded>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverinePost("/constructions/{id}/building-permit")]
    public static async Task<BuildingPermitUploaded> UploadBuildingPermitAsync([FromRoute] Guid id,
        [FromForm] IFormFile file, IApplicationUserContext userContext, IMessageBus bus)
    {
        var command = new UploadBuildingPermitCommand(id, file, userContext.UserId);
        var result = await bus.InvokeAsync<BuildingPermitUploaded>(command);
        return result;
    }

    /// <summary>
    /// Get building permit Url for defined construction
    /// </summary>
    /// <param name="construction">Construction with defined Id</param>
    /// <returns>Building permit url or 404, when permit was not uploaded</returns>
    [ProducesResponseType<string>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<object>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverineGet("/constructions/{id}/building-permit")]
    public static string GetBuildingPermitForConstruction([Document] Construction construction)
    {
        StatusCodeGuard.IsNotNull(construction.BuildingPermitFileUrl, StatusCodes.Status404NotFound, "Building permit not found");
        return construction.BuildingPermitFileUrl;
    }

    /// <summary>
    /// Delete building permit for defined construction (set url to null)
    /// </summary>
    /// <param name="id">Id of construction which building permit has to be deleted</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>BuildingPermitDeleted - Id of construction</returns>
    [ProducesResponseType<BuildingPermitDeleted>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status405MethodNotAllowed)]
    [Authorize]
    [WolverineDelete("/constructions/{id}/building-permit")]
    public static async Task<BuildingPermitDeleted> DeleteBuildingPermitForConstructionAsync([FromRoute] Guid id,
        IApplicationUserContext userContext, IMessageBus bus)
    {
        var command = new DeleteBuildingPermitCommand(id, userContext.UserId);
        var result = await bus.InvokeAsync<BuildingPermitDeleted>(command);
        return result;
    }

    /// <summary>
    /// Upload construction approval file (in .pdf format) - if there is already one, it will be replaced
    /// </summary>
    /// <param name="id">Id of construction for which a construction approval file has to be uploaded</param>
    /// <param name="file">Construction approval to be uploaded</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>ConstructionApprovalUploaded - Id of construction and path of the file</returns>
    [ProducesResponseType<ConstructionApprovalUploaded>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverinePost("/constructions/{id}/construction-approval")]
    public static async Task<ConstructionApprovalUploaded> UploadConstructionApprovalAsync([FromRoute] Guid id,
        [FromForm] IFormFile file, IApplicationUserContext userContext, IMessageBus bus)
    {
        var command = new UploadConstructionApprovalCommand(id, file, userContext.UserId);
        var result = await bus.InvokeAsync<ConstructionApprovalUploaded>(command);
        return result;
    }

    /// <summary>
    /// Get construction approval Url for defined construction
    /// </summary>
    /// <param name="construction">Construction with defined Id</param>
    /// <returns>Construction approval url or 404, when permit was not uploaded</returns>
    [ProducesResponseType<string>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<object>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverineGet("/constructions/{id}/construction-approval")]
    public static string GetConstructionApprovalForConstruction([Document] Construction construction)
    {
        StatusCodeGuard.IsNotNull(construction.ConstructionApprovalFileUrl, StatusCodes.Status404NotFound, "Construction approval not found");
        return construction.ConstructionApprovalFileUrl;
    }

    /// <summary>
    /// Delete construction approval for defined construction (set url to null)
    /// </summary>
    /// <param name="id">Id of construction which construction approval has to be deleted</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>ConstructionApprovalDeleted - Id of construction</returns>
    [ProducesResponseType<ConstructionApprovalDeleted>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status405MethodNotAllowed)]
    [Authorize]
    [WolverineDelete("/constructions/{id}/construction-approval")]
    public static async Task<ConstructionApprovalDeleted> DeleteConstructionApprovalForConstructionAsync([FromRoute] Guid id,
        IApplicationUserContext userContext, IMessageBus bus)
    {
        var command = new DeleteConstructionApprovalCommand(id, userContext.UserId);
        var result = await bus.InvokeAsync<ConstructionApprovalDeleted>(command);
        return result;
    }

    /// <summary>
    /// Upload construction handover file (in .pdf format) - if there is already one, it will be replaced
    /// </summary>
    /// <param name="id">Id of construction for which a construction handover file has to be uploaded</param>
    /// <param name="file">Construction handover to be uploaded</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>ConstructionHandoverUploaded - Id of construction and path of the file</returns>
    [ProducesResponseType<ConstructionHandoverUploaded>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverinePost("/constructions/{id}/construction-handover")]
    public static async Task<ConstructionHandoverUploaded> UploadConstructionHandoverAsync([FromRoute] Guid id,
        [FromForm] IFormFile file, IApplicationUserContext userContext, IMessageBus bus)
    {
        var command = new UploadConstructionHandoverCommand(id, file, userContext.UserId);
        var result = await bus.InvokeAsync<ConstructionHandoverUploaded>(command);
        return result;
    }

    /// <summary>
    /// Get construction handover Url for defined construction
    /// </summary>
    /// <param name="construction">Construction with defined Id</param>
    /// <returns>Construction handover url or 404, when handover was not uploaded</returns>
    [ProducesResponseType<string>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<object>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverineGet("/constructions/{id}/construction-handover")]
    public static string GetConstructionHandoverForConstruction([Document] Construction construction)
    {
        StatusCodeGuard.IsNotNull(construction.ConstructionHandoverFileUrl, StatusCodes.Status404NotFound, "Construction handover not found");
        return construction.ConstructionHandoverFileUrl;
    }

    /// <summary>
    /// Delete construction handover for defined construction (set url to null)
    /// </summary>
    /// <param name="id">Id of construction which construction handover has to be deleted</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>ConstructionHandoverDeleted - Id of construction</returns>
    [ProducesResponseType<ConstructionHandoverDeleted>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status405MethodNotAllowed)]
    [Authorize]
    [WolverineDelete("/constructions/{id}/construction-handover")]
    public static async Task<ConstructionHandoverDeleted> DeleteConstructionHandoverForConstructionAsync([FromRoute] Guid id,
        IApplicationUserContext userContext, IMessageBus bus)
    {
        var command = new DeleteConstructionHandoverCommand(id, userContext.UserId);
        var result = await bus.InvokeAsync<ConstructionHandoverDeleted>(command);
        return result;
    }

    // TODO: upload, get, delete for default files (or just photos???) - resolve!!! but it is not must have
}
