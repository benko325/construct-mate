using ConstructMate.Core;
using ConstructMate.Core.Events.Constructions;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Marten;
using Microsoft.AspNetCore.Identity;

namespace ConstructMate.Application.Commands.Constructions;

/// <summary>
/// Add new diary contributor request
/// </summary>
/// <param name="ConstructionId">Id of construction where a new diary contributor has to be added</param>
/// <param name="ContributorEmail">Email of new contributor to the diary</param>
/// <param name="ContributorRole">Role of the contributor (for example designer (projektant), supervisor (dozor), ...)</param>
/// <param name="RequesterId">Id of user who sent the request</param>
public record AddNewDiaryContributorCommand(Guid ConstructionId, string ContributorEmail, string ContributorRole, Guid RequesterId);

/// <summary>
/// Add new contributor to the diary
/// </summary>
public class AddNewDiaryContributorCommandHandler
{
    public static async Task<(Construction, DiaryContributor)> LoadAsync(AddNewDiaryContributorCommand constructionCommand, UserManager<ApplicationUser> userManager,
        IQuerySession session, CancellationToken cancellationToken)
    {
        var construction = await session.LoadAsync<Construction>(constructionCommand.ConstructionId, cancellationToken);
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound, "Construction where a new contributor has to be added not found");
        StatusCodeGuard.IsEqualTo(construction.OwnerId, constructionCommand.RequesterId, StatusCodes.Status401Unauthorized,
            "User can only modify his constructions");

        var newContributorUser = await userManager.FindByEmailAsync(constructionCommand.ContributorEmail);
        StatusCodeGuard.IsNotNull(newContributorUser, StatusCodes.Status404NotFound, "New contributor not found");
        StatusCodeGuard.IsFalse(construction.DiaryContributors.Select(c => c.ContributorId).Contains(newContributorUser.Id),
            StatusCodes.Status400BadRequest, "User already added as contributor to this diary");

        var newContributor = new DiaryContributor()
        {
            ContributorId = newContributorUser.Id,
            ContributorRole = constructionCommand.ContributorRole
        };
              
        return (construction, newContributor);
    }

    public static async Task<ConstructionDiaryContributorAdded> Handle(AddNewDiaryContributorCommand constructionCommand,
        (Construction, DiaryContributor) constructionContributor, IDocumentSession session, CancellationToken cancellationToken)
    {
        var construction = constructionContributor.Item1;
        var contributor = constructionContributor.Item2;

        construction.DiaryContributors.Add(contributor);
        session.Update(construction);
        await session.SaveChangesAsync(cancellationToken);

        return new ConstructionDiaryContributorAdded(construction.Id, contributor.ContributorId, contributor.ContributorRole);
    }
}
