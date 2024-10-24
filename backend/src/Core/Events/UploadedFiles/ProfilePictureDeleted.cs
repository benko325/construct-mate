namespace ConstructMate.Core.Events.UploadedFiles;

public record ProfilePictureDeleted(Guid ConstructionId, string NewProfilePictureUrl);
