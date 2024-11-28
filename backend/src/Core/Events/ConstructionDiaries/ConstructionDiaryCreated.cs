namespace ConstructMate.Core.Events.ConstructionDiaries;

public record ConstructionDiaryCreated(
    Guid ConstructionId,
    Guid Id,
    DateTime CreatedAt,
    DateOnly DiaryDateFrom,
    DateOnly DiaryDateTo,
    string ConstructionManager,
    string ConstructionSupervisor,
    string ConstructionApproval,
    string Name,
    string Address,
    string Investor,
    string Implementer,
    List<DiaryContributor> DiaryContributors,
    List<DailyRecord> DailyRecords);