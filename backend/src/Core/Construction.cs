namespace ConstructMate.Core;

public class Construction
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public Guid OwnerId { get; set; }
}
