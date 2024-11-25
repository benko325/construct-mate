namespace ConstructMate.Core.Events.UploadedFiles;

public record FileDeletedFromConstruction(Guid ConstructionId, Guid FileId);