namespace ConstructMate.Core.Events.UploadedFiles;

public record ConstructionApprovalUploaded(Guid ConstructionId, string ConstructionApprovalPath);
