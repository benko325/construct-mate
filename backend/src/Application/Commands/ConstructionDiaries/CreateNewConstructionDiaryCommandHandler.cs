using ConstructMate.Core;
using ConstructMate.Core.Events.ConstructionDiaries;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Mapster;
using Marten;

namespace ConstructMate.Application.Commands.ConstructionDiaries;

/// <summary>
/// Create a new construction diary command
/// </summary>
/// <param name="RequesterId">Id of user who sent the request</param>
/// <param name="ConstructionId">Id of construction for which a diary has to be created</param>
/// <param name="Id">Id of new diary</param>
/// <param name="DiaryDateFrom">Start date of new diary</param>
/// <param name="DiaryDateTo">End date of new diary</param>
/// <param name="ConstructionManager">Manager of the construction</param>
/// <param name="ConstructionSupervisor">Supervisor of the construction</param>
/// <param name="Name">Name of the construction</param>
/// <param name="Address">Address of the construction</param>
/// <param name="ConstructionApproval">Approval for the construction</param>
/// <param name="Investor">Investor of the construction</param>
/// <param name="Implementer">Implementer of the construction</param>
/// <param name="UpdateConstructionDates">Update dates of the construction with the diary ones</param>
public record CreateNewConstructionDiaryCommand(
    Guid RequesterId,
    Guid ConstructionId,
    Guid Id,
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
/// Create a new construction diary
/// </summary>
public class CreateNewConstructionDiaryCommandHandler
{
    public static async Task<Construction> LoadAsync(CreateNewConstructionDiaryCommand diaryCommand, IQuerySession session,
        CancellationToken cancellationToken)
    {
        var construction = await session.LoadAsync<Construction>(diaryCommand.ConstructionId, cancellationToken);
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound,
            "Construction where a new diary has to be created not found");
        StatusCodeGuard.IsEqualTo(construction.OwnerId, diaryCommand.RequesterId, StatusCodes.Status403Forbidden,
            "User can only create diary in his constructions");
        StatusCodeGuard.IsNull(construction.ConstructionDiary, StatusCodes.Status400BadRequest,
            "Diary was already created for this construction");

        return construction;
    }

    public static async Task<ConstructionDiaryCreated> Handle(CreateNewConstructionDiaryCommand diaryCommand,
        Construction construction, IDocumentSession session, CancellationToken cancellationToken)
    {
        var diary = diaryCommand.Adapt<ConstructionDiary>();
        for (var date = diaryCommand.DiaryDateFrom; date <= diaryCommand.DiaryDateTo; date = date.AddDays(1))
        {
            var dailyRecord = new DailyRecord() { Date = date };
            diary.DailyRecords.Add(dailyRecord);
        }

        if (diaryCommand.UpdateConstructionDates)
        {
            construction.StartDate = diary.DiaryDateFrom;
            construction.EndDate = diary.DiaryDateTo;
        }

        construction.ConstructionDiary = diary;
        session.Update(construction);
        await session.SaveChangesAsync(cancellationToken);

        return new ConstructionDiaryCreated(diary.Id, construction.Id);
    }
}