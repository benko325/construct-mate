namespace ConstructMate.Core.Events.ConstructionDiaries;

public record ConstructionDiaryContributorAdded(Guid ConstructionId, Guid ContributorId, DiaryContributorRole ContributorRole);
