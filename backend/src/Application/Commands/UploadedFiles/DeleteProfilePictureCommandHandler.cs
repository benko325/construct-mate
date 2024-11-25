using ConstructMate.Core;
using ConstructMate.Core.Events.UploadedFiles;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Marten;

namespace ConstructMate.Application.Commands.UploadedFiles;

/// <summary>
/// Delete construction's profile picture command
/// </summary>
/// <param name="ConstructionId">Id of construction which profile picture has to be deleted</param>
/// <param name="RequesterId">Id of user who sent the request</param>
public record DeleteProfilePictureCommand(Guid ConstructionId, Guid RequesterId);

/// <summary>
/// Delete construction's profile picture (delete from system and set url to default)
/// </summary>
public class DeleteProfilePictureCommandHandler
{
    public static async Task<Construction> LoadAsync(DeleteProfilePictureCommand profilePictureCommand, IQuerySession session,
        CancellationToken cancellationToken)
    {
        var construction = await session.LoadAsync<Construction>(profilePictureCommand.ConstructionId, cancellationToken);
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound,
            "Construction from which the profile picture has to be deleted not found");
        StatusCodeGuard.IsEqualTo(profilePictureCommand.RequesterId, construction.OwnerId, StatusCodes.Status403Forbidden,
            "User can only manipulate with his constructions");
        StatusCodeGuard.IsFalse(construction.ProfilePictureUrl == Constants.DefaultConstructionProfilePictureUrl,
            StatusCodes.Status405MethodNotAllowed, "No profile picture to be deleted");

        return construction;
    }

    public static async Task<ProfilePictureDeleted> Handle(DeleteProfilePictureCommand profilePictureCommand, Construction construction, 
        IDocumentSession session, CancellationToken cancellationToken)
    {
        File.Delete(construction.ProfilePictureUrl);
        construction.ProfilePictureUrl = Constants.DefaultConstructionProfilePictureUrl;

        session.Update(construction);
        await session.SaveChangesAsync(cancellationToken);

        return new ProfilePictureDeleted(construction.Id, construction.ProfilePictureUrl);
    }
}
