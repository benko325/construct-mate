using ConstructMate.Core;
using ConstructMate.Core.Events.Constructions;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Marten;

namespace ConstructMate.Application.Commands.Constructions;

/// <summary>
/// Modify construction's start and end date request
/// </summary>
/// <param name="ConstructionId">Id of construction where a start and end date has to be modified</param>
/// <param name="StartDate">New start date</param>
/// <param name="EndDate">New end date</param>
/// <param name="RequesterId">Id of user who sent the request</param>
public record ModifyConstructionStartEndDateCommand(Guid ConstructionId, DateTime StartDate, DateTime EndDate, Guid RequesterId);

/// <summary>
/// Modify construction's start and end date
/// </summary>
public class ModifyConstructionStartEndDateCommandHandler
{
    public static async Task<Construction> LoadAsync(ModifyConstructionStartEndDateCommand constructioncommand,
        IQuerySession session, CancellationToken cancellationToken)
    {
        var construction = await session.LoadAsync<Construction>(constructioncommand.ConstructionId, cancellationToken);
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound, "Construction to modify not found");
        StatusCodeGuard.IsEqualTo(construction.OwnerId, constructioncommand.RequesterId, StatusCodes.Status401Unauthorized,
            "User can modify only his constructions");

        return construction;
    }

    public static async Task<ConstructionStartEndDateModified> Handle(ModifyConstructionStartEndDateCommand constructioncommand,
        Construction construction, IDocumentSession session, CancellationToken cancellationToken)
    {
        construction.StartDate = constructioncommand.StartDate;
        construction.EndDate = constructioncommand.EndDate;
        
        session.Update(construction);
        await session.SaveChangesAsync(cancellationToken);

        return new ConstructionStartEndDateModified(construction.Id, construction.StartDate, construction.EndDate);
    }
}