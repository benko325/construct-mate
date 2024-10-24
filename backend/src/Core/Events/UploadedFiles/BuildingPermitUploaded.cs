namespace ConstructMate.Core.Events.UploadedFiles;

public record BuildingPermitUploaded(Guid ConstructionId, string BuildingPermitPath);
