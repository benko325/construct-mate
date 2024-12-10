using ConstructMate.Core;
using ConstructMate.Core.Events.Constructions;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Mapster;
using Marten;

namespace ConstructMate.Application.Commands.Constructions;

/// <summary>
/// Modify an existing construction command
/// </summary>
/// <param name="Id"></param>
/// <param name="Name"></param>
/// <param name="Description"></param>
/// <param name="RequesterId"></param>
public record ModifyConstructionCommand(Guid Id, string Name, string? Description, Guid RequesterId);

/// <summary>
/// Modify an existing construction (it's name and description)
/// </summary>
public class ModifyConstructionCommandHandler
{
    public static async Task<Construction> LoadAsync(ModifyConstructionCommand constructionCommand,
        IQuerySession session, CancellationToken cancellationToken)
    {
        var construction = await session.LoadAsync<Construction>(constructionCommand.Id, cancellationToken);
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound,
            "Construction to be modified not found");
        StatusCodeGuard.IsEqualTo(constructionCommand.RequesterId, construction.OwnerId,
            StatusCodes.Status403Forbidden, "User can only modify his constructions");

        return construction;
    }

    public static async Task<ConstructionModified> Handle(ModifyConstructionCommand constructionCommand, Construction construction,
        IDocumentSession session, CancellationToken cancellationToken)
    {
        construction.Name = constructionCommand.Name;
        construction.Description = constructionCommand.Description;

        session.Update(construction);
        await session.SaveChangesAsync(cancellationToken);

        return construction.Adapt<ConstructionModified>();
    }
}
