﻿using ConstructMate.Application.Commands.Constructions;
using ConstructMate.Application.Queries.Constructions;
using ConstructMate.Application.Queries.Responses;
using ConstructMate.Application.ServiceInterfaces;
using ConstructMate.Core;
using ConstructMate.Core.Events.Constructions;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wolverine;
using Wolverine.Http;
using Wolverine.Http.Marten;

namespace ConstructMate.Api;

/// <summary>
/// Create a new construction request
/// </summary>
/// <param name="Name">Name of the construction to be created</param>
/// <param name="StartDate">Start date of the construction</param>
/// <param name="EndDate">Estimated end date of the construction</param>
/// <param name="Description">Description of the construction to be created (not required)</param>
public record CreateConstructionRequest(string Name, DateTime StartDate, DateTime EndDate, string? Description = null);

/// <summary>
/// Modify construction request (name and description)
/// </summary>
/// <param name="Id">Id of a construction to be modified</param>
/// <param name="Name">New name of the modified construction</param>
/// <param name="Description">New description of modified construction</param>
public record ModifyConstructionRequest(Guid Id, string Name, string? Description = null);

/// <summary>
/// Add new contributor to the diary request
/// </summary>
/// <param name="ConstructionId">Id of construction where a new diary contributor has to be added</param>
/// <param name="ContributorEmail">Email of new contributor to the diary</param>
/// <param name="ContributorRole">Role of the contributor (for example designer (projektant), supervisor (dozor), ...)</param>
public record AddNewDiaryContributorRequest(Guid ConstructionId, string ContributorEmail, string ContributorRole);

/// <summary>
/// Modify construction's start and end date request
/// </summary>
/// <param name="ConstructionId">Id of construction where a start and end date has to be modified</param>
/// <param name="StartDate">New start date</param>
/// <param name="EndDate">New end date</param>
public record ModifyConstructionStartEndDateRequest(Guid ConstructionId, DateTime StartDate, DateTime EndDate);

public class ConstructionsEndpoint
{
    /// <summary>
    /// Create a new construction
    /// </summary>
    /// <param name="request"><see cref="CreateConstructionRequest"/></param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <returns>ConstructionCreated - all info about newly created construction</returns>
    [ProducesResponseType<ConstructionCreated>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [Authorize]
    [WolverinePost("/constructions")]
    public static async Task<ConstructionCreated> CreateNewConstructionAsync([FromBody] CreateConstructionRequest request, IMessageBus bus,
        IApplicationUserContext userContext)
    {
        StatusCodeGuard.IsGreaterThan(request.EndDate, request.StartDate, StatusCodes.Status400BadRequest,
            "EndDate must be later than StartDate");
        
        var command = request.Adapt<CreateConstructionCommand>() with { Id = Guid.NewGuid(), OwnerId = userContext.UserId };
        var result = await bus.InvokeAsync<ConstructionCreated>(command);
        return result;
    }

    /// <summary>
    /// Get a construction by Id
    /// </summary>
    /// <param name="construction">Construction with defined Id</param>
    /// <returns>Construction</returns>
    [ProducesResponseType<Construction>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<object>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverineGet("/constructions/{id}")]
    public static Construction GetConstruction([Document] Construction construction)
    {
        return construction;
    }

    /// <summary>
    /// Delete a construction
    /// </summary>
    /// <param name="id">Id of construction to be deleted</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <returns>ConstructionDeleted - Id of deleted construction</returns>
    [ProducesResponseType<ConstructionDeleted>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverineDelete("/constructions/{id}")]
    public static async Task<ConstructionDeleted> DeleteConstructionAsync([FromRoute] Guid id, IMessageBus bus,
        IApplicationUserContext userContext)
    {
        var command = new DeleteConstructionCommand(id, userContext.UserId);
        var result = await bus.InvokeAsync<ConstructionDeleted>(command);
        return result;
    }

    /// <summary>
    /// Modify an existing construction (it's name and description)
    /// </summary>
    /// <param name="id">Id of construction to be modified</param>
    /// <param name="request"><see cref="ModifyConstructionRequest"/></param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <returns>ConstructionModified - Id, name and description</returns>
    [ProducesResponseType<ConstructionModified>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverinePatch("/constructions/{id}")]
    public static async Task<ConstructionModified> ModifyConstructionAsync([FromRoute] Guid id, [FromBody] ModifyConstructionRequest request,
        IMessageBus bus, IApplicationUserContext userContext)
    {
        StatusCodeGuard.IsEqualTo(id, request.Id, StatusCodes.Status400BadRequest, "Ids from route and request must be equal");

        var command = request.Adapt<ModifyConstructionCommand>() with { RequesterId = userContext.UserId };
        var result = await bus.InvokeAsync<ConstructionModified>(command);
        return result;

    }

    /// <summary>
    /// Add new contributor to the diary (with his role) - this operation can not be undone!!
    /// </summary>
    /// <param name="id">Id of construction where a new contributor has to be added</param>
    /// <param name="request"><see cref="AddNewDiaryContributorRequest"/></param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <returns>ConstructionDiaryContributorAdded - Id of construction, contributor and role of contributor</returns>
    [ProducesResponseType<ConstructionDiaryContributorAdded>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverinePost("/constructions/{id}/new-diary-contributor")]
    public static async Task<ConstructionDiaryContributorAdded> AddNewContributorToTheConstructionDiary([FromRoute] Guid id,
        [FromBody] AddNewDiaryContributorRequest request, IMessageBus bus, IApplicationUserContext userContext)
    {
        StatusCodeGuard.IsEqualTo(id, request.ConstructionId, StatusCodes.Status400BadRequest, "Id from route and request must be equal");

        var command = request.Adapt<AddNewDiaryContributorCommand>() with { RequesterId = userContext.UserId };
        var result = await bus.InvokeAsync<ConstructionDiaryContributorAdded>(command);
        return result;
    }

    /// <summary>
    /// Modify construction's start and end date
    /// </summary>
    /// <param name="id">Id of construction where a new start and end date has to be set</param>
    /// <param name="request"><see cref="ModifyConstructionStartEndDateRequest"/></param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <returns>ConstructionStartEndDateModified - ID, new start and new end date of a construction</returns>
    [ProducesResponseType<ConstructionStartEndDateModified>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverinePatch("/constructions/{id}/start-end-date")]
    public static async Task<ConstructionStartEndDateModified> ModifyConstructionStartAndEndDate([FromRoute] Guid id, [FromBody] ModifyConstructionStartEndDateRequest request,
        IMessageBus bus, IApplicationUserContext userContext)
    {
        StatusCodeGuard.IsEqualTo(id, request.ConstructionId, StatusCodes.Status400BadRequest, "Id from route and request must be equal");
        StatusCodeGuard.IsGreaterThan(request.EndDate, request.StartDate, StatusCodes.Status400BadRequest,
            "EndDate must be later than StartDate");

        var command = request.Adapt<ModifyConstructionStartEndDateCommand>() with { RequesterId = userContext.UserId };
        var result = await bus.InvokeAsync<ConstructionStartEndDateModified>(command);
        return result;
    }

    /// <summary>
    /// Get all constructions that belong to logged-in user
    /// </summary>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <returns>Collection of all user's constructions</returns>
    [ProducesResponseType<IEnumerable<Construction>>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [Authorize]
    [WolverineGet("/constructions")]
    public static async Task<IEnumerable<Construction>> GetAllUsersConstructionsAsync(IMessageBus bus, IApplicationUserContext userContext)
    {
        var query = new GetAllUsersConstructionsQuery(userContext.UserId);
        var response = await bus.InvokeAsync<QueryCollectionResponse<Construction>>(query);
        return response.QueryResponseItems;
    }
}
