using ConstructMate.Core;
using ConstructMate.Core.Events.UploadedFiles;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Marten;

namespace ConstructMate.Application.Commands.UploadedFiles;

/// <summary>
/// Upload new profile picture command
/// </summary>
/// <param name="File">Picture to be uploaded</param>
/// <param name="ConstructionId">Id of construction where a new profile picture has to be uploaded</param>
/// <param name="RequesterId">Id of user who sent the request</param>
public record UploadProfilePictureCommand(IFormFile File, Guid ConstructionId, Guid RequesterId);

/// <summary>
/// Upload new construction profile picture (when there is already one, delete it and update new)
/// </summary>
public class UploadProfilePictureCommandHandler
{
    public static async Task<Construction> LoadAsync(UploadProfilePictureCommand fileCommand, IQuerySession session, CancellationToken cancellationToken)
    {
        StatusCodeGuard.IsNotNull(fileCommand.File, StatusCodes.Status400BadRequest, "File to upload is missing");
        StatusCodeGuard.IsGreaterThan(fileCommand.File.Length, 0, StatusCodes.Status400BadRequest, "File to upload has 0 length");
        var allowedExtensions = new List<string>() { ".jpg", ".jpeg", ".png", ".svg" };
        StatusCodeGuard.IsTrue(allowedExtensions.Contains(Path.GetExtension(fileCommand.File.FileName)), StatusCodes.Status400BadRequest,
            "File has bad format (jpg, jpeg, png and svg are only allowed)");
        StatusCodeGuard.IsLessThanOrEqualTo(fileCommand.File.Length, Constants.MaxFileSize,
            StatusCodes.Status400BadRequest, "File is too big");

        var construction = await session.LoadAsync<Construction>(fileCommand.ConstructionId, cancellationToken);
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound,
            "Construction for which a profile picture has to be uploaded not found");

        StatusCodeGuard.IsEqualTo(construction.OwnerId, fileCommand.RequesterId, StatusCodes.Status403Forbidden,
            "User can only manipulate his constructions");

        return construction;
    }

    public static async Task<ProfilePictureUploaded> Handle(UploadProfilePictureCommand fileCommand, Construction construction,
        IDocumentSession session, CancellationToken cancellationToken)
    {
        if (construction.ProfilePictureUrl != Constants.DefaultConstructionProfilePictureUrl)
        {
            File.Delete(construction.ProfilePictureUrl);
        }

        var newId = Guid.NewGuid();
        var filePath = $"{Constants.FilesFolder}/{construction.OwnerId}/{construction.Id}/{newId}-{fileCommand.File.FileName}";

        using var stream = new FileStream(filePath, FileMode.Create);
        await fileCommand.File.CopyToAsync(stream, cancellationToken);

        construction.ProfilePictureUrl = filePath;
        session.Update(construction);
        await session.SaveChangesAsync(cancellationToken);

        return new ProfilePictureUploaded(construction.Id, construction.ProfilePictureUrl);
    }
}
