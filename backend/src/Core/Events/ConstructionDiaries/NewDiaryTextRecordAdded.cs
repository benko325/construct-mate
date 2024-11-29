namespace ConstructMate.Core.Events.ConstructionDiaries;

public record NewDiaryTextRecordAdded(
    Guid DiaryId,
    string Content,
    string ContributorName,
    DiaryContributorRole ContributorRole,
    DateTime CreatedAt);