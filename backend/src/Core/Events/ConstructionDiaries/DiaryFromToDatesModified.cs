namespace ConstructMate.Core.Events.ConstructionDiaries;

public record DiaryFromToDatesModified(Guid DiaryId, DateOnly NewDateFrom, DateOnly NewDateTo);