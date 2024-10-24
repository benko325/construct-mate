namespace ConstructMate.Core;

public class Construction
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required string ProfilePictureUrl { get; set; } = Constants.DefaultConstructionProfilePictureUrl;
    public string? BuildingPermitFileUrl { get; set; } = null;
    public string? ConstructionApprovalFileUrl { get; set; } = null;
    public string? HandoverOfConstructionFileUrl { get; set; } = null;
    public Guid OwnerId { get; set; }
    public List<UploadedFile> Files { get; set; } = [];
    // public ConstructionDiary ConstructionDiary { get; set; }
}
