namespace ConstructMate.Core.Events.UploadedFiles;

public record ProfilePictureUploaded(Guid ConstructionId, string NewProfilePictureUrl);
