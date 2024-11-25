namespace ConstructMate.Core.Events.UploadedFiles;

public record FileUploadedToConstruction(Guid ConstructionId, Guid Id, string FilePath, long FileSize, DateTime CreatedAt);