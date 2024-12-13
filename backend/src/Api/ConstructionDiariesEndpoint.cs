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
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
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
/// <param name="ContributorEmail">Email of new contributor to the diary</param>
/// <param name="ContributorRole">Role of the contributor (for example designer (projektant), supervisor (dozor), ...)</param>
public record AddNewDiaryContributorRequest(
    string ContributorEmail,
    DiaryContributorRole ContributorRole);

/// <summary>
/// Modify diary from and to dates
/// </summary>
/// <param name="NewDateFrom">New diary date from</param>
/// <param name="NewDateTo">New diary date to</param>
/// <param name="UpdateConstructionDates">If the construction dates have also to be updated</param>
public record ModifyDiaryFromToDatesRequest(
    DateOnly NewDateFrom,
    DateOnly NewDateTo,
    bool UpdateConstructionDates);

/// <summary>
/// Add new diary record request
/// </summary>
/// <param name="Content">Content (text) of the record</param>
/// <param name="RecordCategory">Category of the record</param>
public record AddNewDiaryRecordRequest(string Content, DiaryRecordCategory RecordCategory);

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
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverinePost("/constructions/{id}/diary")]
    public static async Task<ConstructionDiaryCreated> CreateNewDiary([FromRoute] Guid id,
        [FromBody] CreateNewConstructionDiaryRequest request, IMessageBus bus, IApplicationUserContext userContext)
    {
        StatusCodeGuard.IsGreaterThan(request.DiaryDateTo, request.DiaryDateFrom, StatusCodes.Status400BadRequest,
            "EndDate must be later than StartDate");
        
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
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status403Forbidden)]
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
            StatusCodes.Status403Forbidden,
            "User can see only diaries made by him or where he is allowed to contribute");

        return construction.ConstructionDiary;
    }

    /// <summary>
    /// Get construction diary by Id
    /// </summary>
    /// <param name="id">Id of the diary</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>ConstructionDiary</returns>
    [ProducesResponseType<ConstructionDiary>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverineGet("/construction-diaries/{id}")]
    public static async Task<ConstructionDiary> GetConstructionDiaryById([FromRoute] Guid id,
        IApplicationUserContext userContext, IMessageBus bus)
    {
        var query = new GetConstructionDiaryByIdQuery(id, userContext.UserId);
        var response = await bus.InvokeAsync<ConstructionDiary>(query);
        return response;
    }
    
    /// <summary>
    /// Get all actual diaries where the logged-in user is added as a contributor (without those that he created)
    /// </summary>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>Collection of not ended construction diaries</returns>
    [ProducesResponseType<IEnumerable<ConstructionDiary>>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [Authorize]
    [WolverineGet("/contribution-diaries")]
    public static async Task<IEnumerable<ConstructionDiary>> GetAllDiariesWhereUserIsContributor(
        IApplicationUserContext userContext, IMessageBus bus)
    {
        var query = new GetAllUnfinishedContributionDiariesQuery(userContext.UserId);
        var result = await bus.InvokeAsync<QueryCollectionResponse<ConstructionDiary>>(query);
        return result.QueryResponseItems;
    }
    
    /// <summary>
    /// Get all finished diaries where the logged-in user is added as a contributor (without those that he created)
    /// </summary>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>Collection of ended construction diaries</returns>
    [ProducesResponseType<IEnumerable<ConstructionDiary>>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [Authorize]
    [WolverineGet("/my-finished-contribution-diaries")]
    public static async Task<IEnumerable<ConstructionDiary>> GetAllEndedDiariesWhereUserIsContributor(
        IApplicationUserContext userContext, IMessageBus bus)
    {
        var query = new GetAllFinishedContributionDiariesQuery(userContext.UserId);
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
    [WolverinePost("/constructions/{id}/diary-contributors")]
    public static async Task<ConstructionDiaryContributorAdded> AddNewContributorToTheConstructionDiary([FromRoute] Guid id,
        [FromBody] AddNewDiaryContributorRequest request, IMessageBus bus, IApplicationUserContext userContext)
    {
        var command = request.Adapt<AddNewDiaryContributorCommand>() with
        {
            RequesterId = userContext.UserId,
            ConstructionId = id
        };
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
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status403Forbidden)]
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
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverinePut("/construction-diaries/{id}/dates")]
    public static async Task<DiaryFromToDatesModified> ModifyDiaryDatesFromAndTo([FromRoute] Guid id,
        [FromBody] ModifyDiaryFromToDatesRequest request, IApplicationUserContext userContext,
        IMessageBus bus)
    {
        StatusCodeGuard.IsGreaterThan(request.NewDateTo, request.NewDateFrom, StatusCodes.Status400BadRequest,
            "EndDate must be later than StartDate");
        
        var command = request.Adapt<ModifyDiaryFromToDatesCommand>() with 
        { 
            RequesterId = userContext.UserId, 
            DiaryId = id
        };
        var result = await bus.InvokeAsync<DiaryFromToDatesModified>(command);
        return result;
    }
    
    /// <summary>
    /// Get diary's first and last day with record
    /// </summary>
    /// <param name="id">Id of diary which first and last day with records have to be returned</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>DiaryFirstLastDayWithRecords - diary's Id with days (if days are null then there is no record in the diary)</returns>
    [ProducesResponseType<DiaryFirstLastDayWithRecords>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status500InternalServerError)]
    [Authorize]
    [WolverineGet("/construction-diaries/{id}/record-boundaries")]
    public static async Task<DiaryFirstLastDayWithRecords> GetFirstAndLastDayWithDiaryRecord(Guid id, IMessageBus bus)
    {
        var query = new GetDiaryFirstAndLastDayWithRecordQuery(id);
        var result = await bus.InvokeAsync<DiaryFirstLastDayWithRecords>(query);
        return result;
    }

    /// <summary>
    /// Add new diary text record
    /// </summary>
    /// <remarks>
    /// If date is greater than diary's DiaryDateTo, new Daily record for the day will be added and DiaryDateTo will be updated <br/>
    /// Text will be added chronologically after the last record in respected category
    /// </remarks>
    /// <param name="id">Id of diary where a new record has to be added</param>
    /// <param name="request"><see cref="AddNewDiaryRecordRequest"/></param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>NewDiaryRecordAdded</returns>
    [ProducesResponseType<NewDiaryTextRecordAdded>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status500InternalServerError)]
    [Authorize]
    [WolverinePost("/construction-diaries/{id}/diary-text-records")]
    public static async Task<NewDiaryTextRecordAdded> AddNewDiaryTextRecord([FromRoute] Guid id,
        [FromBody] AddNewDiaryRecordRequest request,
        IApplicationUserContext userContext, IMessageBus bus)
    {
        var command = request.Adapt<AddNewDiaryTextRecordCommand>() with { RequesterId = userContext.UserId, DiaryId = id };
        var response = await bus.InvokeAsync<NewDiaryTextRecordAdded>(command);
        return response;
    }
    
    /// <summary>
    /// Add new diary picture record (jpg, jpeg, png and svg are only allowed)
    /// </summary>
    /// <remarks>
    /// If date is greater than diary's DiaryDateTo, new Daily record for the day will be added and DiaryDateTo will be updated <br/>
    /// Picture will be added chronologically after the last record in respected category
    /// </remarks>
    /// <param name="id">Id of diary where a new record has to be added</param>
    /// <param name="file">Picture that has to be added to the diary</param>
    /// <param name="diaryRecordCategory"><see cref="DiaryRecordCategory"/></param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>NewDiaryPictureRecordAdded</returns>
    [ProducesResponseType<NewDiaryPictureRecordAdded>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverinePost("/construction-diaries/{id}/diary-picture")]
    public static async Task<NewDiaryPictureRecordAdded> AddNewPictureToTheDiary([FromRoute] Guid id,
        [FromForm] IFormFile file, [FromQuery] DiaryRecordCategory diaryRecordCategory,
        IApplicationUserContext userContext, IMessageBus bus)
    {
        var command = new AddNewDiaryPictureRecordCommand(id, file, userContext.UserId, diaryRecordCategory);
        var result = await bus.InvokeAsync<NewDiaryPictureRecordAdded>(command);
        return result;
    }

    /// <summary>
    /// Get info about all diary contributors
    /// </summary>
    /// <param name="id">Id of diary for which the contributors info have to be returned</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>List of <see cref="DiaryContributorInfo"/></returns>
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [Authorize]
    [WolverineGet("/construction-diaries/{id}/contributors")]
    public static async Task<IEnumerable<DiaryContributorInfo>> GetAllContributorsInfo([FromRoute] Guid id,
        IApplicationUserContext userContext, IMessageBus bus)
    {
        var query = new GetAllDiaryContributorsInfoQuery(id, userContext.UserId);
        var result = await bus.InvokeAsync<QueryCollectionResponse<DiaryContributorInfo>>(query);
        return result.QueryResponseItems;
    }

    /// <summary>
    /// Export diary to the Pdf file
    /// </summary>
    /// <param name="id">Id of the diary to export</param>
    /// <param name="userContext">Injected custom user context</param>
    /// <param name="bus">Injected IMessageBus by Wolverine</param>
    /// <returns>Pdf from the diary to download</returns>
    [Produces("application/pdf")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status401Unauthorized)]
    [Authorize]
    [WolverineGet("/construction-diaries/{id}/export")]
    public static async Task<IResult> ExportDiaryToPdf([FromRoute] Guid id, IApplicationUserContext userContext,
        IMessageBus bus)
    {
        QuestPDF.Settings.License = LicenseType.Community;
        
        var query = new GetDiaryPdfFileQuery(id, userContext.UserId);
        var document = await bus.InvokeAsync<ConstructionDiaryPdf>(query);
        
        var pdfStream = new MemoryStream();
        document.GeneratePdf(pdfStream);
        pdfStream.Position = 0;

        return Results.File(pdfStream, "application/pdf", "dennik-export.pdf");
    }
}