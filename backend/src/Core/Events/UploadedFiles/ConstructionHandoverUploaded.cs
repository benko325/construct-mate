namespace ConstructMate.Core.Events.UploadedFiles;

public record ConstructionHandoverUploaded(Guid ConstructionId, string ConstructionHandoverPath);
