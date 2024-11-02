using ConstructMate.Application.Commands.ConstructionDiaries;
using ConstructMate.Application.Queries.ConstructionDiaries;
using ConstructMate.Application.Queries.Responses;
using ConstructMate.Application.ServiceInterfaces;
using ConstructMate.Core;
using ConstructMate.Core.Events.ConstructionDiaries;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wolverine;
using Wolverine.Http;
using Wolverine.Http.Marten;

namespace ConstructMate.Api;

/// <summary>
/// Create a new construction diary request
/// </summary>
/// <param name="DiaryDateFrom">Start date of the new diary</param>
/// <param name="DiaryDateTo">End date of the new diary</param>
/// <param name="ConstructionManager">Manager of the construction</param>
/// <param name="ConstructionSupervisor">Supervisor of the construction</param>
/// <param name="Name">Name of the construction</param>
/// <param name="Address">Address of the construction</param>
/// <param name="ConstructionApproval">Approval for the construction</param>
/// <param name="Investor">Investor of the construction</param>
/// <param name="Implementer">Implementer of the construction</param>
/// <param name="UpdateConstructionDates">Update dates of the construction with the diary ones</param>
public record CreateNewConstructionDiaryRequest(
    DateOnly DiaryDateFrom,
    DateOnly DiaryDateTo,
    string ConstructionManager,
    string ConstructionSupervisor,
    string Name,
    string Address,
    string ConstructionApproval,
    string Investor,
    string Implementer,
    bool UpdateConstructionDates);

/// <summary>
/// Add new contributor to the diary request
/// </summary>
/// <param name="ConstructionId">Id of construction where a new diary contributor has to be added</param>
/// <param name="ContributorEmail">Email of new contributor to the diary</param>
/// <param name="ContributorRole">Role of the contributor (for example designer (projektant), supervisor (dozor), ...)</param>
public record AddNewDiaryContributorRequest(
    Guid ConstructionId,
    string ContributorEmail,
    DiaryContributorRole ContributorRole);

/// <summary>
/// Modify diary from and to dates
/// </summary>
/// <param name="DiaryId">Id of diary to be modified</param>
/// <param name="NewDateFrom">New diary date from</param>
/// <param name="NewDateTo">New diary date to</param>
/// <param name="UpdateConstructionDates">If the construction dates have also to be updated</param>
public record ModifyDiaryFromToDatesRequest(
    Guid DiaryId,
    DateOnly NewDateFrom,
    DateOnly NewDateTo,
    bool UpdateConstructionDates);

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
    [WolverinePost("/constructions/{id}/diary")]
    public static async Task<ConstructionDiaryCreated> CreateNewDiary([FromRoute] Guid id,
        [FromBody] CreateNewConstructionDiaryRequest request, IMessageBus bus, IApplicationUserContext userContext)
    {
        var command = request.Adapt<CreateNewConstructionDiaryCommand>() with { Id = Guid.NewGuid(), RequesterId = userContext.UserId, ConstructionId = id };
        var result = await bus.InvokeAsync<ConstructionDiaryCreated>(command);
        return result;
    }
    
    /// <summary>
    /// Get construction diary by construction Id
    /// </summary>
    /// <param name="construction">Construction with defined Id</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <returns>ConstructionDiary</returns>
    [ProducesResponseType<ConstructionDiary>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverineGet("/constructions/{id}/diary")]
    public static ConstructionDiary GetConstructionDiary([Document] Construction construction,
        IApplicationUserContext userContext)
    {
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound,
            "Construction with defined Id not found");
        StatusCodeGuard.IsNotNull(construction.ConstructionDiary, StatusCodes.Status404NotFound,
            "Construction does not have diary created");
        var contributorIds = construction.ConstructionDiary.DiaryContributors.Select(c => c.ContributorId);
        StatusCodeGuard.IsTrue(construction.OwnerId == userContext.UserId || contributorIds.Contains(userContext.UserId),
            StatusCodes.Status401Unauthorized,
            "User can see only diaries made by him or where he is allowed to contribute");

        return construction.ConstructionDiary;
    }
    
    /// <summary>
    /// Get all diaries where the logged-in user is added as a contributor
    /// </summary>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>Collection of construction diaries</returns>
    [ProducesResponseType<IEnumerable<ConstructionDiary>>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [Authorize]
    [WolverineGet("/my-contribution-diaries")]
    public static async Task<IEnumerable<ConstructionDiary>> GetAllDiariesWhereUserIsContributor(IApplicationUserContext userContext,
        IMessageBus bus)
    {
        var query = new GetAllContributionDiariesQuery(userContext.UserId);
        var result = await bus.InvokeAsync<QueryCollectionResponse<ConstructionDiary>>(query);
        return result.QueryResponseItems;
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
        StatusCodeGuard.IsEqualTo(id, request.ConstructionId, StatusCodes.Status400BadRequest,
            "Id from route and request must be equal");

        var command = request.Adapt<AddNewDiaryContributorCommand>() with { RequesterId = userContext.UserId };
        var result = await bus.InvokeAsync<ConstructionDiaryContributorAdded>(command);
        return result;
    }

    /// <summary>
    /// Get construction diary's daily record by date
    /// </summary>
    /// <param name="id">Id of the diary which daily record has to be returned</param>
    /// <param name="date">Date of the daily record to be returned</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>DailyRecord of the diary</returns>
    [ProducesResponseType<DiaryRecord>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverineGet("/construction-diaries/{id}/daily-records")]
    public static async Task<DailyRecord> GetDiaryDailyRecordByDay([FromRoute] Guid id, [FromQuery] DateTime date,
        IApplicationUserContext userContext, IMessageBus bus)
    {
        var query = new GetDiaryDailyRecordQuery(id, DateOnly.FromDateTime(date), userContext.UserId);
        var result = await bus.InvokeAsync<DailyRecord>(query);
        return result;
    }

    /// <summary>
    /// Modify from and to dates of the diary
    /// </summary>
    /// <param name="id">Id of diary to be modified</param>
    /// <param name="request"><see cref="ModifyDiaryFromToDatesRequest"/></param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>DiaryFromToDatesModified - id of the diary and new dates</returns>
    [ProducesResponseType<DiaryFromToDatesModified>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [Authorize]
    [WolverinePatch("/construction-diaries/{id}/from-to-dates")]
    public static async Task<DiaryFromToDatesModified> ModifyDiaryDatesFromAndTo([FromRoute] Guid id,
        [FromBody] ModifyDiaryFromToDatesRequest request, IApplicationUserContext userContext,
        IMessageBus bus)
    {
        StatusCodeGuard.IsEqualTo(id, request.DiaryId, StatusCodes.Status400BadRequest,
            "Id from route and request must be equal");

        var command = request.Adapt<ModifyDiaryFromToDatesCommand>() with { RequesterId = userContext.UserId };
        var result = await bus.InvokeAsync<DiaryFromToDatesModified>(command);
        return result;
    }

    // [Authorize]
    // [WolverinePost("/construction-diaries/{id}/diary-records")]
    // public static async Task<> AddNewDiaryRecord()
    // {
    //     
    // }
    
    // TODO: add attachments to the diary records (just pictures)
    // TODO: export to PDF
    // TODO: TEST IT ALL!!!
}