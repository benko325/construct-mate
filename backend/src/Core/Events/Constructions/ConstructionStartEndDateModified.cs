namespace ConstructMate.Core.Events.Constructions;

public record ConstructionStartEndDateModified(Guid ConstructionId, DateTime NewStartDate, DateTime NewEndDate);