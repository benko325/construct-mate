using ConstructMate.Application.Commands.ConstructionDiaries;
using ConstructMate.Application.ServiceInterfaces;
using ConstructMate.Core;
using ConstructMate.Core.Events.ConstructionDiaries;
using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wolverine;
using Wolverine.Http;

namespace ConstructMate.Api;

/// <summary>
/// 
/// </summary>
/// <param name="ConstructionManager"></param>
/// <param name="ConstructionSupervisor"></param>
/// <param name="Name"></param>
/// <param name="Address"></param>
/// <param name="ConstructionApproval"></param>
/// <param name="Investor"></param>
/// <param name="Implementer"></param>
/// <param name="Description"></param>
public record CreateNewConstructionDiaryRequest(
    string ConstructionManager,
    string ConstructionSupervisor,
    string Name,
    string Address,
    string ConstructionApproval,
    string Investor,
    string Implementer,
    string? Description = null);

public class ConstructionDiariesEndpoint
{
    /// <summary>
    /// Create a new construction diary
    /// </summary>
    /// <param name="id">Id of construction in which a new diary has to be created</param>
    /// <param name="request"><see cref="CreateNewConstructionDiaryRequest"/></param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <returns>ConstructionDiaryCreated - Id of new diary and construction</returns>
    [ProducesResponseType<ConstructionDiaryCreated>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverinePost("/construction/{id}/diary")]
    public static async Task<ConstructionDiaryCreated> CreateNewDiary([FromRoute] Guid id,
        [FromBody] CreateNewConstructionDiaryRequest request, IMessageBus bus, IApplicationUserContext userContext)
    {
        var command = request.Adapt<CreateNewConstructionDiaryCommand>() with { Id = Guid.NewGuid(), RequesterId = userContext.UserId, ConstructionId = id };
        var result = await bus.InvokeAsync<ConstructionDiaryCreated>(command);
        return result;
    }
}