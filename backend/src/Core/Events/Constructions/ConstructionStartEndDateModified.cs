namespace ConstructMate.Core.Events.Constructions;

public record ConstructionStartEndDateModified(Guid ConstructionId, DateOnly NewStartDate, DateOnly NewEndDate);