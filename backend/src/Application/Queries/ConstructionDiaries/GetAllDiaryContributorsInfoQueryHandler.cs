using ConstructMate.Application.Queries.Responses;
using ConstructMate.Core;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Marten;
using Microsoft.AspNetCore.Identity;

namespace ConstructMate.Application.Queries.ConstructionDiaries;

/// <summary>
/// Get info about all diary contributors query
/// </summary>
/// <param name="DiaryId">Id of diary for which the contributors info have to be returned</param>
/// <param name="RequesterId">Id of user who sent the request</param>
public record GetAllDiaryContributorsInfoQuery(Guid DiaryId, Guid RequesterId);

/// <summary>
/// Get info about all diary contributors
/// </summary>
public class GetAllDiaryContributorsInfoQueryHandler
{
    public static ConstructionDiary Load(GetAllDiaryContributorsInfoQuery contributorsInfoQuery,
        IQuerySession session, CancellationToken cancellationToken)
    {
        var construction = session.Query<Construction>()
            .FirstOrDefault(c =>
                c.ConstructionDiary != null && c.ConstructionDiary.Id == contributorsInfoQuery.DiaryId);
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound,
            "Diary from which a contributors info has to be returned not found");
        StatusCodeGuard.IsNotNull(construction.ConstructionDiary, StatusCodes.Status404NotFound,
            "Diary from which a contributors info has to be returned not found");
        
        StatusCodeGuard.IsTrue(construction.OwnerId == contributorsInfoQuery.RequesterId || construction.ConstructionDiary.DiaryContributors.Select(c => c.ContributorId).Contains(contributorsInfoQuery.RequesterId),
            StatusCodes.Status403Forbidden,
            "Only owner of the construction and diary contributors can see all contributors info");

        return construction.ConstructionDiary;
    }

    public static async Task<QueryCollectionResponse<DiaryContributorInfo>> Handle(GetAllDiaryContributorsInfoQuery contributorsInfoQuery,
        ConstructionDiary diary, UserManager<ApplicationUser> userManager)
    {
        var contributorInfos = new List<DiaryContributorInfo>();
        foreach (var contributor in diary.DiaryContributors)
        {
            var user = await userManager.FindByIdAsync(contributor.ContributorId.ToString());
            StatusCodeGuard.IsNotNull(user, StatusCodes.Status404NotFound,
                "Contributor not found in the database");

            var contributorInfo = new DiaryContributorInfo(contributor.ContributorId,
                user.FirstName + " " + user.LastName, user.Email!, contributor.ContributorRole);
            contributorInfos.Add(contributorInfo);
        }

        return new QueryCollectionResponse<DiaryContributorInfo>(contributorInfos);
    }
}