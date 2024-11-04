namespace ConstructMate.Core.Events.ConstructionDiaries;

public record NewDiaryPictureRecordAdded(Guid DiaryId, string FilePath, string ContributorName, DiaryContributorRole ContributorRole);