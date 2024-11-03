namespace ConstructMate.Application.Queries.Responses;

/// <summary>
/// Diary's first and last day that contains any record
/// </summary>
/// <param name="DiaryId">Id of diary</param>
/// <param name="FirstDay">First day with any record (if null with LastDay then no record is in the diary)</param>
/// <param name="LastDay">Last day with any record (if null with FirstDay then no record is in the diary)</param>
public record DiaryFirstLastDayWithRecords(Guid DiaryId, DateOnly? FirstDay, DateOnly? LastDay);