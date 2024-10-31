namespace ConstructMate.Core;

public class Construction
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required string ProfilePictureUrl { get; set; } = Constants.DefaultConstructionProfilePictureUrl;
    public string? BuildingPermitFileUrl { get; set; } = null;
    public string? ConstructionApprovalFileUrl { get; set; } = null;
    public string? ConstructionHandoverFileUrl { get; set; } = null;
    public Guid OwnerId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<UploadedFile> Files { get; set; } = [];
    public ConstructionDiary? ConstructionDiary { get; set; }
    public List<DiaryContributor> DiaryContributors { get; set; } = [];
}

public class DiaryContributor
{
    public Guid ContributorId { get; set; }
    public required string ContributorRole { get; set; } //enum???
}
