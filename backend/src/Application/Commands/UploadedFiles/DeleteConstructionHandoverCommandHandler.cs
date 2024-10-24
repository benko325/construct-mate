using ConstructMate.Core;
using ConstructMate.Core.Events.UploadedFiles;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Marten;

namespace ConstructMate.Application.Commands.UploadedFiles;

/// <summary>
/// Delete construction handover command
/// </summary>
/// <param name="ConstructionId">Id of construction which construction handover has to be deleted</param>
/// <param name="RequesterId">Id of user who sent the request</param>
public record DeleteConstructionHandoverCommand(Guid ConstructionId, Guid RequesterId);

/// <summary>
/// Delete construction's construction handover (delete from system and set url to null)
/// </summary>
public class DeleteConstructionHandoverCommandHandler
{
    public static async Task<Construction> LoadAsync(DeleteConstructionHandoverCommand fileCommand, IQuerySession session,
        CancellationToken cancellationToken)
    {
        var construction = await session.LoadAsync<Construction>(fileCommand.ConstructionId, cancellationToken);
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound,
            "Construction from which the construction handover has to be deleted not found");
        StatusCodeGuard.IsEqualTo(fileCommand.RequesterId, construction.OwnerId, StatusCodes.Status401Unauthorized,
            "User can only manipulate with his constructions");
        StatusCodeGuard.IsNotNull(construction.ConstructionHandoverFileUrl,
            StatusCodes.Status405MethodNotAllowed, "No construction handover to be deleted");

        return construction;
    }

    public static async Task<ConstructionHandoverDeleted> Handle(DeleteConstructionHandoverCommand fileCommand, Construction construction,
        IDocumentSession session, CancellationToken cancellationToken)
    {
        // can not be null as it is checked in LoadAsync
        File.Delete(construction.ConstructionHandoverFileUrl);
        construction.ConstructionHandoverFileUrl = null;

        session.Update(construction);
        await session.SaveChangesAsync(cancellationToken);

        return new ConstructionHandoverDeleted(construction.Id);
    }
}
