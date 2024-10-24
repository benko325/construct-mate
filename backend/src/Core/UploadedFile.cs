namespace ConstructMate.Core;

public class UploadedFile
{
    public Guid Id { get; set; }
    // path structure: <Constants.FilesFolder>/<UserId>/<ConstructionId>/<FileName>
    public required string FilePath { get; set; }
    public FilePurpose FilePurpose { get; set; }
    public long FileSize { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
