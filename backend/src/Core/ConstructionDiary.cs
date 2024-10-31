namespace ConstructMate.Core;

public class ConstructionDiary
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public required string ConstructionManager { get; set; } //stavbyveduci
    public required string ConstructionSupervisor { get; set; } //stavebny dozor
    public required string Name { get; set; } //nazov
    public string? Description { get; set; } //volitelne detaily
    public required string Address { get; set; } //presna adresa alebo priblizna
    public required string ConstructionApproval { get; set; } //stavebne povolenie
    public required string Investor { get; set; } //investor
    public required string Implementer { get; set; } //realizator
    public List<DailyRecord> DailyRecords { get; set; } = [];
    // prilohy, navstevy a export do pdf !!!!
}

public class DailyRecord
{
    public DateTime Date { get; set; }
    public List<DiaryRecord> Weather { get; set; } = [];
    public List<DiaryRecord> Workers { get; set; } = [];
    public List<DiaryRecord> Machines { get; set; } = [];
    public List<DiaryRecord> Work { get; set; } = [];
    public List<DiaryRecord> OtherRecords { get; set; } = [];
}

public class DiaryRecord
{
    public required string Content { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid AuthorId { get; set; }
}
