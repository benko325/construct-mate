using ConstructMate.Core;
using ConstructMate.Core.Events.UploadedFiles;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Marten;

namespace ConstructMate.Application.Commands.UploadedFiles;

/// <summary>
/// Delete building permit command
/// </summary>
/// <param name="ConstructionId">Id of construction which building permit has to be deleted</param>
/// <param name="RequesterId">Id of user who sent the request</param>
public record DeleteBuildingPermitCommand(Guid ConstructionId, Guid RequesterId);

/// <summary>
/// Delete construction's building permit (delete from system and set url to null)
/// </summary>
public class DeleteBuildingPermitCommandHandler
{
    public static async Task<Construction> LoadAsync(DeleteBuildingPermitCommand buildingPermitCommand, IQuerySession session,
        CancellationToken cancellationToken)
    {
        var construction = await session.LoadAsync<Construction>(buildingPermitCommand.ConstructionId, cancellationToken);
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound,
            "Construction from which the building permit has to be deleted not found");
        StatusCodeGuard.IsEqualTo(buildingPermitCommand.RequesterId, construction.OwnerId, StatusCodes.Status401Unauthorized,
            "User can only manipulate with his constructions");
        StatusCodeGuard.IsNotNull(construction.BuildingPermitFileUrl,
            StatusCodes.Status405MethodNotAllowed, "No building permit to be deleted");

        return construction;
    }

    public static async Task<BuildingPermitDeleted> Handle(DeleteBuildingPermitCommand buildingPermitCommand, Construction construction,
        IDocumentSession session, CancellationToken cancellationToken)
    {
        // can not be null as it is checked in LoadAsync
        File.Delete(construction.BuildingPermitFileUrl);
        construction.BuildingPermitFileUrl = null;

        session.Update(construction);
        await session.SaveChangesAsync(cancellationToken);

        return new BuildingPermitDeleted(construction.Id);
    }
}
