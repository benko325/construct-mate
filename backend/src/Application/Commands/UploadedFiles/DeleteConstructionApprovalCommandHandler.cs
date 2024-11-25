using ConstructMate.Core;
using ConstructMate.Core.Events.UploadedFiles;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Marten;

namespace ConstructMate.Application.Commands.UploadedFiles;

/// <summary>
/// Delete construction approval command
/// </summary>
/// <param name="ConstructionId">Id of construction which construction approval has to be deleted</param>
/// <param name="RequesterId">Id of user who sent the request</param>
public record DeleteConstructionApprovalCommand(Guid ConstructionId, Guid RequesterId);

/// <summary>
/// Delete construction's construction approval (delete from system and set url to null)
/// </summary>
public class DeleteConstructionApprovalCommandHandler
{
    public static async Task<Construction> LoadAsync(DeleteConstructionApprovalCommand fileCommand, IQuerySession session,
        CancellationToken cancellationToken)
    {
        var construction = await session.LoadAsync<Construction>(fileCommand.ConstructionId, cancellationToken);
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound,
            "Construction from which the construction approval has to be deleted not found");
        StatusCodeGuard.IsEqualTo(fileCommand.RequesterId, construction.OwnerId, StatusCodes.Status403Forbidden,
            "User can only manipulate with his constructions");
        StatusCodeGuard.IsNotNull(construction.ConstructionApprovalFileUrl,
            StatusCodes.Status405MethodNotAllowed, "No construction approval to be deleted");

        return construction;
    }

    public static async Task<ConstructionApprovalDeleted> Handle(DeleteConstructionApprovalCommand fileCommand, Construction construction,
        IDocumentSession session, CancellationToken cancellationToken)
    {
        // can not be null as it is checked in LoadAsync
        File.Delete(construction.ConstructionApprovalFileUrl!);
        construction.ConstructionApprovalFileUrl = null;

        session.Update(construction);
        await session.SaveChangesAsync(cancellationToken);

        return new ConstructionApprovalDeleted(construction.Id);
    }
}
