namespace ConstructMate.Core.Events.Constructions;

public record ConstructionDiaryContributorAdded(Guid ConstructionId, Guid ContributorId, string ContributorRole);
