using ConstructMate.Core;
using ConstructMate.Core.Events.ConstructionDiaries;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Mapster;
using Marten;

namespace ConstructMate.Application.Commands.ConstructionDiaries;

/// <summary>
/// 
/// </summary>
/// <param name="RequesterId"></param>
/// <param name="ConstructionId"></param>
/// <param name="Id"></param>
/// <param name="ConstructionManager"></param>
/// <param name="ConstructionSupervisor"></param>
/// <param name="Name"></param>
/// <param name="Address"></param>
/// <param name="ConstructionApproval"></param>
/// <param name="Investor"></param>
/// <param name="Implementer"></param>
/// <param name="Description"></param>
public record CreateNewConstructionDiaryCommand(
    Guid RequesterId,
    Guid ConstructionId,
    Guid Id,
    string ConstructionManager,
    string ConstructionSupervisor,
    string Name,
    string Address,
    string ConstructionApproval,
    string Investor,
    string Implementer,
    string? Description = null);

/// <summary>
/// 
/// </summary>
public class CreateNewConstructionDiaryCommandHandler
{
    public static async Task<Construction> LoadAsync(CreateNewConstructionDiaryCommand diaryCommand, IQuerySession session,
        CancellationToken cancellationToken)
    {
        var construction = await session.LoadAsync<Construction>(diaryCommand.ConstructionId, cancellationToken);
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound,
            "Construction where a new diary has to be created not found");
        StatusCodeGuard.IsEqualTo(construction.OwnerId, diaryCommand.RequesterId, StatusCodes.Status401Unauthorized,
            "User can only create diary in his constructions");
        StatusCodeGuard.IsNull(construction.ConstructionDiary, StatusCodes.Status400BadRequest,
            "Diary was already created for this construction");

        return construction;
    }

    public static async Task<ConstructionDiaryCreated> Handle(CreateNewConstructionDiaryCommand diaryCommand,
        Construction construction, IDocumentSession session, CancellationToken cancellationToken)
    {
        var diary = diaryCommand.Adapt<ConstructionDiary>();
        // TODO: create daily records in diary based on startDate and endDate

        construction.ConstructionDiary = diary;
        session.Update(construction);
        await session.SaveChangesAsync(cancellationToken);

        return new ConstructionDiaryCreated(diary.Id, construction.Id);
    }
}