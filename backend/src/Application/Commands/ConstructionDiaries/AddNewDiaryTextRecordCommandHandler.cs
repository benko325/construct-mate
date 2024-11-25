using ConstructMate.Core;
using ConstructMate.Core.Events.ConstructionDiaries;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Marten;

namespace ConstructMate.Application.Commands.ConstructionDiaries;

/// <summary>
/// Add new text record to the construction diary command
/// </summary>
/// <param name="DiaryId">Id of the diary where a new record has to be added</param>
/// <param name="Content">Text content of the record</param>
/// <param name="RequesterId">Id of user who sent the request</param>
/// <param name="RecordCategory">Category of the record</param>
public record AddNewDiaryTextRecordCommand(Guid DiaryId, string Content, Guid RequesterId, DiaryRecordCategory RecordCategory);

/// <summary>
/// Add new text record to the construction diary
/// </summary>
public class AddNewDiaryTextRecordCommandHandler
{
    public static async Task<Construction> LoadAsync(AddNewDiaryTextRecordCommand diaryCommand,
        IQuerySession session, CancellationToken cancellationToken)
    {
        var construction = await session.Query<Construction>()
            .Where(c => c.ConstructionDiary != null && c.ConstructionDiary.Id == diaryCommand.DiaryId)
            .FirstOrDefaultAsync(cancellationToken);
        StatusCodeGuard.IsNotNull(construction, StatusCodes.Status404NotFound,
            "Construction for the diary not found");
        StatusCodeGuard.IsNotNull(construction.ConstructionDiary, StatusCodes.Status404NotFound,
            "Diary not found in construction");

        var contributorIds = construction.ConstructionDiary.DiaryContributors
            .Select(d => d.ContributorId)
            .ToList();
        StatusCodeGuard.IsTrue(diaryCommand.RequesterId == construction.OwnerId || contributorIds.Contains(diaryCommand.RequesterId),
            StatusCodes.Status403Forbidden, "User can not contribute to this diary, add him asd a contributor first");

        return construction;
    }

    public static async Task<NewDiaryTextRecordAdded> Handle(AddNewDiaryTextRecordCommand diaryCommand,
        Construction construction, IDocumentSession session, CancellationToken cancellationToken)
    {
        // diary and construction nullability checked in LoadAsync
        var contributorRole = diaryCommand.RequesterId == construction.OwnerId
            ? DiaryContributorRole.ConstructionManager
            : construction.ConstructionDiary!.DiaryContributors
                .Where(c => c.ContributorId == diaryCommand.RequesterId)
                .Select(c => c.ContributorRole)
                .First();
        var contributor = await session.LoadAsync<ApplicationUser>(diaryCommand.RequesterId, cancellationToken);
        StatusCodeGuard.IsNotNull(contributor, StatusCodes.Status500InternalServerError,
            "User with Id from token not found");
        var contributorName = contributor.FirstName + " " + contributor.LastName;
        

        var diaryRecord = new DiaryRecord()
        {
            Content = diaryCommand.Content,
            AuthorRole = contributorRole,
            AuthorName = contributorName
        };

        // if the day when request was sent is later than the DiaryDateTo, create new DailyRecord and update DiaryDateTo
        if (DateOnly.FromDateTime(DateTime.Now) > construction.ConstructionDiary!.DiaryDateTo)
        {
            construction.ConstructionDiary.DiaryDateTo = DateOnly.FromDateTime(DateTime.Now);
            var newDailyRecord = new DailyRecord() { Date = DateOnly.FromDateTime(DateTime.Now) };
            construction.ConstructionDiary.DailyRecords.Add(newDailyRecord);
        }

        var dailyRecord = construction.ConstructionDiary.DailyRecords
            .FirstOrDefault(r => r.Date == DateOnly.FromDateTime(DateTime.Now));
        StatusCodeGuard.IsNotNull(dailyRecord, StatusCodes.Status500InternalServerError, "Daily record is not here"); // should never happen
        
        switch (diaryCommand.RecordCategory)
        {
            case DiaryRecordCategory.Weather:
                dailyRecord.Weather.Add(diaryRecord);
                break;
            case DiaryRecordCategory.Workers:
                dailyRecord.Workers.Add(diaryRecord);
                break;
            case DiaryRecordCategory.Machines:
                dailyRecord.Machines.Add(diaryRecord);
                break;
            case DiaryRecordCategory.Work:
                dailyRecord.Work.Add(diaryRecord);
                break;
            case DiaryRecordCategory.OtherRecords:
                dailyRecord.OtherRecords.Add(diaryRecord);
                break;
            case DiaryRecordCategory.None:
            default:
                break;
        }
        
        session.Update(construction);
        await session.SaveChangesAsync(cancellationToken);

        return new NewDiaryTextRecordAdded(construction.ConstructionDiary.Id, diaryRecord.Content, contributorName, contributorRole);
    }
}