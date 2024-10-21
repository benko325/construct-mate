namespace ConstructMate.Core.Events.Constructions;

public record ConstructionCreated(Guid Id, string Name, string? Description, Guid OwnerId);
