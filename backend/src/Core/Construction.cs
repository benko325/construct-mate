namespace ConstructMate.Core;

public class Construction
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required string ProfilePictureUrl { get; set; } = Constants.DefaultConstructionProfilePictureUrl;
    public string? BuildingPermitFileUrl { get; set; } = null; // stavebne povolenie
    public string? ConstructionApprovalFileUrl { get; set; } = null; // kolaudacia
    public string? ConstructionHandoverFileUrl { get; set; } = null;  // odovzdanie stavby
    public Guid OwnerId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public List<UploadedFile> Files { get; set; } = [];
    public ConstructionDiary? ConstructionDiary { get; set; }
}
