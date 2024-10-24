using ConstructMate.Core;
using ConstructMate.Core.Events.Constructions;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Mapster;
using Marten;

namespace ConstructMate.Application.Commands.Constructions;

/// <summary>
/// Delete construction command
/// </summary>
/// <param name="Id">Id of construction to be deleted</param>
/// <param name="RequesterId">Id of user who called an endpoint to delete the construction</param>
public record DeleteConstructionCommand(Guid Id, Guid RequesterId);

/// <summary>
/// Delete construction with its folder and all files in it
/// </summary>
public class DeleteConstructionCommandHandler
{
    public static async Task<Construction> LoadAsync(DeleteConstructionCommand constructionCommand,
        IQuerySession session, CancellationToken cancellationToken)
    {
        var construction = await session.LoadAsync<Construction>(constructionCommand.Id, cancellationToken);
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound, "Construction to delete not found");
        StatusCodeGuard.IsEqualTo(construction.OwnerId, constructionCommand.RequesterId,
            StatusCodes.Status401Unauthorized, "User can only delete his constructions");

        return construction;
    }

    public static async Task<ConstructionDeleted> Handle(DeleteConstructionCommand constructionCommand,
        Construction construction, IDocumentSession session, CancellationToken cancellationToken)
    {
        session.Delete(construction);
        await session.SaveChangesAsync(cancellationToken);

        // delete folder with all construction's files + also in DB!!
        var folderPath = $"{Constants.FilesFolder}/{construction.OwnerId}/{construction.Id}";
        Directory.Delete(folderPath, true);

        return construction.Adapt<ConstructionDeleted>();
    }
}
