using ConstructMate.Core;
using ConstructMate.Core.Events.Constructions;
using Mapster;
using Marten;

namespace ConstructMate.Application.Commands.Constructions;

/// <summary>
/// Create construction command
/// </summary>
/// <param name="Id">Id of construction to be created</param>
/// <param name="Name">Name of the construction to be created</param>
/// <param name="Description">Description of the construction to be created (not required)</param>
/// <param name="OwnerId">Id of user who created the new construction</param>
public record CreateConstructionCommand(Guid Id, string Name, string? Description, Guid OwnerId);

/// <summary>
/// Create a new construction with directory to store its files
/// </summary>
public class CreateConstructionCommandHandler
{
    public static async Task<ConstructionCreated> Handle(CreateConstructionCommand constructionCommand,
        IDocumentSession session, CancellationToken cancellationToken)
    {
        var newConstruction = constructionCommand.Adapt<Construction>();

        // create folder for this construction
        var folderPath = $"{Constants.FilesFolder}/{newConstruction.OwnerId}/{newConstruction.Id}";
        Directory.CreateDirectory(folderPath);

        session.Store(newConstruction);
        await session.SaveChangesAsync(cancellationToken);

        return newConstruction.Adapt<ConstructionCreated>();
    }
}
