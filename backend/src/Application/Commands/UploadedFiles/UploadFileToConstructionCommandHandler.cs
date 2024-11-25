using ConstructMate.Core;
using ConstructMate.Core.Events.UploadedFiles;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Mapster;
using Marten;

namespace ConstructMate.Application.Commands.UploadedFiles;

/// <summary>
/// Upload file to construction command
/// </summary>
/// <param name="ConstructionId">Id of construction for which a new file has to be uploaded</param>
/// <param name="File">File to be uploaded</param>
/// <param name="RequesterId">Id of user who sent the request</param>
public record UploadFileToConstructionCommand(Guid ConstructionId, IFormFile File, Guid RequesterId);

/// <summary>
/// Upload file to construction (only pictures and PDFs)
/// </summary>
public class UploadFileToConstructionCommandHandler
{
    public static async Task<Construction> LoadAsync(UploadFileToConstructionCommand fileCommand,
        IQuerySession session,
        CancellationToken cancellationToken)
    {
        StatusCodeGuard.IsNotNull(fileCommand.File, StatusCodes.Status400BadRequest, "File to upload is missing");
        StatusCodeGuard.IsGreaterThan(fileCommand.File.Length, 0, StatusCodes.Status400BadRequest, "File to upload has 0 length");
        var allowedExtensions = new List<string>() { ".pdf", ".jpg", ".jpeg", ".png", ".svg" };
        StatusCodeGuard.IsTrue(allowedExtensions.Contains(Path.GetExtension(fileCommand.File.FileName)),
            StatusCodes.Status400BadRequest,
            "File has bad format (pdf, jpg, jpeg, png and svg are only allowed)");
        StatusCodeGuard.IsLessThanOrEqualTo(fileCommand.File.Length, Constants.MaxFileSize,
            StatusCodes.Status400BadRequest, "File is too big");
        
        var construction = await session.LoadAsync<Construction>(fileCommand.ConstructionId, cancellationToken);
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound,
            "Construction for which a new file has to be uploaded not found");
        StatusCodeGuard.IsEqualTo(construction.OwnerId, fileCommand.RequesterId, StatusCodes.Status403Forbidden,
            "User can only manipulate his constructions");
        
        var newFilePath =
            $"{Constants.FilesFolder}/{construction.OwnerId}/{construction.Id}/{fileCommand.File.FileName}";
        var filePaths = construction.Files.Select(f => f.FilePath);
        StatusCodeGuard.IsFalse(filePaths.Contains(newFilePath), StatusCodes.Status403Forbidden,
            "File with given name already uploaded");

        return construction;
    }

    public static async Task<FileUploadedToConstruction> Handle(UploadFileToConstructionCommand fileCommand,
        Construction construction,
        IDocumentSession session, CancellationToken cancellationToken)
    {
        var filePath = $"{Constants.FilesFolder}/{construction.OwnerId}/{construction.Id}/{fileCommand.File.FileName}";
        await using var stream = new FileStream(filePath, FileMode.Create);
        await fileCommand.File.CopyToAsync(stream, cancellationToken);

        var newUploadedFile = new UploadedFile()
        {
            Id = Guid.NewGuid(), FilePath = filePath, FileSize = fileCommand.File.Length
        };
        construction.Files.Add(newUploadedFile);
        session.Update(construction);
        await session.SaveChangesAsync(cancellationToken);

        return newUploadedFile.Adapt<FileUploadedToConstruction>() with { ConstructionId = fileCommand.ConstructionId };
    }
}