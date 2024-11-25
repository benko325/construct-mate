using ConstructMate.Core;
using ConstructMate.Core.Events.UploadedFiles;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Marten;

namespace ConstructMate.Application.Commands.UploadedFiles;

/// <summary>
/// Delete file with specified Id from the construction command
/// </summary>
/// <param name="ConstructionId">Id of a construction from where a file has to be deleted</param>
/// <param name="FileId">Id of file that has to be deleted</param>
/// <param name="RequesterId">Id of user who sent the request</param>
public record DeleteFileFromConstructionCommand(Guid ConstructionId, Guid FileId, Guid RequesterId);

/// <summary>
/// Delete file with specified Id from the construction
/// </summary>
public class DeleteFileFromConstructionCommandHandler
{
    public static async Task<(Construction, UploadedFile)> LoadAsync(DeleteFileFromConstructionCommand fileCommand,
        IQuerySession session,
        CancellationToken cancellationToken)
    {
        var construction = await session.LoadAsync<Construction>(fileCommand.ConstructionId, cancellationToken);
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound,
            "Construction with specified Id not found");
        StatusCodeGuard.IsEqualTo(construction.OwnerId, fileCommand.RequesterId, StatusCodes.Status403Forbidden,
            "User can only manipulate with hist constructions");

        var uploadedFileToDelete = construction.Files.FirstOrDefault(f => f.Id == fileCommand.FileId);
        StatusCodeGuard.IsNotNull(uploadedFileToDelete, StatusCodes.Status404NotFound,
            "File with specified Id not found in the construction");
        
        return (construction, uploadedFileToDelete);
    }

    public static async Task<FileDeletedFromConstruction> Handle(DeleteFileFromConstructionCommand fileCommand,
        Construction construction, UploadedFile fileToDelete, IDocumentSession session,
        CancellationToken cancellationToken)
    {
        File.Delete(fileToDelete.FilePath);
        construction.Files.Remove(fileToDelete);
        
        session.Update(construction);
        await session.SaveChangesAsync(cancellationToken);

        return new FileDeletedFromConstruction(construction.Id, fileToDelete.Id);
    }
}