using ConstructMate.Core;
using ConstructMate.Core.Events.UploadedFiles;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Marten;

namespace ConstructMate.Application.Commands.UploadedFiles;

/// <summary>
/// Upload building permit command
/// </summary>
/// <param name="ConstructionId">Id of construction where a building permit has to be uploaded</param>
/// <param name="File">Building permit file to be uploaded</param>
/// <param name="RequesterId">Id of user who sent the request</param>
public record UploadBuildingPermitCommand(Guid ConstructionId, IFormFile File, Guid RequesterId);

/// <summary>
/// Upload building permit (if there is already one, it will be replaced)
/// </summary>
public class UploadBuildingPermitCommandHandler
{
    public static async Task<Construction> LoadAsync(UploadBuildingPermitCommand fileCommand, IQuerySession session,
        CancellationToken cancellationToken)
    {
        StatusCodeGuard.IsNotNull(fileCommand.File, StatusCodes.Status400BadRequest, "File to upload is missing");
        StatusCodeGuard.IsGreaterThan(fileCommand.File.Length, 0, StatusCodes.Status400BadRequest, "File to upload has 0 length");
        StatusCodeGuard.IsTrue(Path.GetExtension(fileCommand.File.FileName) == ".pdf", StatusCodes.Status400BadRequest,
            "File has bad format (pdf is only allowed)");

        var construction = await session.LoadAsync<Construction>(fileCommand.ConstructionId, cancellationToken);
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound,
            "Construction for which a building permit has to be uploaded not found");

        StatusCodeGuard.IsEqualTo(construction.OwnerId, fileCommand.RequesterId, StatusCodes.Status401Unauthorized,
            "User can only manipulate his constructions");

        return construction;
    }

    public static async Task<BuildingPermitUploaded> Handle(UploadBuildingPermitCommand fileCommand, Construction construction,
        IDocumentSession session, CancellationToken cancellationToken)
    {
        if (construction.BuildingPermitFileUrl != null)
        {
            File.Delete(construction.BuildingPermitFileUrl);
        }

        var newId = Guid.NewGuid();
        var filePath = $"{Constants.FilesFolder}/{construction.OwnerId}/{construction.Id}/{newId}-{fileCommand.File.FileName}";

        using var stream = new FileStream(filePath, FileMode.Create);
        await fileCommand.File.CopyToAsync(stream, cancellationToken);

        construction.BuildingPermitFileUrl = filePath;
        session.Update(construction);
        await session.SaveChangesAsync(cancellationToken);

        return new BuildingPermitUploaded(construction.Id, construction.BuildingPermitFileUrl);
    }
}
